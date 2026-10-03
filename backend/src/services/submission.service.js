import { Submission } from "../models/Submission.js";
import { Problem } from "../models/Problem.js";
import { Contest } from "../models/Contest.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { executeCode, mapVerdict, outputsMatch } from "../utils/judge0.js";
import { VERDICTS, CONTEST_STATUS } from "../config/constants.js";

/**
 * Run code against sample test cases only (no DB save unless save=true)
 */
export const runOnSamples = async ({
  problemId,
  language,
  code,
  userId,
  save = false,
  contestId = null,
}) => {
  const problem = await Problem.findById(problemId);
  if (!problem) throw ApiError.notFound("Problem not found");

  const results = [];
  let overallVerdict = VERDICTS.AC;

  for (let i = 0; i < problem.sampleTestCases.length; i++) {
    const tc = problem.sampleTestCases[i];

    const judgeResult = await executeCode({
      sourceCode: code,
      language,
      stdin: tc.input,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    });

    const verdict = mapVerdict(judgeResult);
    const actualOutput = judgeResult.stdout || "";

    let finalVerdict = verdict;
    if (verdict === "AC" && !outputsMatch(actualOutput, tc.output)) {
      finalVerdict = "WA";
    }

    if (finalVerdict !== "AC" && overallVerdict === "AC") {
      overallVerdict = finalVerdict;
    }

    results.push({
      testCaseIndex: i,
      status: finalVerdict,
      stdout: actualOutput,
      stderr: judgeResult.stderr || judgeResult.compile_output || "",
      runtime: parseFloat(judgeResult.time) || 0,
      memory: judgeResult.memory || 0,
      expectedOutput: tc.output,
      input: tc.input,
      isSample: true,
    });
  }

  let savedSubmission = null;
  if (save) {
    savedSubmission = await Submission.create({
      user: userId,
      problem: problemId,
      contest: contestId,
      language,
      code,
      verdict: VERDICTS[overallVerdict] || overallVerdict,
      runtime: results[0]?.runtime || 0,
      memory: results[0]?.memory || 0,
      passedTestCases: results.filter((r) => r.status === "AC").length,
      totalTestCases: results.length,
      testCaseResults: results,
      isSampleRun: true,
    });
  }

  return {
    verdict: overallVerdict,
    results,
    submission: savedSubmission,
  };
};

/**
 * Full submission — run against ALL test cases (samples + hidden)
 * Saves submission, updates user stats + problem stats + contest leaderboard
 */
export const submitSolution = async ({
  problemId,
  language,
  code,
  userId,
  contestId = null,
}) => {
  const problem = await Problem.findById(problemId).select("+hiddenTestCases");
  if (!problem) throw ApiError.notFound("Problem not found");

  // If contest submission, validate contest is live and user is registered
  let contest = null;
  if (contestId) {
    contest = await Contest.findById(contestId).select("+participants");
    if (!contest) throw ApiError.notFound("Contest not found");

    const now = new Date();
    if (now < contest.startTime) {
      throw ApiError.badRequest("Contest has not started yet");
    }
    if (now > contest.endTime) {
      throw ApiError.badRequest("Contest has ended");
    }

    const participant = contest.participants.find(
      (p) => p.user.toString() === userId.toString()
    );
    if (!participant) {
      throw ApiError.forbidden("You are not registered for this contest");
    }

    // Check if problem belongs to contest
    const contestProblem = contest.problems.find(
      (p) => p.problem.toString() === problemId.toString()
    );
    if (!contestProblem) {
      throw ApiError.badRequest("Problem is not part of this contest");
    }
  }

  const allTestCases = [
    ...problem.sampleTestCases.map((tc) => ({ ...tc, isSample: true })),
    ...problem.hiddenTestCases.map((tc) => ({ ...tc, isSample: false })),
  ];

  const results = [];
  let overallVerdict = "AC";
  let maxRuntime = 0;
  let maxMemory = 0;

  for (let i = 0; i < allTestCases.length; i++) {
    const tc = allTestCases[i];

    const judgeResult = await executeCode({
      sourceCode: code,
      language,
      stdin: tc.input,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    });

    const verdict = mapVerdict(judgeResult);
    const actualOutput = judgeResult.stdout || "";

    let finalVerdict = verdict;
    if (verdict === "AC" && !outputsMatch(actualOutput, tc.output)) {
      finalVerdict = "WA";
    }

    if (finalVerdict !== "AC" && overallVerdict === "AC") {
      overallVerdict = finalVerdict;
    }

    maxRuntime = Math.max(maxRuntime, parseFloat(judgeResult.time) || 0);
    maxMemory = Math.max(maxMemory, judgeResult.memory || 0);

    results.push({
      testCaseIndex: i,
      status: finalVerdict,
      stdout: tc.isSample ? actualOutput : "", // hide stdout for hidden tests
      stderr: judgeResult.stderr || judgeResult.compile_output || "",
      runtime: parseFloat(judgeResult.time) || 0,
      memory: judgeResult.memory || 0,
      isSample: tc.isSample,
    });
  }

  const passedCount = results.filter((r) => r.status === "AC").length;

  // Save submission
  const submission = await Submission.create({
    user: userId,
    problem: problemId,
    contest: contestId,
    language,
    code,
    verdict: VERDICTS[overallVerdict] || overallVerdict,
    runtime: maxRuntime,
    memory: maxMemory,
    passedTestCases: passedCount,
    totalTestCases: results.length,
    testCaseResults: results,
    isSampleRun: false,
  });

  // Update problem stats
  problem.totalSubmissions += 1;
  if (overallVerdict === "AC") {
    problem.acceptedSubmissions += 1;
  }
  await problem.save();

  // Update user stats
  const user = await User.findById(userId);
  user.stats.totalSubmissions += 1;
  if (overallVerdict === "AC") {
    user.stats.acceptedSubmissions += 1;
    if (!user.solvedProblems.some((id) => id.toString() === problemId.toString())) {
      user.solvedProblems.push(problemId);
    }
  }
  await user.save();

  // Update contest leaderboard
  if (contest) {
    await updateContestLeaderboard({
      contest,
      userId,
      problemId,
      verdict: overallVerdict,
      submittedAt: new Date(),
    });
  }

  return {
    verdict: overallVerdict,
    passedTestCases: passedCount,
    totalTestCases: results.length,
    runtime: maxRuntime,
    memory: maxMemory,
    submission,
  };
};

/**
 * Update contest participant score when a submission arrives
 * ICPC-style scoring: score += points if AC, penalty += time + 20*attempts
 */
const updateContestLeaderboard = async ({
  contest,
  userId,
  problemId,
  verdict,
  submittedAt,
}) => {
  const participant = contest.participants.find(
    (p) => p.user.toString() === userId.toString()
  );
  if (!participant) return;

  const contestProblem = contest.problems.find(
    (p) => p.problem.toString() === problemId.toString()
  );
  if (!contestProblem) return;

  const points = contestProblem.points;

  // Find if user already solved this problem
  const solvedEntry = participant.solvedProblems.find(
    (sp) => sp.problem.toString() === problemId.toString()
  );

  if (verdict === "AC") {
    if (!solvedEntry) {
      // First time solving
      const minutesFromStart = Math.floor(
        (submittedAt - contest.startTime) / 60000
      );
      participant.solvedProblems.push({
        problem: problemId,
        solvedAt: submittedAt,
        attempts: 1,
      });
      participant.score += points;
      participant.penalty += minutesFromStart + 20; // 20 min base penalty
      participant.solvedCount += 1;
    }
    // If already solved — no change (first AC counts)
  } else {
    // Wrong attempt before AC → +20 min penalty
    if (!solvedEntry) {
      if (solvedEntry === undefined) {
        // Create a pending attempt tracker
        const existing = participant.solvedProblems.find(
          (sp) => sp.problem.toString() === problemId.toString()
        );
        if (!existing) {
          // Track failed attempts separately
          participant.penalty += 0; // will add 20 on AC
          participant.failedAttempts =
            (participant.failedAttempts || 0) + 1;
        }
      }
    }
  }

  // Re-rank participants
  const sorted = [...contest.participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.penalty - b.penalty;
  });
  sorted.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  // Update status field based on times
  const now = new Date();
  if (now < contest.startTime) contest.status = CONTEST_STATUS.UPCOMING;
  else if (now > contest.endTime) contest.status = CONTEST_STATUS.ENDED;
  else contest.status = CONTEST_STATUS.LIVE;

  await contest.save();
};

/**
 * Get current user's submissions (optionally filtered)
 */
export const getMySubmissions = async (
  userId,
  { page = 1, limit = 20, problemId, contestId } = {}
) => {
  const filter = { user: userId };
  if (problemId) filter.problem = problemId;
  if (contestId) filter.contest = contestId;

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Submission.find(filter)
      .populate("problem", "title slug difficulty")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Submission.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Get a single submission by id (only owner or admin)
 */
export const getSubmissionById = async (submissionId, userId, isAdmin) => {
  const submission = await Submission.findById(submissionId)
    .populate("problem", "title slug difficulty")
    .populate("user", "name email");

  if (!submission) throw ApiError.notFound("Submission not found");

  if (
    !isAdmin &&
    submission.user._id.toString() !== userId.toString()
  ) {
    throw ApiError.forbidden("Not authorized to view this submission");
  }

  return submission;
};
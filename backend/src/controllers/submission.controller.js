import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/apiResponse.js";
import * as submissionService from "../services/submission.service.js";
import { ROLES } from "../config/constants.js";

/**
 * POST /api/submissions/run
 * Body: { problemId, language, code, contestId? }
 * Runs against sample tests only
 */
export const runCode = asyncHandler(async (req, res) => {
  const { problemId, language, code, contestId } = req.body;

  const result = await submissionService.runOnSamples({
    problemId,
    language,
    code,
    userId: req.user._id,
    save: false,
    contestId: contestId || null,
  });

  return sendSuccess(res, result, "Run complete");
});

/**
 * POST /api/submissions/submit
 * Full submission against all test cases
 */
export const submitCode = asyncHandler(async (req, res) => {
  const { problemId, language, code, contestId } = req.body;

  const result = await submissionService.submitSolution({
    problemId,
    language,
    code,
    userId: req.user._id,
    contestId: contestId || null,
  });

  return sendCreated(res, result, `Verdict: ${result.verdict}`);
});

/**
 * GET /api/submissions/my
 */
export const getMySubmissions = asyncHandler(async (req, res) => {
  const { items, pagination } = await submissionService.getMySubmissions(
    req.user._id,
    {
      page: req.query.page,
      limit: req.query.limit,
      problemId: req.query.problemId,
      contestId: req.query.contestId,
    }
  );

  return sendSuccess(
    res,
    { submissions: items, pagination },
    "Submissions fetched"
  );
});

/**
 * GET /api/submissions/:id
 */
export const getSubmission = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === ROLES.ADMIN;
  const submission = await submissionService.getSubmissionById(
    req.params.id,
    req.user._id,
    isAdmin
  );

  return sendSuccess(res, { submission }, "Submission fetched");
});
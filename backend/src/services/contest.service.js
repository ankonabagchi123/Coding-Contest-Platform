import { Contest } from "../models/Contest.js";
import { Problem } from "../models/Problem.js";
import { Registration } from "../models/Registration.js";
import { ApiError } from "../utils/apiError.js";
import { CONTEST_STATUS } from "../config/constants.js";

/**
 * Helper — compute live status from times
 */
const computeStatus = (contest) => {
  const now = new Date();
  if (now < contest.startTime) return CONTEST_STATUS.UPCOMING;
  if (now > contest.endTime) return CONTEST_STATUS.ENDED;
  return CONTEST_STATUS.LIVE;
};

/**
 * Attach computed fields to a contest object before returning it.
 */
const decorate = (contest) => {
  if (!contest) return contest;
  const obj = contest.toObject ? contest.toObject() : { ...contest };
  obj.status = computeStatus(obj);
  obj.participantCount = obj.participants?.length || 0;
  return obj;
};

/**
 * Create a contest (admin)
 */
export const createContest = async (data, userId) => {
  // Validate that all referenced problems exist
  const problemIds = data.problems.map((p) => p.problem);
  const found = await Problem.find({ _id: { $in: problemIds } }).select("_id");

  if (found.length !== problemIds.length) {
    throw ApiError.badRequest("One or more problem ids are invalid");
  }

  const contest = await Contest.create({
    ...data,
    createdBy: userId,
  });

  return decorate(contest);
};

/**
 * List contests with computed status filters
 */
export const listContests = async ({
  page = 1,
  limit = 20,
  status,
  search,
  includeUnpublished = false,
}) => {
  const now = new Date();
  const filter = {};

  if (!includeUnpublished) filter.isPublished = true;

  // Filter by computed status using time ranges
  if (status === CONTEST_STATUS.UPCOMING) {
    filter.startTime = { $gt: now };
  } else if (status === CONTEST_STATUS.LIVE) {
    filter.startTime = { $lte: now };
    filter.endTime = { $gte: now };
  } else if (status === CONTEST_STATUS.ENDED) {
    filter.endTime = { $lt: now };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Contest.find(filter)
      .select("-participants -password -problems.starterCode")
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Contest.countDocuments(filter),
  ]);

  return {
    items: items.map(decorate),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Get single contest by slug (public)
 * Hides problems before start time
 */
export const getContestBySlug = async (slug, userId) => {
  const contest = await Contest.findOne({ slug, isPublished: true })
    .select("+participants")
    .populate("problems.problem", "title slug difficulty tags");

  if (!contest) throw ApiError.notFound("Contest not found");

  const obj = decorate(contest);
  const status = obj.status;

  // Hide problem details before contest starts (unless admin)
  if (status === CONTEST_STATUS.UPCOMING) {
    obj.problems = obj.problems.map((p) => ({
      label: p.label,
      points: p.points,
      order: p.order,
      problem: {
        title: "Hidden",
        slug: null,
        difficulty: null,
        tags: [],
      },
    }));
  }

  // Attach "isRegistered" flag if user is logged in
  if (userId) {
    obj.isRegistered = contest.participants.some(
      (p) => p.user.toString() === userId.toString()
    );
  } else {
    obj.isRegistered = false;
  }

  // Strip participants data from public response
  delete obj.participants;

  return obj;
};

/**
 * Get contest by id (admin — full view)
 */
export const getContestByIdAdmin = async (id) => {
  const contest = await Contest.findById(id)
    .select("+participants +password")
    .populate("problems.problem");

  if (!contest) throw ApiError.notFound("Contest not found");
  return decorate(contest);
};

/**
 * Update contest (admin)
 */
export const updateContest = async (id, updates) => {
  const contest = await Contest.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("+participants");

  if (!contest) throw ApiError.notFound("Contest not found");
  return decorate(contest);
};

/**
 * Delete contest (admin)
 */
export const deleteContest = async (id) => {
  const contest = await Contest.findByIdAndDelete(id);
  if (!contest) throw ApiError.notFound("Contest not found");

  // Clean up registrations
  await Registration.deleteMany({ contest: id });

  return contest;
};

/**
 * Register current user for a contest
 */
export const registerForContest = async (contestId, userId) => {
  const contest = await Contest.findById(contestId).select("+participants");
  if (!contest) throw ApiError.notFound("Contest not found");

  const status = computeStatus(contest);
  if (status === CONTEST_STATUS.ENDED) {
    throw ApiError.badRequest("Contest has ended");
  }

  // Max participants check
  if (
    contest.maxParticipants > 0 &&
    contest.participants.length >= contest.maxParticipants
  ) {
    throw ApiError.badRequest("Contest is full");
  }

  // Already registered?
  const already = contest.participants.some(
    (p) => p.user.toString() === userId.toString()
  );
  if (already) {
    throw ApiError.conflict("You are already registered for this contest");
  }

  // Add to participants
  contest.participants.push({
    user: userId,
    score: 0,
    penalty: 0,
    solvedCount: 0,
  });
  await contest.save();

  // Track in separate registration collection
  try {
    await Registration.create({ contest: contestId, user: userId });
  } catch (err) {
    // ignore duplicate key — user was already tracked
    if (err.code !== 11000) throw err;
  }

  return { registered: true, contestId };
};

/**
 * Unregister current user from a contest
 * Only allowed before contest starts
 */
export const unregisterFromContest = async (contestId, userId) => {
  const contest = await Contest.findById(contestId).select("+participants");
  if (!contest) throw ApiError.notFound("Contest not found");

  const status = computeStatus(contest);
  if (status !== CONTEST_STATUS.UPCOMING) {
    throw ApiError.badRequest(
      "You can only unregister before the contest starts"
    );
  }

  const before = contest.participants.length;
  contest.participants = contest.participants.filter(
    (p) => p.user.toString() !== userId.toString()
  );

  if (contest.participants.length === before) {
    throw ApiError.badRequest("You are not registered for this contest");
  }

  await contest.save();
  await Registration.deleteOne({ contest: contestId, user: userId });

  return { unregistered: true };
};

/**
 * Get contest problems — only visible after start time (or to admin)
 */
export const getContestProblems = async (contestId, userId, isAdmin = false) => {
  const contest = await Contest.findById(contestId)
    .select("+participants")
    .populate("problems.problem", "-hiddenTestCases -editorial");

  if (!contest) throw ApiError.notFound("Contest not found");

  const status = computeStatus(contest);
  if (status === CONTEST_STATUS.UPCOMING && !isAdmin) {
    throw ApiError.forbidden("Contest has not started yet");
  }

  // Must be registered (unless admin)
  if (!isAdmin) {
    const isRegistered = contest.participants.some(
      (p) => p.user.toString() === userId.toString()
    );
    if (!isRegistered) {
      throw ApiError.forbidden("You are not registered for this contest");
    }
  }

  const sorted = [...contest.problems].sort((a, b) => a.order - b.order);

  return {
    contest: {
      id: contest._id,
      title: contest.title,
      startTime: contest.startTime,
      endTime: contest.endTime,
      status,
    },
    problems: sorted,
  };
};

/**
 * Get contest leaderboard (ICPC-style)
 */
export const getLeaderboard = async (contestId) => {
  const contest = await Contest.findById(contestId)
    .select("+participants title startTime endTime")
    .populate("participants.user", "name email rating");

  if (!contest) throw ApiError.notFound("Contest not found");

  const now = new Date();
  const isLive = now >= contest.startTime && now <= contest.endTime;

  // Sort: score desc, penalty asc, registeredAt asc
  const ranked = [...contest.participants]
    .map((p) => {
      const userDoc = p.user || {};
      return {
        userId: userDoc._id,
        name: userDoc.name || "Unknown",
        email: userDoc.email,
        rating: userDoc.rating,
        score: p.score,
        penalty: p.penalty,
        solvedCount: p.solvedCount,
        registeredAt: p.registeredAt,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.penalty !== b.penalty) return a.penalty - b.penalty;
      return new Date(a.registeredAt) - new Date(b.registeredAt);
    })
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return {
    contest: {
      id: contest._id,
      title: contest.title,
      startTime: contest.startTime,
      endTime: contest.endTime,
      isLive,
    },
    leaderboard: ranked,
  };
};

/**
 * Get contests the current user is registered for
 */
export const getMyContests = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { "participants.user": userId, isPublished: true };

  const [items, total] = await Promise.all([
    Contest.find(filter)
      .select("-participants -password")
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Contest.countDocuments(filter),
  ]);

  return {
    items: items.map(decorate),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};
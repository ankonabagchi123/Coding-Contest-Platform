import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/apiResponse.js";
import * as contestService from "../services/contest.service.js";
import { ROLES } from "../config/constants.js";

const isAdmin = (user) => user?.role === ROLES.ADMIN;

/**
 * POST /api/contests  (admin)
 */
export const createContest = asyncHandler(async (req, res) => {
  const contest = await contestService.createContest(req.body, req.user._id);
  return sendCreated(res, { contest }, "Contest created");
});

/**
 * GET /api/contests
 */
export const listContests = asyncHandler(async (req, res) => {
  const { items, pagination } = await contestService.listContests({
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    search: req.query.search,
    includeUnpublished: isAdmin(req.user),
  });

  return sendSuccess(res, { contests: items, pagination }, "Contests fetched");
});

/**
 * GET /api/contests/my  (auth)
 */
export const getMyContests = asyncHandler(async (req, res) => {
  const { items, pagination } = await contestService.getMyContests(req.user._id, {
    page: req.query.page,
    limit: req.query.limit,
  });

  return sendSuccess(res, { contests: items, pagination }, "My contests");
});

/**
 * GET /api/contests/id/:id  (admin)
 */
export const getContestAdmin = asyncHandler(async (req, res) => {
  const contest = await contestService.getContestByIdAdmin(req.params.id);
  return sendSuccess(res, { contest }, "Contest fetched (admin)");
});

/**
 * GET /api/contests/:slug
 */
export const getContest = asyncHandler(async (req, res) => {
  const contest = await contestService.getContestBySlug(
    req.params.slug,
    req.user?._id
  );
  return sendSuccess(res, { contest }, "Contest fetched");
});

/**
 * PATCH /api/contests/:id  (admin)
 */
export const updateContest = asyncHandler(async (req, res) => {
  const contest = await contestService.updateContest(req.params.id, req.body);
  return sendSuccess(res, { contest }, "Contest updated");
});

/**
 * DELETE /api/contests/:id  (admin)
 */
export const deleteContest = asyncHandler(async (req, res) => {
  await contestService.deleteContest(req.params.id);
  return sendSuccess(res, null, "Contest deleted");
});

/**
 * POST /api/contests/:id/register  (auth)
 */
export const register = asyncHandler(async (req, res) => {
  const result = await contestService.registerForContest(
    req.params.id,
    req.user._id
  );
  return sendSuccess(res, result, "Registered for contest");
});

/**
 * DELETE /api/contests/:id/register  (auth)
 */
export const unregister = asyncHandler(async (req, res) => {
  const result = await contestService.unregisterFromContest(
    req.params.id,
    req.user._id
  );
  return sendSuccess(res, result, "Unregistered from contest");
});

/**
 * GET /api/contests/:id/problems  (auth)
 */
export const getProblems = asyncHandler(async (req, res) => {
  const result = await contestService.getContestProblems(
    req.params.id,
    req.user._id,
    isAdmin(req.user)
  );
  return sendSuccess(res, result, "Contest problems fetched");
});

/**
 * GET /api/contests/:id/leaderboard
 */
export const getLeaderboard = asyncHandler(async (req, res) => {
  const result = await contestService.getLeaderboard(req.params.id);
  return sendSuccess(res, result, "Leaderboard fetched");
});
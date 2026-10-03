import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/apiResponse.js";
import * as problemService from "../services/problem.service.js";

/**
 * POST /api/problems  (admin)
 */
export const createProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.createProblem(req.body, req.user._id);
  return sendCreated(res, { problem }, "Problem created");
});

/**
 * GET /api/problems
 */
export const listProblems = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  const { items, pagination } = await problemService.listProblems({
    page: req.query.page,
    limit: req.query.limit,
    difficulty: req.query.difficulty,
    tags: req.query.tags,
    search: req.query.search,
    includeUnpublished: isAdmin,
  });

  return sendSuccess(res, { problems: items, pagination }, "Problems fetched");
});

/**
 * GET /api/problems/:slug
 */
export const getProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.getProblemBySlug(req.params.slug);
  return sendSuccess(res, { problem }, "Problem fetched");
});

/**
 * GET /api/problems/id/:id  (admin — includes hidden test cases)
 */
export const getProblemAdmin = asyncHandler(async (req, res) => {
  const problem = await problemService.getProblemByIdAdmin(req.params.id);
  return sendSuccess(res, { problem }, "Problem fetched (admin)");
});

/**
 * PATCH /api/problems/:id  (admin)
 */
export const updateProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.updateProblem(req.params.id, req.body);
  return sendSuccess(res, { problem }, "Problem updated");
});

/**
 * DELETE /api/problems/:id  (admin)
 */
export const deleteProblem = asyncHandler(async (req, res) => {
  await problemService.deleteProblem(req.params.id);
  return sendSuccess(res, null, "Problem deleted");
});
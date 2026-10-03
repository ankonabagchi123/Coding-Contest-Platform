import { Problem } from "../models/Problem.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Create a problem
 */
export const createProblem = async (data, userId) => {
  const problem = await Problem.create({
    ...data,
    createdBy: userId,
  });

  return problem;
};

/**
 * List problems with filters + pagination.
 * Only returns public fields. Hidden test cases never come back.
 */
export const listProblems = async ({
  page = 1,
  limit = 20,
  difficulty,
  tags,
  search,
  includeUnpublished = false,
}) => {
  const filter = {};

  if (!includeUnpublished) filter.isPublished = true;
  if (difficulty) filter.difficulty = difficulty;
  if (tags) {
    const tagList = String(tags)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tagList.length) filter.tags = { $in: tagList };
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Problem.find(filter)
      .select("-hiddenTestCases -editorial -hints -starterCode")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Problem.countDocuments(filter),
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
 * Get one problem by slug (public view — no hidden test cases, no editorial)
 */
export const getProblemBySlug = async (slug) => {
  const problem = await Problem.findOne({ slug, isPublished: true }).select(
    "-hiddenTestCases -editorial"
  );

  if (!problem) throw ApiError.notFound("Problem not found");
  return problem;
};

/**
 * Get one problem by id (for admin — includes hidden test cases)
 */
export const getProblemByIdAdmin = async (id) => {
  const problem = await Problem.findById(id).select("+hiddenTestCases");
  if (!problem) throw ApiError.notFound("Problem not found");
  return problem;
};

/**
 * Update a problem (admin)
 */
export const updateProblem = async (id, updates) => {
  const problem = await Problem.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("+hiddenTestCases");

  if (!problem) throw ApiError.notFound("Problem not found");
  return problem;
};

/**
 * Delete a problem (admin)
 */
export const deleteProblem = async (id) => {
  const problem = await Problem.findByIdAndDelete(id);
  if (!problem) throw ApiError.notFound("Problem not found");
  return problem;
};
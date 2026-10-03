import { body, param, query } from "express-validator";
import { DIFFICULTY } from "../config/constants.js";

const testCaseRule = (prefix) => [
  body(`${prefix}.*.input`).optional().isString().withMessage("Input must be a string"),
  body(`${prefix}.*.output`)
    .notEmpty()
    .withMessage("Expected output is required for each test case")
    .isString(),
  body(`${prefix}.*.explanation`).optional().isString(),
];

export const createProblemRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be 3–200 characters"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString(),

  body("summary")
    .optional()
    .isString()
    .isLength({ max: 300 })
    .withMessage("Summary cannot exceed 300 characters"),

  body("difficulty")
    .optional()
    .isIn(Object.values(DIFFICULTY))
    .withMessage(`Difficulty must be one of: ${Object.values(DIFFICULTY).join(", ")}`),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings"),

  body("constraints").optional().isString(),
  body("inputFormat").optional().isString(),
  body("outputFormat").optional().isString(),

  body("sampleTestCases")
    .isArray({ min: 1 })
    .withMessage("At least one sample test case is required"),

  body("hiddenTestCases")
    .isArray({ min: 1 })
    .withMessage("At least one hidden test case is required"),

  ...testCaseRule("sampleTestCases"),
  ...testCaseRule("hiddenTestCases"),

  body("timeLimit")
    .optional()
    .isFloat({ min: 0.5, max: 20 })
    .withMessage("Time limit must be between 0.5 and 20 seconds"),

  body("memoryLimit")
    .optional()
    .isInt({ min: 16000, max: 512000 })
    .withMessage("Memory limit must be between 16000 and 512000 KB"),

  body("hints").optional().isArray(),
  body("editorial").optional().isString(),
  body("isPublished").optional().isBoolean(),
];

export const updateProblemRules = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be 3–200 characters"),

  body("description").optional().isString(),
  body("summary").optional().isString().isLength({ max: 300 }),

  body("difficulty")
    .optional()
    .isIn(Object.values(DIFFICULTY))
    .withMessage("Invalid difficulty"),

  body("tags").optional().isArray(),
  body("sampleTestCases").optional().isArray({ min: 1 }),
  body("hiddenTestCases").optional().isArray({ min: 1 }),

  body("timeLimit").optional().isFloat({ min: 0.5, max: 20 }),
  body("memoryLimit").optional().isInt({ min: 16000, max: 512000 }),

  body("isPublished").optional().isBoolean(),
];

export const listProblemsRules = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be 1–100"),
  query("difficulty")
    .optional()
    .isIn(Object.values(DIFFICULTY))
    .withMessage("Invalid difficulty"),
  query("search").optional().isString().isLength({ max: 100 }),
  query("tags").optional().isString(),
];

export const problemIdRule = [
  param("id").isMongoId().withMessage("Invalid problem id"),
];

export const problemSlugRule = [
  param("slug").isString().notEmpty().withMessage("Slug is required"),
];
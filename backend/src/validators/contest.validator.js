import { body, param, query } from "express-validator";

export const createContestRules = [
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

  body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .isISO8601()
    .withMessage("Start time must be a valid ISO 8601 date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Start time must be in the future");
      }
      return true;
    }),

  body("endTime")
    .notEmpty()
    .withMessage("End time is required")
    .isISO8601()
    .withMessage("End time must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  body("problems")
    .isArray({ min: 1 })
    .withMessage("At least one problem is required"),

  body("problems.*.problem")
    .notEmpty()
    .withMessage("Each contest problem must reference a problem id")
    .isMongoId()
    .withMessage("Invalid problem id"),

  body("problems.*.points")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Points must be 1–1000"),

  body("problems.*.label")
    .optional()
    .isString()
    .isLength({ max: 5 })
    .withMessage("Label cannot exceed 5 characters"),

  body("problems.*.order").optional().isInt({ min: 0 }),

  body("rules").optional().isString(),
  body("isPublic").optional().isBoolean(),

  body("maxParticipants")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Max participants must be 0 or greater"),

  body("registrationEndTime")
    .optional()
    .isISO8601()
    .withMessage("Registration end time must be a valid date"),
];

export const updateContestRules = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be 3–200 characters"),

  body("description").optional().isString(),

  body("startTime").optional().isISO8601(),
  body("endTime").optional().isISO8601(),

  body("problems")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one problem is required if updating problems"),

  body("problems.*.problem").optional().isMongoId(),

  body("problems.*.points").optional().isInt({ min: 1, max: 1000 }),

  body("rules").optional().isString(),
  body("isPublic").optional().isBoolean(),
  body("maxParticipants").optional().isInt({ min: 0 }),
];

export const listContestsRules = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status")
    .optional()
    .isIn(["upcoming", "live", "ended"])
    .withMessage("Status must be one of: upcoming, live, ended"),
  query("search").optional().isString().isLength({ max: 100 }),
];

export const contestIdRule = [
  param("id").isMongoId().withMessage("Invalid contest id"),
];

export const contestSlugRule = [
  param("slug").isString().notEmpty().withMessage("Slug is required"),
];
import { body, param, query } from "express-validator";
import { LANGUAGES } from "../config/constants.js";

const languageValues = Object.keys(LANGUAGES);

export const runCodeRules = [
  body("problemId")
    .notEmpty()
    .withMessage("Problem id is required")
    .isMongoId()
    .withMessage("Invalid problem id"),

  body("language")
    .notEmpty()
    .withMessage("Language is required")
    .isIn(languageValues)
    .withMessage(`Language must be one of: ${languageValues.join(", ")}`),

  body("code")
    .notEmpty()
    .withMessage("Code is required")
    .isString()
    .isLength({ max: 100000 })
    .withMessage("Code too long (100 KB max)"),

  body("contestId").optional().isMongoId().withMessage("Invalid contest id"),
];

export const submitCodeRules = [...runCodeRules];

export const submissionIdRule = [
  param("id").isMongoId().withMessage("Invalid submission id"),
];

export const listSubmissionRules = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("problemId").optional().isMongoId(),
  query("contestId").optional().isMongoId(),
];
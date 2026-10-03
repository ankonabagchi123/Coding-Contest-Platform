import { body } from "express-validator";

export const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be 2–60 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 100 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[a-zA-Z]/)
    .withMessage("Password must contain at least one letter"),

  body("confirmPassword")
    .optional()
    .custom((value, { req }) => {
      if (value !== undefined && value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

export const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];
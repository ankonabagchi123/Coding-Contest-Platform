import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";
import { registerRules, loginRules } from "../validators/auth.validator.js";

const router = Router();

// Public
router.post(
  "/register",
  authLimiter,
  registerRules,
  validate,
  authController.register
);

router.post(
  "/login",
  authLimiter,
  loginRules,
  validate,
  authController.login
);

// Protected
router.get("/me", protect, authController.me);
router.post("/logout", protect, authController.logout);

export default router;
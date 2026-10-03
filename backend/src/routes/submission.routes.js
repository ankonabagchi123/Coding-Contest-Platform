import { Router } from "express";
import * as submissionController from "../controllers/submission.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { submissionLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  runCodeRules,
  submitCodeRules,
  submissionIdRule,
  listSubmissionRules,
} from "../validators/submission.validator.js";

const router = Router();

// All submission routes require auth
router.use(protect);

router.post(
  "/run",
  submissionLimiter,
  runCodeRules,
  validate,
  submissionController.runCode
);

router.post(
  "/submit",
  submissionLimiter,
  submitCodeRules,
  validate,
  submissionController.submitCode
);

router.get(
  "/my",
  listSubmissionRules,
  validate,
  submissionController.getMySubmissions
);

router.get(
  "/:id",
  submissionIdRule,
  validate,
  submissionController.getSubmission
);

export default router;
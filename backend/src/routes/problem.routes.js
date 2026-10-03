import { Router } from "express";
import * as problemController from "../controllers/problem.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { ROLES } from "../config/constants.js";
import {
  createProblemRules,
  updateProblemRules,
  listProblemsRules,
  problemIdRule,
  problemSlugRule,
} from "../validators/problem.validator.js";

const router = Router();

// --- Public ---
router.get("/", listProblemsRules, validate, problemController.listProblems);

router.get(
  "/id/:id",
  protect,
  authorize(ROLES.ADMIN),
  problemIdRule,
  validate,
  problemController.getProblemAdmin
);

router.get(
  "/:slug",
  problemSlugRule,
  validate,
  problemController.getProblem
);

// --- Admin-only ---
router.post(
  "/",
  protect,
  authorize(ROLES.ADMIN),
  createProblemRules,
  validate,
  problemController.createProblem
);

router.patch(
  "/:id",
  protect,
  authorize(ROLES.ADMIN),
  updateProblemRules,
  validate,
  problemController.updateProblem
);

router.delete(
  "/:id",
  protect,
  authorize(ROLES.ADMIN),
  problemIdRule,
  validate,
  problemController.deleteProblem
);

export default router;
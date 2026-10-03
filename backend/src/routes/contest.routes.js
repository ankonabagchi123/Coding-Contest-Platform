import { Router } from "express";
import * as contestController from "../controllers/contest.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { ROLES } from "../config/constants.js";
import {
  createContestRules,
  updateContestRules,
  listContestsRules,
  contestIdRule,
  contestSlugRule,
} from "../validators/contest.validator.js";

const router = Router();

// --- Public ---
router.get("/", listContestsRules, validate, contestController.listContests);

// --- Auth-required (must come BEFORE /:slug to avoid conflict) ---
router.get("/my", protect, contestController.getMyContests);

router.get(
  "/id/:id",
  protect,
  authorize(ROLES.ADMIN),
  contestIdRule,
  validate,
  contestController.getContestAdmin
);

router.post(
  "/:id/register",
  protect,
  contestIdRule,
  validate,
  contestController.register
);

router.delete(
  "/:id/register",
  protect,
  contestIdRule,
  validate,
  contestController.unregister
);

router.get(
  "/:id/problems",
  protect,
  contestIdRule,
  validate,
  contestController.getProblems
);

router.get(
  "/:id/leaderboard",
  contestIdRule,
  validate,
  contestController.getLeaderboard
);

// --- Admin-only ---
router.post(
  "/",
  protect,
  authorize(ROLES.ADMIN),
  createContestRules,
  validate,
  contestController.createContest
);

router.patch(
  "/:id",
  protect,
  authorize(ROLES.ADMIN),
  updateContestRules,
  validate,
  contestController.updateContest
);

router.delete(
  "/:id",
  protect,
  authorize(ROLES.ADMIN),
  contestIdRule,
  validate,
  contestController.deleteContest
);

// --- Slug route (must come LAST) ---
router.get(
  "/:slug",
  contestSlugRule,
  validate,
  contestController.getContest
);

export default router;
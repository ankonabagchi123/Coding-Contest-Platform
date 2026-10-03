import { Router } from "express";
import authRoutes from "./auth.routes.js";
import problemRoutes from "./problem.routes.js";
import contestRoutes from "./contest.routes.js";
import submissionRoutes from "./submission.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/problems", problemRoutes);
router.use("/contests", contestRoutes);
router.use("/submissions", submissionRoutes);

export default router;
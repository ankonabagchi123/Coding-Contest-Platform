import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./src/config/env.js";
import routes from "./src/routes/index.js";
import { errorHandler } from "./src/middleware/error.middleware.js";
import { notFound } from "./src/middleware/notFound.middleware.js";
import { generalLimiter } from "./src/middleware/rateLimiter.middleware.js";

const app = express();

// Trust proxy (needed for rate limiter behind reverse proxy / deployment)
app.set("trust proxy", 1);

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: [env.CLIENT_URL, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Logger
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiter
app.use("/api", generalLimiter);

// Root
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Online Coding Contest API",
    version: "1.0.0",
  });
});

// API routes
app.use("/api", routes);

// 404 + error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
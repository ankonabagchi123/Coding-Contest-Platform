import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);  // fixes Windows SRV DNS bug

import http from "http";
import app from "./app.js";
import { env } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";
import { logger } from "./src/utils/logger.js";

const start = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    server.listen(env.PORT, () => {
      logger.success(`Server running on http://localhost:${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });

    const shutdown = async (signal) => {
      logger.warn(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      shutdown("unhandledRejection");
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

start();
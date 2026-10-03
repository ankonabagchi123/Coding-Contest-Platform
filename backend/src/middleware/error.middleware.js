import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error.errors || []);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = ApiError.conflict(`Duplicate value for field: ${field}`);
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === "CastError") {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = ApiError.unauthorized("Invalid token");
  }
  if (err.name === "TokenExpiredError") {
    error = ApiError.unauthorized("Token expired");
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors?.length ? error.errors : undefined,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(error.statusCode || 500).json(response);
};
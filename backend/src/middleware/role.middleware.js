import { ApiError } from "../utils/apiError.js";

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) throw ApiError.unauthorized("Not authenticated");
  if (!roles.includes(req.user.role)) {
    throw ApiError.forbidden(
      `Role '${req.user.role}' is not allowed to access this resource`
    );
  }
  next();
};
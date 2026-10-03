import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/apiResponse.js";
import * as authService from "../services/auth.service.js";
import { attachTokenCookie, clearTokenCookie } from "../utils/jwt.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const { user, token } = await authService.registerUser({
    name,
    email,
    password,
  });

  attachTokenCookie(res, token);

  return sendCreated(
    res,
    { user, token },
    "Account created successfully"
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authService.loginUser({ email, password });

  attachTokenCookie(res, token);

  return sendSuccess(res, { user, token }, "Logged in successfully");
});

export const me = asyncHandler(async (req, res) => {
  // req.user set by `protect` middleware
  const user = await authService.getCurrentUser(req.user._id);
  return sendSuccess(res, { user }, "Current user");
});

export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  return sendSuccess(res, null, "Logged out");
});
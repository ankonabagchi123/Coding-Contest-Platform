import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async ({ name, email, password }) => {
  // Check existing
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  // Create (password auto-hashed by User model pre-save hook)
  const user = await User.create({ name, email, password });

  const token = generateToken({ id: user._id, role: user.role });

  // Strip password
  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

export const loginUser = async ({ email, password }) => {
  // Need password explicitly — it's `select: false` in the schema
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user) throw ApiError.unauthorized("Invalid email or password");
  if (!user.isActive) throw ApiError.forbidden("Account is disabled");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

  // Update lastLogin
  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken({ id: user._id, role: user.role });

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw ApiError.notFound("User not found");
  return user;
};
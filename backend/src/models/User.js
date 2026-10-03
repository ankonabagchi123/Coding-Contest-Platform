import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned by default
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },

    // Profile
    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },

    country: {
      type: String,
      default: "",
    },

    // Contest stats
    rating: {
      type: Number,
      default: 1200,
    },

    maxRating: {
      type: Number,
      default: 1200,
    },

    // Problems solved (unique problem ids)
    solvedProblems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],

    // Contests participated
    contestsParticipated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contest",
      },
    ],

    // Counters for quick stats (avoid aggregate queries on profile page)
    stats: {
      totalSubmissions: { type: Number, default: 0 },
      acceptedSubmissions: { type: Number, default: 0 },
      contestsAttended: { type: Number, default: 0 },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

// --- Indexes ---
//userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ rating: -1 }); // for global leaderboard

// --- Virtuals ---
userSchema.virtual("solveCount").get(function () {
  return this.solvedProblems?.length || 0;
});

// --- Pre-save hook: hash password ---
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Methods ---
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.markLogin = function () {
  this.lastLoginAt = new Date();
  return this.save();
};

export const User = mongoose.model("User", userSchema);
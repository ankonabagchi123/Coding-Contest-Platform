import mongoose from "mongoose";
import { CONTEST_STATUS } from "../config/constants.js";

// A problem inside a contest carries extra metadata
const contestProblemSchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    // Points for solving (e.g. easy=100, medium=200, hard=300)
    points: {
      type: Number,
      default: 100,
      min: 1,
    },
    // Optional custom label (A, B, C...)
    label: {
      type: String,
      default: "",
    },
    // Order shown in contest
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

// Leaderboard entry
const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: { type: Number, default: 0 },
    // ICPC-style penalty (minutes)
    penalty: { type: Number, default: 0 },
    solvedCount: { type: Number, default: 0 },
    // Problem → solved boolean
    solvedProblems: [
      {
        problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
        solvedAt: Date,
        attempts: { type: Number, default: 0 },
      },
    ],
    rank: { type: Number, default: 0 },
    registeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },

    startTime: {
      type: Date,
      required: [true, "Start time is required"],
      index: true,
    },

    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },

    // Contest visibility
    isPublic: {
      type: Boolean,
      default: true,
    },

    // Optional password for private contests
    password: {
      type: String,
      select: false,
    },

    // Contest problems
    problems: {
      type: [contestProblemSchema],
      default: [],
    },

    // Registered participants + their scores
    participants: {
      type: [participantSchema],
      default: [],
      select: false, // large array, opt-in
    },

    // Registration window (defaults to open until contest start)
    registrationEndTime: {
      type: Date,
    },

    maxParticipants: {
      type: Number,
      default: 0, // 0 = unlimited
    },

    // Rules shown on contest page
    rules: {
      type: String,
      default: "",
    },

    // Live status — computed virtually but stored for fast filtering
    status: {
      type: String,
      enum: Object.values(CONTEST_STATUS),
      default: CONTEST_STATUS.UPCOMING,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// --- Indexes ---
contestSchema.index({ startTime: -1 });
contestSchema.index({ status: 1, startTime: 1 });
contestSchema.index({ title: "text", description: "text" });

// --- Virtuals ---
contestSchema.virtual("durationMinutes").get(function () {
  if (!this.startTime || !this.endTime) return 0;
  return Math.round((this.endTime - this.startTime) / 60000);
});

contestSchema.virtual("participantCount").get(function () {
  return this.participants?.length || 0;
});

// --- Pre-validate: slug + registration default ---
contestSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  if (this.startTime && !this.registrationEndTime) {
    this.registrationEndTime = this.startTime;
  }
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    return next(new Error("End time must be after start time"));
  }
  next();
});

// --- Methods ---
contestSchema.methods.computeStatus = function () {
  const now = new Date();
  if (now < this.startTime) return CONTEST_STATUS.UPCOMING;
  if (now > this.endTime) return CONTEST_STATUS.ENDED;
  return CONTEST_STATUS.LIVE;
};

contestSchema.methods.isLive = function () {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime;
};

export const Contest = mongoose.model("Contest", contestSchema);
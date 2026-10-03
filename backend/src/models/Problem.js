import mongoose from "mongoose";
import { DIFFICULTY } from "../config/constants.js";

// Sub-schema for test cases
const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    output: { type: String, required: true },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
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

    // Short summary for list pages
    summary: {
      type: String,
      default: "",
      maxlength: [300, "Summary cannot exceed 300 characters"],
    },

    // Constraints text (e.g. "1 <= n <= 10^5")
    constraints: {
      type: String,
      default: "",
    },

    inputFormat: { type: String, default: "" },
    outputFormat: { type: String, default: "" },

    difficulty: {
      type: String,
      enum: Object.values(DIFFICULTY),
      default: DIFFICULTY.EASY,
      index: true,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    // Sample test cases — visible to user
    sampleTestCases: {
      type: [testCaseSchema],
      validate: [
        (v) => v.length > 0,
        "At least one sample test case is required",
      ],
    },

    // Hidden test cases — never sent to frontend
    hiddenTestCases: {
      type: [testCaseSchema],
      select: false, // hidden by default from .find() unless .select('+hiddenTestCases')
      validate: [
        (v) => v.length > 0,
        "At least one hidden test case is required",
      ],
    },

    // Starter code per language
    starterCode: {
      type: Map,
      of: String,
      default: {},
    },

    // Editorial (markdown) — shown after contest ends
    editorial: {
      type: String,
      default: "",
    },

    // Hints
    hints: {
      type: [String],
      default: [],
    },

    // Limits
    timeLimit: {
      type: Number, // seconds
      default: 2,
      min: 0.5,
      max: 20,
    },

    memoryLimit: {
      type: Number, // KB
      default: 256000,
      min: 16000,
      max: 512000,
    },

    // Stats
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },

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
problemSchema.index({ title: "text", description: "text", tags: "text" });
problemSchema.index({ difficulty: 1, tags: 1 });
problemSchema.index({ createdAt: -1 });

// --- Virtuals ---
problemSchema.virtual("acceptanceRate").get(function () {
  if (!this.totalSubmissions) return 0;
  return ((this.acceptedSubmissions / this.totalSubmissions) * 100).toFixed(2);
});

// --- Pre-validate: auto-generate slug ---
problemSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
  }
  next();
});

export const Problem = mongoose.model("Problem", problemSchema);
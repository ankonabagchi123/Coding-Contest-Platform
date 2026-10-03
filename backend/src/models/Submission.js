import mongoose from "mongoose";
import { VERDICTS } from "../config/constants.js";

const testCaseResultSchema = new mongoose.Schema(
  {
    testCaseIndex: Number,
    status: String, // "AC" | "WA" | "TLE" | ...
    stdout: String,
    stderr: String,
    runtime: Number, // seconds
    memory: Number, // KB
    isSample: { type: Boolean, default: false },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },

    // Optional — set only if submitted during a contest
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      default: null,
      index: true,
    },

    language: {
      type: String,
      required: true,
      enum: ["cpp", "c", "java", "python", "javascript", "typescript", "go", "rust", "csharp"],
    },

    code: {
      type: String,
      required: true,
      maxlength: [100000, "Code too long"], // 100 KB max
    },

    verdict: {
      type: String,
      enum: Object.values(VERDICTS),
      default: VERDICTS.PENDING,
      index: true,
    },

    // Judge0 submission token (if using Judge0)
    judgeToken: {
      type: String,
      default: "",
    },

    // Result details
    runtime: { type: Number, default: 0 },   // seconds
    memory: { type: Number, default: 0 },    // KB

    // Test case results
    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    testCaseResults: { type: [testCaseResultSchema], default: [] },

    // Compilation error / runtime error message
    errorMessage: { type: String, default: "" },

    // Scoring
    pointsAwarded: { type: Number, default: 0 },

    // Meta
    isSampleRun: { type: Boolean, default: false }, // true = "Run" button, not "Submit"
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

// --- Indexes for common queries ---
submissionSchema.index({ user: 1, problem: 1, createdAt: -1 });
submissionSchema.index({ contest: 1, user: 1 });
submissionSchema.index({ contest: 1, problem: 1, verdict: 1 });
submissionSchema.index({ createdAt: -1 });

// --- Virtuals ---
submissionSchema.virtual("isAccepted").get(function () {
  return this.verdict === VERDICTS.AC;
});

export const Submission = mongoose.model("Submission", submissionSchema);
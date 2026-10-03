import mongoose from "mongoose";

/**
 * Optional separate collection to track registrations.
 * You can use this OR the embedded `participants` array in Contest.
 * Using this collection makes queries easier (e.g. "my contests").
 */
const registrationSchema = new mongoose.Schema(
  {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["registered", "cancelled", "disqualified"],
      default: "registered",
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

// A user can register for a given contest only once
registrationSchema.index({ contest: 1, user: 1 }, { unique: true });

export const Registration = mongoose.model("Registration", registrationSchema);
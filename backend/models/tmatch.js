import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["tmatch"],
      required: true,
    },
    tournamentId: { type: String, required: true },
    moves: { type: Number, default: 20 },
    blue: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      result: { type: String, default: null },
      score: { type: Number, default: 0 },
    },

    apiData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    entryFee: {
      type: Number,
      required: true,
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["waiting", "running", "completed", "cancelled"],
      default: "waiting",
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

export const TMatch = mongoose.model("TMatch", matchSchema);

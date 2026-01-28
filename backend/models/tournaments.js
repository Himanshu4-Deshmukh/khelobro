import mongoose from "mongoose";

const scoringSchema = new mongoose.Schema({
  fromRank: { type: Number, required: true },
  toRank: { type: Number, required: true },
  reward: { type: Number, required: true },
});

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    moves: { type: Number, required: true },
    entryFee: { type: Number, required: true },
    joined: { type: Number, default: 0 },

    firstPrize: { type: Number, required: true },
    prizePool: { type: Number, required: true },

    assuredWinners: { type: Number, required: true },

    totalAllowedEntries: { type: Number, required: true },
    totalAllowedEntriesPerUser: { type: Number, required: true },

    status: {
      type: String,
      enum: ["draft", "running", "completed"],
      default: "draft",
    },

    scoring: {
      type: [scoringSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Scoring list cannot be empty",
      },
    },

    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Tournament = mongoose.model("Tournament", tournamentSchema);

export default Tournament;

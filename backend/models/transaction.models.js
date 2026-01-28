import mongoose from "mongoose";

const txnSchema = new mongoose.Schema(
  {
    txnId: {
      type: String,
      required: true,
      unique: true,
    },
    MID: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      default: null,
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be a positive number"],
    },
    cash: {
      type: Number,

      min: [0, "Amount must be a positive number"],
      default: 0,
    },
    txnData: {
      type: String, // Allows storing any type of data, including JSON objects
    },

    isManual: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    reward: {
      type: Number,

      min: [0, "Amount must be a positive number"],
      default: 0,
    },
    bonus: {
      type: Number,

      min: [0, "Amount must be a positive number"],
      default: 0,
    },
    remark: {
      type: String,
      required: true,
    },
    method: {
      type: String,
    },
    methodData: {
      type: JSON,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    txnType: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    txnCtg: {
      type: String,
      enum: [
        "deposit",
        "withdrawal",
        "bet",
        "reward",
        "referral",
        "bonus",
        "refund",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", txnSchema);

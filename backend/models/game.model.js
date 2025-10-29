import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    game: {
      type: String,
      default: "classicManual",
    },
    title: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      required: true, // URL or path to the banner image
    },
    status: {
      type: String,
      enum: ["live", "inactive", "coming_soon"],
      default: "active",
    },
    amounts: { type: String, default: null },
    minAmount: {
      type: Number,
      required: true,
      min: [0, "Minimum amount must be a positive number"],
    },
    maxAmount: {
      type: Number,
      required: true,
      min: [0, "Maximum amount must be a positive number"],
    },
    multipleOf: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    order: {
      type: Number,
    },
    durationLite: {
      type: Number,
      required: true,
    },
    moves: {
      type: Number,
      required: true,
    },
    guideenglish: {
      type: String, // A text field to store the guide (could also be Markdown or rich text)
      default: "",
    },
    guidehindi: {
      type: String, // A text field to store the guide (could also be Markdown or rich text)
      default: "",
    },
  },
  { timestamps: true }
);

export const Game = mongoose.model("Game", gameSchema);

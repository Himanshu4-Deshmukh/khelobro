import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  entryFee: {
    type: Number,
    required: false,   // 🔴 make optional
    default: 0,        // ✅ safety default
  },
  prize: {
    type: Number,
    default: 0,
  },
  hostData: {
    profilePic: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    kyc: {
      type: Boolean,
      required: true,
    },
  },
  joinerData: {
    profilePic: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    kyc: {
      type: Boolean,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FakeMatch = mongoose.model("FakeMatch", matchSchema);

export default FakeMatch;

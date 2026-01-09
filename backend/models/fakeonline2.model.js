import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  entryFee: {
    type: Number,
    required: false,   // 🔴 make optional
    default: 0,        // ✅ safety default
  },
  playing: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FakeOnline2 = mongoose.model("FakeOnline2", matchSchema);

export default FakeOnline2;

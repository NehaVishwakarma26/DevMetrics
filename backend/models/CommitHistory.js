const mongoose = require("mongoose");

const commitHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  commitCount: {
    type: Number,
    required: true,
    default: 0
  }
});
commitHistorySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("CommitHistory", commitHistorySchema);

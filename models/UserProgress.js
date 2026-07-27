const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  totalXP: {
    type: Number,
    default: 0,
  },

  level: {
    type: Number,
    default: 1,
  },
});

const UserProgress = mongoose.model("UserProgress", userProgressSchema);

module.exports = UserProgress;

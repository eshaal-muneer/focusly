
// models/UserProgress.js
// Ye file batati hai database mein user ki "progress" (XP + Level)
// kaisi store hoti hai.
//
// PEHLE humare paas sirf EK record hota tha poore app ke liye
// (kyunki login system nahi tha). AB har user ka apna ALAG
// UserProgress record hoga — "userId" se link hoga.

const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  // "unique: true" — har user ka SIRF EK progress record ho sakta
  // hai, do nahi banenge galti se
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
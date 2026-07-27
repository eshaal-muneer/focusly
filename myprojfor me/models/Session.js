// models/Session.js
// Ye file batati hai database mein ek "Session" (completed study
// session) kaisa dikhta hai — bilkul Todo.js jaisa pattern hai.

const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  // Ye session KIS user ka hai
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  mode: {
    type: String,
    required: true,
  },

  duration: {
    type: Number,
    required: true,
  },

  completedAt: {
    type: Date,
    default: Date.now,
  },
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
// models/StickyNote.js
// Ye file batati hai database mein ek "sticky note" kaisa store hota
// hai — bilkul Todo.js jaisa simple pattern.

const mongoose = require("mongoose");

const stickyNoteSchema = new mongoose.Schema({
  // "text" — note ke andar likha hua chhota message
  text: {
    type: String,
    required: true,
  },

  // "color" — note ka theme: "pink", "blue", ya "yellow"
  // (default "pink" agar kabhi na diya jaye)
  color: {
    type: String,
    default: "pink",
  },

  // "createdAt" — note kab bana, khud-ba-khud current time se bharta hai
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StickyNote = mongoose.model("StickyNote", stickyNoteSchema);

module.exports = StickyNote;

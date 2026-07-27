const mongoose = require("mongoose");

const stickyNoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },

  color: {
    type: String,
    default: "pink",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StickyNote = mongoose.model("StickyNote", stickyNoteSchema);

module.exports = StickyNote;

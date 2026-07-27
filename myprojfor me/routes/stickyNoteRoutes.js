// routes/stickyNoteRoutes.js
// Ye file sticky notes se related routes rakhti hai — ab user-scoped.

const express = require("express");
const router = express.Router();

const StickyNote = require("../models/StickyNote");

// ==========================================
// ROUTE: GET /api/notes
// Kaam: SIRF is user ke sticky notes nikaal kar wapas bhejo
// ==========================================
router.get("/", async (req, res) => {
  try {
    const allNotes = await StickyNote.find({ userId: req.session.userId }).sort({ createdAt: 1 });
    res.json(allNotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ROUTE: POST /api/notes
// Kaam: Ek NAYA sticky note, ISI user ke naam se, save karo
// ==========================================
router.post("/", async (req, res) => {
  try {
    const { text, color } = req.body;

    const newNote = new StickyNote({
      text: text,
      color: color,
      userId: req.session.userId,
    });

    const savedNote = await newNote.save();

    res.status(201).json(savedNote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ROUTE: DELETE /api/notes/:id
// Kaam: Ek specific sticky note delete karo — sirf agar ISI user ka ho
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const deletedNote = await StickyNote.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!deletedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted", deletedNote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
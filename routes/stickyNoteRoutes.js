const express = require("express");
const router = express.Router();

const StickyNote = require("../models/StickyNote");

router.get("/", async (req, res) => {
  try {
    const allNotes = await StickyNote.find({ userId: req.session.userId }).sort({ createdAt: 1 });
    res.json(allNotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

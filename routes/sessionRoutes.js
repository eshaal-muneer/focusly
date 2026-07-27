const express = require("express");
const router = express.Router();

const Session = require("../models/Session");


router.get("/", async (req, res) => {
  try {

    const allSessions = await Session.find({ userId: req.session.userId }).sort({ completedAt: -1 });
    res.json(allSessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {

    const { mode, duration } = req.body;

    const newSession = new Session({
      mode: mode,
      duration: duration,
      userId: req.session.userId,
    });

    const savedSession = await newSession.save();

    res.status(201).json(savedSession);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    
    const result = await Session.deleteMany({ userId: req.session.userId });
    res.json({
      message: "All sessions cleared",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// routes/progressRoutes.js
// Ye file XP aur Level se related routes rakhti hai — ab har user
// ka apna ALAG progress record hai (userId se link).

const express = require("express");
const router = express.Router();

const UserProgress = require("../models/UserProgress");

// ==========================================
// HELPER: ISI user ka progress record dhoondo, agar na mile to
// NAYA banao — ab "userId" parameter leta hai (pehle koi
// parameter nahi tha, kyunki sirf EK shared record hota tha)
// ==========================================
async function getOrCreateProgress(userId) {
  let progress = await UserProgress.findOne({ userId });

  if (!progress) {
    progress = await UserProgress.create({ userId, totalXP: 0, level: 1 });
  }

  return progress;
}

// ==========================================
// ROUTE: GET /api/progress
// Kaam: ISI user ka totalXP aur level wapas bhejo
// ==========================================
router.get("/", async (req, res) => {
  try {
    const progress = await getOrCreateProgress(req.session.userId);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ROUTE: PUT /api/progress
// Kaam: ISI user ka naya XP add karo, level recalculate karo
// ==========================================
router.put("/", async (req, res) => {
  try {
    const { xpToAdd } = req.body;

    const progress = await getOrCreateProgress(req.session.userId);

    progress.totalXP = progress.totalXP + xpToAdd;
    progress.level = Math.floor(progress.totalXP / 200) + 1;

    const updatedProgress = await progress.save();

    res.json(updatedProgress);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ROUTE: DELETE /api/progress
// Kaam: ISI user ke XP/Level ko default (0, 1) pe reset karo
// ==========================================
router.delete("/", async (req, res) => {
  try {
    const progress = await getOrCreateProgress(req.session.userId);

    progress.totalXP = 0;
    progress.level = 1;

    const resetProgress = await progress.save();

    res.json(resetProgress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
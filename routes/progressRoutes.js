const express = require("express");
const router = express.Router();

const UserProgress = require("../models/UserProgress");

async function getOrCreateProgress(userId) {
  let progress = await UserProgress.findOne({ userId });

  if (!progress) {
    progress = await UserProgress.create({ userId, totalXP: 0, level: 1 });
  }

  return progress;
}

router.get("/", async (req, res) => {
  try {
    const progress = await getOrCreateProgress(req.session.userId);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

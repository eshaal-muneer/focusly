// routes/sessionRoutes.js
// Ye file "Session" se related routes rakhti hai — completed
// sessions ko database mein save karna, unhe wapas dekhna, aur
// (Day 12) saare records ek sath clear karna.

const express = require("express");
const router = express.Router();

const Session = require("../models/Session");

// ==========================================
// ROUTE: GET /api/sessions
// Kaam: Database se SAARE saved sessions nikaal kar wapas bhejo
// (isse hum browser mein http://localhost:5000/api/sessions khol
// kar check kar sakte hain ke sessions actually save ho rahe hain)
// ==========================================
router.get("/", async (req, res) => {
  try {
    // ".sort({ completedAt: -1 })" sabse NAYA session sabse upar
    // dikhata hai — jaise WhatsApp mein latest message sabse upar hota hai
    const allSessions = await Session.find({}).sort({ completedAt: -1 });
    res.json(allSessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ROUTE: POST /api/sessions
// Kaam: Ek completed Study session database mein save karo
// ==========================================
router.post("/", async (req, res) => {
  try {
    // req.body mein frontend (timer.js) se aaya data hai:
    // { mode: "study", duration: 25 }
    const { mode, duration } = req.body;

    const newSession = new Session({
      mode: mode,
      duration: duration,
      // "completedAt" khud-ba-khud current time se bhar jayega
      // (schema mein default: Date.now set kiya tha)
    });

    const savedSession = await newSession.save();

    res.status(201).json(savedSession);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ROUTE: DELETE /api/sessions
// Kaam: Saare saved sessions EK SAATH database se hata do —
// user ko "Clear Stats" button dabane pe ye chalta hai, taaki
// wo purane test/old data ko hata kar fresh start kar sake.
// ==========================================
//
// "Session.deleteMany({})" — jaise "Todo.findByIdAndDelete()" EK
// document delete karta tha, waise "deleteMany({})" ek EMPTY
// filter ke sath SAARE documents delete kar deta hai is collection
// ke — bilkul jaise C++ mein "vector.clear()" poore vector ko
// khaali kar deta hai, ek-ek element delete karne ki jagah.
router.delete("/", async (req, res) => {
  try {
    const result = await Session.deleteMany({});
    res.json({
      message: "All sessions cleared",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
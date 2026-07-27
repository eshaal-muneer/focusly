const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("../models/User");

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, aur password zaroori hain" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Is email se account pehle se hai" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      passwordHash,
    });

    const savedUser = await newUser.save();

    req.session.userId = savedUser._id;

    res.status(201).json({
      message: "Account created",
      user: { id: savedUser._id, username: savedUser.username, email: savedUser.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email aur password zaroori hain" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    req.session.userId = user._id;

    res.json({
      message: "Logged in",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/logout", (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout mein masla hua" });
    }
    res.json({ message: "Logged out" });
  });
});

router.get("/me", async (req, res) => {

  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    res.json({
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// routes/authRoutes.js
// Ye file signup, login, logout, aur "abhi kaun login hai" wale
// routes rakhti hai.

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("../models/User");

// ==========================================
// ROUTE: POST /api/auth/signup
// Kaam: Naya account banana
// ==========================================
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation — teeno fields zaroori hain
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, aur password zaroori hain" });
    }

    // Check karo kahin ye email PEHLE SE registered to nahi
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Is email se account pehle se hai" });
    }

    // PASSWORD HASH KARNA — ye sabse zaroori step hai.
    // bcrypt.hash(password, saltRounds) password ko ek "hash" mein
    // convert karta hai. "saltRounds" (yahan 10) batata hai HASHING
    // kitni baar/kitni mehnat se ho — jitna zyada, utna secure lekin
    // thoda slow. 10 industry-standard default hai.
    //
    // "await" zaroori hai kyunki hashing thoda time leti hai
    // (jaanbujh kar — taaki koi hacker jaldi jaldi guess na kar sake).
    const passwordHash = await bcrypt.hash(password, 10);

    // Naya user banao — dhyan do, "password" nahi "passwordHash" save ho raha hai
    const newUser = new User({
      username,
      email,
      passwordHash,
    });

    const savedUser = await newUser.save();

    // SIGNUP hote hi user ko turant LOGIN bhi kar do — session mein
    // uski userId store kar do. "req.session" Express ne khud ban
    // diya hai (session middleware ki wajah se, server.js mein setup
    // hai) — ye ek object hai jisme hum jo bhi likhein, wo us user ke
    // liye YAAD rehta hai agli requests mein bhi.
    req.session.userId = savedUser._id;

    // Response mein passwordHash WAPAS NAHI bhejte — chahe hash ho,
    // phir bhi frontend/network mein ye cheez unnecessary expose
    // karne ki zaroorat nahi
    res.status(201).json({
      message: "Account created",
      user: { id: savedUser._id, username: savedUser.username, email: savedUser.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ROUTE: POST /api/auth/login
// Kaam: Existing account se login karna
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email aur password zaroori hain" });
    }

    // Email se user dhoondo
    const user = await User.findOne({ email });

    // Dhyan do: agar user hi na mile, hum GENERIC error dete hain
    // ("Invalid email or password") — specifically ye nahi batate
    // "email galat hai" ya "password galat hai" alag alag. Ye ek
    // security best-practice hai — warna hackers pata laga sakte
    // hain KAUNSI emails registered hain, ek-ek try karke.
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // bcrypt.compare() entered password ko HASH karke, database
    // wale hash se COMPARE karta hai — asal password kabhi seedha
    // compare nahi hota. True/false return karta hai.
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Login successful — session mein userId save karo
    req.session.userId = user._id;

    res.json({
      message: "Logged in",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ROUTE: POST /api/auth/logout
// Kaam: Session khatam karna
// ==========================================
router.post("/logout", (req, res) => {
  // req.session.destroy() session ko poori tarah mita deta hai —
  // agli request mein "req.session.userId" phir se undefined hoga
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout mein masla hua" });
    }
    res.json({ message: "Logged out" });
  });
});

// ==========================================
// ROUTE: GET /api/auth/me
// Kaam: Batao ABHI kaun login hai (agar koi ho)
// ------------------------------------------
// Frontend page load hote hi ise call karega — taaki pata chale
// user pehle se login hai ya Login page dikhani hai.
// ==========================================
router.get("/me", async (req, res) => {
  // Agar session mein koi userId hi nahi, matlab koi login nahi hai
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

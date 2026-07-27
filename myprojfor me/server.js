// server.js
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔥 MongoDB Connected Successfully...'))
  .catch(err => console.error('❌ Database connection error:', err));

// MIDDLEWARE: express.json()
app.use(express.json());

// MIDDLEWARE: express.static()
app.use(express.static("public"));

// ==========================================
// MIDDLEWARE: express-session
// ------------------------------------------
// Ye har request ke sath ek "req.session" object bana deta hai,
// jisme hum data STORE kar sakte hain jo REQUESTS ke beech YAAD
// rehta hai (jaise userId, login ke baad).
//
// "secret" — ek random string jo cookies ko sign/encrypt karne ke
// liye use hoti hai (taaki koi user khud se cookie edit na kar sake).
// Ye .env mein rakhi hai, kabhi code mein hardcode/public nahi karte.
//
// NOTE: Abhi ke liye sessions server ki MEMORY mein store ho rahi
// hain (default). Isका matlab: agar server RESTART ho, SAARE
// logged-in users ka session khatam ho jayega (dobara login karna
// padega) — learning project ke liye theek hai, lekin real
// production app mein "connect-mongo" jaisi library use karte hain
// taaki sessions bhi MongoDB mein persist hon, server restart se
// bhi na udein. Agar chaho to ye upgrade kal kar sakte hain.
const session = require("express-session");
app.use(session({
  secret: process.env.SESSION_SECRET || "focusverse-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 din tak session yaad rahega
  },
}));

// Auth routes ko import karo — YE PUBLIC hain (login/signup ke liye
// khud login hona zaroori nahi hota!), isliye "requireAuth" NAHI
// lagate in par.
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// requireAuth middleware — baaki saari routes ko PROTECT karega
const requireAuth = require("./middleware/requireAuth");

// Todo routes — ab PROTECTED (requireAuth pehle chalega)
const todoRoutes = require("./routes/todoRoutes");
app.use("/api/todos", requireAuth, todoRoutes);

// Session routes — PROTECTED
const sessionRoutes = require("./routes/sessionRoutes");
app.use("/api/sessions", requireAuth, sessionRoutes);

// Progress routes — PROTECTED
const progressRoutes = require("./routes/progressRoutes");
app.use("/api/progress", requireAuth, progressRoutes);

// Sticky Note routes — PROTECTED
const stickyNoteRoutes = require("./routes/stickyNoteRoutes");
app.use("/api/notes", requireAuth, stickyNoteRoutes);

// Server start karo
app.listen(PORT, () => {
  console.log(`Focusly server is running on http://localhost:${PORT}`);
});
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔥 MongoDB Connected Successfully...'))
  .catch(err => console.error('❌ Database connection error:', err));

app.use(express.json());

app.use(express.static("public"));

const session = require("express-session");
app.use(session({
  secret: process.env.SESSION_SECRET || "focusverse-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const requireAuth = require("./middleware/requireAuth");

const todoRoutes = require("./routes/todoRoutes");
app.use("/api/todos", requireAuth, todoRoutes);

const sessionRoutes = require("./routes/sessionRoutes");
app.use("/api/sessions", requireAuth, sessionRoutes);

const progressRoutes = require("./routes/progressRoutes");
app.use("/api/progress", requireAuth, progressRoutes);

const stickyNoteRoutes = require("./routes/stickyNoteRoutes");
app.use("/api/notes", requireAuth, stickyNoteRoutes);

app.listen(PORT, () => {
  console.log(`Focusly server is running on http://localhost:${PORT}`);
});
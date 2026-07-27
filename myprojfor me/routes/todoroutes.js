// routes/todoRoutes.js
// Ab har route "req.session.userId" use karta hai — taaki har user
// ko SIRF apne hi todos milein, dusre ke nahi.
//
// NOTE: In saari routes se PEHLE "requireAuth" middleware chalta hai
// (server.js mein lagaya hai) — isliye yahan "req.session.userId"
// hamesha maujood hoga, humein khud check nahi karna padta ke login
// hai ya nahi.

const express = require("express");
const router = express.Router();

const Todo = require("../models/Todo");

// ==========================================
// ROUTE 1: GET /api/todos
// Kaam: SIRF is user ke todos nikaal kar wapas bhejo
// ==========================================
router.get("/", async (req, res) => {
  try {
    // PEHLE: Todo.find({}) — sab todos, sabke
    // AB: Todo.find({ userId: ... }) — sirf ISI user ke todos
    const allTodos = await Todo.find({ userId: req.session.userId });
    res.json(allTodos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ROUTE 2: POST /api/todos
// Kaam: Ek NAYA todo, ISI user ke naam se, database mein create karo
// ==========================================
router.post("/", async (req, res) => {
  try {
    const { title, priority } = req.body;

    const newTodo = new Todo({
      title: title,
      priority: priority,
      // Naya todo banate waqt hi batao YE KISKA hai
      userId: req.session.userId,
    });

    const savedTodo = await newTodo.save();

    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ROUTE 3: PATCH /api/todos/:id
// Kaam: Kisi EK todo ka "completed" status toggle karo
// ==========================================
router.patch("/:id", async (req, res) => {
  try {
    // DHYAN DO: findOne mein "id" AUR "userId" DONO filter kiye —
    // isse koi user kisi doosre ke todo ki ID guess/copy kar ke
    // uska todo update NAHI kar sakta, chahe URL mein ID daal de.
    // Ye "ownership check" hai — bahut zaroori security step.
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.session.userId });

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    todo.completed = !todo.completed;

    const updatedTodo = await todo.save();

    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ROUTE 4: DELETE /api/todos/:id
// Kaam: Kisi EK todo ko delete karo — sirf agar wo ISI user ka ho
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const deletedTodo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted", deletedTodo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
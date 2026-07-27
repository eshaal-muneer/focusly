const express = require("express");
const router = express.Router();

const Todo = require("../models/Todo");

router.get("/", async (req, res) => {
  try {

    const allTodos = await Todo.find({ userId: req.session.userId });
    res.json(allTodos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, priority } = req.body;

    const newTodo = new Todo({
      title: title,
      priority: priority,

      userId: req.session.userId,
    });

    const savedTodo = await newTodo.save();

    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {

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

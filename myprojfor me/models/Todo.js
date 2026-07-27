// models/Todo.js
const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  // "userId" — batata hai YE todo KISKA hai. Bina isके, saare users
  // ke todos ek hi list mein mix ho jate. "ref: 'User'" Mongoose ko
  // batata hai ye ID kis collection ke document ko point karti hai
  // (future mein useful agar kabhi user ki details bhi saath fetch
  // karni ho, ".populate()" se).
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    default: "Medium",
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
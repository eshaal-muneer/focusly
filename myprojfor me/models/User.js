// models/User.js
// Ye file batati hai database mein ek "User" (account) kaisa store
// hota hai. Bilkul Todo.js jaisa pattern — bas password ke liye
// EXTRA dhyan rakha hai (kabhi plain text save nahi karte).

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // "username" — display ke liye, jaise "Eshaal"
  username: {
    type: String,
    required: true,
  },

  // "email" — login ke liye use hoga. "unique: true" ka matlab:
  // Mongoose khud ensure karega ke DO users same email se
  // signup na kar sakein — database level pe hi block ho jayega.
  email: {
    type: String,
    required: true,
    unique: true,
  },

  // "passwordHash" — DHYAN DO, naam "password" nahi "passwordHash" hai.
  // Yahan kabhi bhi asal password STORE nahi hota — sirf uska
  // "hash" (ek encrypted-jaisi, wapas-decode-na-ho-sakne-wali string)
  // save hota hai. Ye hashing "routes/authRoutes.js" mein hoga.
  passwordHash: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

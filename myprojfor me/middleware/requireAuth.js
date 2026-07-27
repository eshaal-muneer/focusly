// middleware/requireAuth.js
// Ye ek "gatekeeper" function hai — kisi bhi route se PEHLE lagayenge
// jise sirf LOGGED-IN users hi access kar sakein (jaise Todos, Timer
// sessions, XP, Notes — sab PERSONAL data hai).
//
// C++ comparison: jaise ek function jo pehle ek "permission check"
// karta hai, aur agar fail ho to aage ka code chalne hi nahi deta —
// early return jaisa.

function requireAuth(req, res, next) {
  // Agar session mein koi userId nahi (matlab login nahi hai)
  if (!req.session.userId) {
    // 401 = "Unauthorized" — request ko yahin ROK do, aage kisi
    // route ke actual code tak jaane hi mat do
    return res.status(401).json({ error: "Please log in first" });
  }

  // Agar login hai, "next()" call karo — Express ko batata hai
  // "sab theek hai, ab asal route ka code chalao"
  next();
}

module.exports = requireAuth;

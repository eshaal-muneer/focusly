<!-- Animated Banner -->
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2b1b2e,50:5c3a5c,100:d9a7c7&height=200&section=header&text=🌸%20Focusly&fontSize=55&fontColor=fdf2f8&animation=fadeIn&fontAlignY=38&desc=Your%20Cozy%20Corner%20to%20Focus%2C%20One%20Session%20at%20a%20Time&descAlignY=60&descColor=f3d9e8" width="100%"/>

</div>

<div align="center">

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

<br/>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=D9A7C7&center=true&vCenter=true&width=650&lines=Pomodoro+Timer+%E2%8F%B3;Todo+%2B+XP+%2B+Leveling+System+%E2%AD%90;Ambient+Study+Scenes+%F0%9F%8C%A7%EF%B8%8F;Sticky+Notes+on+the+Wall+%F0%9F%93%9D;Session+Stats+%26+Streaks+%F0%9F%93%8A;Secure+Login+%2F+Signup+%F0%9F%94%90" alt="Typing SVG" />
</div>

---

## 📖 About The Project

> **Focusly** is a full-stack, ambient "study with me" companion web app — a **Node.js/Express + MongoDB** backend behind a cozy front-end room. The room sits beside a window that shifts between five scenes — 🌧️ Rain, ☀️ Sunny, ❄️ Snowy, 🍃 Windy, and 🌙 Night — each with its own looping video and ambient sound. Every account is authenticated and every todo, session, XP total, and sticky note is persisted server-side in MongoDB, so the Pomodoro timer, XP-rewarding todo list, leveling system, live session stats, and sticky notes all pick up exactly where you left off, on any device you log in from.

Unlike a plain productivity tracker, Focusly is built around **atmosphere** — a dimensional wooden desk, a glowing lamp, a steaming coffee cup, and a character sitting quietly at the desk, all set inside an arched window that switches between rain, sun, snow, wind, and night scenes with matching ambient sound.

---

## ✨ Features

```
┌─────────────────────────────────────────────────────────────┐
│                    THE COZY STUDY ROOM                      │
│                                                               │
│  🌧️ Rain      ☀️ Sunny      ❄️ Snowy      🍃 Windy      🌙 Night │
│     Each scene pairs a looping ambient video with its own   │
│     looping sound track — volume + mute fully controllable  │
└─────────────────────────────────────────────────────────────┘
```

### 🏗️ Core Functionality
- **🔐 Authentication** — Secure Login/Signup with hashed passwords (bcrypt) and cookie-based server sessions, so every account is properly protected
- **💾 Persistent Storage** — Every todo, session, XP total, and sticky note is saved server-side in **MongoDB** via Mongoose, scoped per user through a `requireAuth` middleware layer — so your desk is exactly as you left it, from any device
- **⏳ Pomodoro Timer** — Custom Study/Break modes with editable minute inputs, start/pause/reset, an alarm on completion, and a floating mini-timer widget that stays visible while you scroll
- **📋 Todo List** — Add tasks with a priority level (Low/Medium/High); completing one instantly rewards XP, synced to your account
- **⭐ Level & XP System** — Earn XP for completed todos (+20) and completed study sessions (+50); every 200 XP levels you up, tracked with a live progress bar
- **📊 Session Stats** — Today's sessions & minutes, all-time totals, and a Last 7 Days history — with a "Clear Stats" option
- **📝 Sticky Notes** — Quick notes in 3 colors that fly onto the wall beside the window, alternating across the left and right sides of the frame
- **🎧 Ambient Scenes** — Rain, Sunny, Snowy, Windy, and Night environments, each with matching looping video + audio

---

## 🏛️ Architecture

```
                         ┌───────────────────────┐
                         │   Browser (Frontend)  │
                         │  index.html / style.css│
                         │   script.js / timer.js │
                         └───────────┬───────────┘
                                     │  fetch (JSON)
                                     ▼
                         ┌───────────────────────┐
                         │      server.js        │
                         │  Express app + session │
                         └───────────┬───────────┘
                                     │
        ┌───────────────┬───────────┼───────────────┬───────────────┐
        ▼               ▼           ▼               ▼               ▼
 /api/auth        /api/todos   /api/sessions   /api/progress    /api/notes
 (public)         (protected)  (protected)     (protected)      (protected)
 authRoutes.js    todoRoutes   sessionRoutes   progressRoutes   stickyNoteRoutes
        │               │           │               │               │
        ▼               ▼           ▼               ▼               ▼
     User.js         Todo.js    Session.js    UserProgress.js   StickyNote.js
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │   MongoDB (Mongoose)  │
                         └───────────────────────┘
```

Every route except `/api/auth` passes through the `requireAuth` middleware first — so only a logged-in user can touch their own todos, sessions, XP, or sticky notes.

---

## 🗂️ Project Structure

```
Focusly/
│
├── index.html              ← Main app shell (room, sidebar, floating panels)
├── style.css                ← All visual styling (room, panels, sidebar, scenes)
├── script.js                 ← Todos, stats, XP, sticky notes, scene switching
├── timer.js                  ← Pomodoro timer logic
│
├── server.js                 ← Express entry point, middleware, route mounting
├── package.json
│
├── models/
│   ├── User.js                ← User accounts (hashed passwords)
│   ├── Todo.js                ← Todo items
│   ├── Session.js             ← Completed Pomodoro sessions
│   ├── UserProgress.js        ← XP & level tracking
│   └── StickyNote.js          ← Sticky note content, color, wall side
│
├── routes/
│   ├── authRoutes.js          ← /api/auth — signup, login, logout
│   ├── todoRoutes.js          ← /api/todos — CRUD for todos
│   ├── sessionRoutes.js       ← /api/sessions — log completed sessions
│   ├── progressRoutes.js      ← /api/progress — get/update XP & level
│   └── stickyNoteRoutes.js    ← /api/notes — CRUD for sticky notes
│
└── middleware/
    └── requireAuth.js         ← Blocks protected routes for logged-out users
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5 / CSS3** | App shell, cozy room scene, floating panels |
| **JavaScript (Vanilla)** | Todos, XP/leveling, stats, sticky notes, timer, scene switching |
| **Node.js + Express 5** | Backend server & REST API |
| **MongoDB + Mongoose** | Persistent storage for users, todos, sessions, progress, notes |
| **express-session** | Cookie-based login sessions |
| **bcryptjs** | Password hashing |
| **dotenv** | Environment variable management |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/focusly.git
cd focusly

# Install dependencies
npm install

# Create a .env file in the root directory
echo "MONGO_URI=your_mongodb_connection_string" >> .env
echo "SESSION_SECRET=your_session_secret" >> .env
echo "PORT=5000" >> .env

# Start the server
npm start
```

Then open **http://localhost:5000** in your browser, sign up, and step into your cozy study room. 🌧️☕

---

## 🌱 What's Next

- 🪴 Plant growth — a small plant on the desk that grows as your study streak grows *(planned, not yet added)*
- 🔥 Streak tracking for consecutive study days
- 🎨 More scenes and lamp/theme customization

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2026
```

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:d9a7c7,50:5c3a5c,100:2b1b2e&height=120&section=footer&animation=fadeIn" width="100%"/>

*Made with ❤️ and a cup of coffee ☕ — Focusly*

</div>

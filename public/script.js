const todoListContainer = document.getElementById("todoList");
const titleInput = document.getElementById("titleInput");
const priorityInput = document.getElementById("priorityInput");
const addBtn = document.getElementById("addBtn");

const navItems = document.querySelectorAll(".nav-item");
const dynamicPanels = document.querySelectorAll(".dynamic-panel");
const closePanelButtons = document.querySelectorAll(".close-panel-btn");

navItems.forEach(item => {
  item.addEventListener("click", () => {
    const targetId = item.dataset.target;
    const targetPanel = document.getElementById(targetId);

    if (item.classList.contains("active")) {
      item.classList.remove("active");
      targetPanel.classList.add("hidden");
    } else {

      navItems.forEach(nav => nav.classList.remove("active"));
      dynamicPanels.forEach(panel => panel.classList.add("hidden"));

      item.classList.add("active");
      targetPanel.classList.remove("hidden");
    }
  });
});

closePanelButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const activePanel = e.target.closest(".dynamic-panel");
    if (activePanel) {
      activePanel.classList.add("hidden");

      navItems.forEach(nav => {
        if (nav.dataset.target === activePanel.id) {
          nav.classList.remove("active");
        }
      });
    }
  });
});

// CUSTOM HTML DROPDOWN LOGIC FOR SCENE SELECTION
const sceneDropdownSelected = document.getElementById("sceneDropdownSelected");
const sceneOptionsList = document.getElementById("sceneOptionsList");
const sceneVideo = document.getElementById("sceneVideo");

const sceneSounds = {
  rain: document.getElementById("audioRain"),
  sunny: document.getElementById("audioSunny"),
  snowy: document.getElementById("audioSnowy"),
  windy: document.getElementById("audioWindy"),
  night: document.getElementById("audioNight"),
};

let currentSceneAudio = null;

const sceneVolumeSlider = document.getElementById("sceneVolumeSlider");
const sceneMuteBtn = document.getElementById("sceneMuteBtn");
let isMuted = false;

function playSceneSound(sceneName) {

  if (currentSceneAudio) {
    currentSceneAudio.pause();
    currentSceneAudio.currentTime = 0;
  }

  currentSceneAudio = sceneSounds[sceneName];

  if (currentSceneAudio) {
    currentSceneAudio.volume = sceneVolumeSlider.value / 100;
    currentSceneAudio.muted = isMuted;
    currentSceneAudio.play().catch(() => {});
  }
}

// Toggle Dropdown Menu Open/Close
sceneDropdownSelected.addEventListener("click", (e) => {
  e.stopPropagation();
  sceneOptionsList.classList.toggle("show");
});

// Dropdown item selection logic
sceneOptionsList.querySelectorAll(".option").forEach(option => {
  option.addEventListener("click", (e) => {
    e.stopPropagation();
    const value = option.getAttribute("data-value");
    const text = option.innerText;

    // Update UI
    sceneDropdownSelected.querySelector("span:first-child").innerText = text;
    sceneOptionsList.classList.remove("show");

    // Change Video & Audio
    sceneVideo.src = "videos/" + value + ".mp4";
    sceneVideo.load();
    sceneVideo.play();

    playSceneSound(value);
  });
});

// Auto Close dropdown when clicking outside
window.addEventListener("click", (e) => {
  const customDropdown = document.getElementById("sceneDropdown");
  if (customDropdown && !customDropdown.contains(e.target)) {
    sceneOptionsList.classList.remove("show");
  }
});

sceneVolumeSlider.addEventListener("input", () => {
  if (currentSceneAudio) {
    currentSceneAudio.volume = sceneVolumeSlider.value / 100;
  }
});

sceneMuteBtn.addEventListener("click", () => {
  isMuted = !isMuted;

  if (currentSceneAudio) {
    currentSceneAudio.muted = isMuted;
  }

  sceneMuteBtn.textContent = isMuted ? "🔇" : "🔊";
});

playSceneSound("rain");

async function loadTodos() {
  try {
    const response = await fetch("/api/todos");
    const todos = await response.json();
    todoListContainer.innerHTML = "";

    if (todos.length === 0) {
      todoListContainer.innerHTML = "<p style='font-size:11px; opacity:0.6;'>No todos yet.</p>";
      return;
    }

    todos.forEach((todo) => {
      const card = document.createElement("div");
      card.className = `todo-card ${todo.completed ? "completed" : ""}`;
      card.innerHTML = `
        <input type="checkbox" class="toggle-checkbox" data-id="${todo._id}" ${todo.completed ? "checked" : ""}>
        <span>${todo.title}</span>
        <button class="delete-btn" data-id="${todo._id}">🗑️</button>
      `;
      todoListContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading todos:", err);
  }
}

async function addTodo() {
  const title = titleInput.value.trim();
  const priority = priorityInput.value;
  if (!title) return;

  try {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority }),
    });
    titleInput.value = "";
    loadTodos();
  } catch (err) {
    console.error("Error adding todo:", err);
  }
}

async function toggleComplete(id) {
  try {
    const response = await fetch(`/api/todos/${id}`, { method: "PATCH" });
    const updatedTodo = await response.json();
    loadTodos();

    if (updatedTodo.completed) {
      addXP(20);
    }
  } catch (err) {
    console.error("Error toggling todo:", err);
  }
}

async function deleteTodo(id) {
  try {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    loadTodos();
  } catch (err) {
    console.error("Error deleting todo:", err);
  }
}

addBtn.addEventListener("click", addTodo);
titleInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addTodo(); });

todoListContainer.addEventListener("change", (e) => {
  if (e.target.classList.contains("toggle-checkbox")) toggleComplete(e.target.dataset.id);
});
todoListContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) deleteTodo(e.target.dataset.id);
});

const statSessionsCountEl = document.getElementById("statSessionsCount");
const statTotalMinutesEl = document.getElementById("statTotalMinutes");
const statTodaySessionsEl = document.getElementById("statTodaySessions");
const statTodayMinutesEl = document.getElementById("statTodayMinutes");
const statsHistoryListEl = document.getElementById("statsHistoryList");

function getDateKey(dateValue) {
  const d = new Date(dateValue);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function loadStats() {
  try {
    const response = await fetch("/api/sessions");
    const sessions = await response.json();

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => {
      return sum + session.duration;
    }, 0);

    statSessionsCountEl.textContent = totalSessions;
    statTotalMinutesEl.textContent = totalMinutes;

    const todayKey = getDateKey(new Date());
    const todaySessions = sessions.filter((session) => {
      return getDateKey(session.completedAt) === todayKey;
    });

    const todayMinutes = todaySessions.reduce((sum, session) => {
      return sum + session.duration;
    }, 0);

    statTodaySessionsEl.textContent = todaySessions.length;
    statTodayMinutesEl.textContent = todayMinutes;

    statsHistoryListEl.innerHTML = "";

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - i);
      const dayKey = getDateKey(dayDate);

      const daySessions = sessions.filter((session) => {
        return getDateKey(session.completedAt) === dayKey;
      });

      const dayMinutes = daySessions.reduce((sum, session) => {
        return sum + session.duration;
      }, 0);

      const label =
        i === 0
          ? "Today"
          : dayDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

      const row = document.createElement("li");
      row.className = `stats-history-row ${dayMinutes === 0 ? "no-study" : ""}`;
      row.innerHTML = `
        <span class="stats-history-day">${label}</span>
        <span class="stats-history-minutes">${dayMinutes} min</span>
      `;
      statsHistoryListEl.appendChild(row);
    }
  } catch (err) {
    console.error("Stats load karne mein error:", err);
  }
}

const clearStatsBtn = document.getElementById("clearStatsBtn");
const clearConfirmModal = document.getElementById("clearConfirmModal");
const confirmClearBtn = document.getElementById("confirmClearBtn");
const cancelClearBtn = document.getElementById("cancelClearBtn");

clearStatsBtn.addEventListener("click", () => {
  clearConfirmModal.classList.remove("hidden");
});

cancelClearBtn.addEventListener("click", () => {
  clearConfirmModal.classList.add("hidden");
});

confirmClearBtn.addEventListener("click", async () => {
  try {
    await fetch("/api/sessions", { method: "DELETE" });

    clearConfirmModal.classList.add("hidden");

    loadStats();
  } catch (err) {
    console.error("Stats clear karne mein error:", err);
  }
});

loadTodos();
loadStats();
loadProgress();

const levelDisplayEl = document.getElementById("levelDisplay");
const xpNumberDisplayEl = document.getElementById("xpNumberDisplay");
const xpBarFillEl = document.getElementById("xpBarFill");
const xpNextLevelTextEl = document.getElementById("xpNextLevelText");

let totalXP = 0;
let currentLevel = 1;

function updateXPDisplay() {
  levelDisplayEl.textContent = currentLevel;
  xpNumberDisplayEl.textContent = `${totalXP} XP`;

  const xpIntoCurrentLevel = totalXP % 200;
  const percent = (xpIntoCurrentLevel / 200) * 100;

  xpBarFillEl.style.width = `${percent}%`;

  const xpNeededForNextLevel = 200 - xpIntoCurrentLevel;
  xpNextLevelTextEl.textContent = `${xpNeededForNextLevel} XP to Level ${currentLevel + 1}`;
}

async function loadProgress() {
  try {
    const response = await fetch("/api/progress");
    const progress = await response.json();

    totalXP = progress.totalXP;
    currentLevel = progress.level;

    updateXPDisplay();
  } catch (err) {
    console.error("Progress load karne mein error:", err);
  }
}

async function addXP(amount) {
  try {
    const response = await fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xpToAdd: amount }),
    });

    const updatedProgress = await response.json();

    totalXP = updatedProgress.totalXP;
    currentLevel = updatedProgress.level;

    updateXPDisplay();
  } catch (err) {
    console.error("XP add karne mein error:", err);
  }
}

const resetXpBtn = document.getElementById("resetXpBtn");
const resetXpConfirmModal = document.getElementById("resetXpConfirmModal");
const confirmResetXpBtn = document.getElementById("confirmResetXpBtn");
const cancelResetXpBtn = document.getElementById("cancelResetXpBtn");

resetXpBtn.addEventListener("click", () => {
  resetXpConfirmModal.classList.remove("hidden");
});

cancelResetXpBtn.addEventListener("click", () => {
  resetXpConfirmModal.classList.add("hidden");
});

confirmResetXpBtn.addEventListener("click", async () => {
  try {
    await fetch("/api/progress", { method: "DELETE" });

    resetXpConfirmModal.classList.add("hidden");

    loadProgress();
  } catch (err) {
    console.error("XP reset karne mein error:", err);
  }
});

const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const stickyWallRight = document.getElementById("stickyWallRight");
const stickyWallLeft = document.getElementById("stickyWallLeft");
const noteColorSwatches = document.querySelectorAll(".note-color-swatch");

let selectedNoteColor = "pink";

noteColorSwatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {

    noteColorSwatches.forEach((s) => s.classList.remove("active"));
    swatch.classList.add("active");

    selectedNoteColor = swatch.dataset.color;
  });
});

function getWallForIndex(index) {
  const group = Math.floor(index / 4);
  return group % 2 === 0 ? stickyWallRight : stickyWallLeft;
}

function createNoteElement(note, playFlyAnimation) {
  const noteEl = document.createElement("div");

  noteEl.className = `wall-sticky-note color-${note.color}`;
  if (playFlyAnimation) {
    noteEl.classList.add("note-fly-in");
  }

  const randomTilt = Math.floor(Math.random() * 14) - 7;
  noteEl.style.setProperty("--note-rotate", `${randomTilt}deg`);

  noteEl.innerHTML = `
    <button class="note-delete-btn" data-id="${note._id}" title="Remove note">✕</button>
    ${note.text}
  `;

  return noteEl;
}

async function loadNotes() {
  try {
    const response = await fetch("/api/notes");
    const notes = await response.json();

    stickyWallRight.innerHTML = "";
    stickyWallLeft.innerHTML = "";

    notes.forEach((note, index) => {

      const noteEl = createNoteElement(note, false);
      const targetWall = getWallForIndex(index);
      targetWall.appendChild(noteEl);
    });
  } catch (err) {
    console.error("Notes load karne mein error:", err);
  }
}

async function addNote() {
  const text = noteInput.value.trim();

  if (text === "") {
    return;
  }

  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, color: selectedNoteColor }),
    });

    const savedNote = await response.json();

    const currentCount = stickyWallRight.children.length + stickyWallLeft.children.length;

    const noteEl = createNoteElement(savedNote, true);
    const targetWall = getWallForIndex(currentCount);
    targetWall.appendChild(noteEl);

    noteInput.value = "";
  } catch (err) {
    console.error("Note add karne mein error:", err);
  }
}

async function deleteNote(id) {
  try {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });

    loadNotes();
  } catch (err) {
    console.error("Note delete karne mein error:", err);
  }
}

addNoteBtn.addEventListener("click", addNote);
noteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addNote();
  }
});

stickyWallRight.addEventListener("click", handleNoteWallClick);
stickyWallLeft.addEventListener("click", handleNoteWallClick);

function handleNoteWallClick(e) {
  if (e.target.classList.contains("note-delete-btn")) {
    const id = e.target.dataset.id;
    deleteNote(id);
  }
}

loadNotes();
// STEP 1: HTML Elements
const todoListContainer = document.getElementById("todoList");
const titleInput = document.getElementById("titleInput");
const priorityInput = document.getElementById("priorityInput");
const addBtn = document.getElementById("addBtn");

// LEFT MINI SIDEBAR NAVIGATION INTERACTION
const navItems = document.querySelectorAll(".nav-item");
const dynamicPanels = document.querySelectorAll(".dynamic-panel");
const closePanelButtons = document.querySelectorAll(".close-panel-btn");

navItems.forEach(item => {
  item.addEventListener("click", () => {
    const targetId = item.dataset.target;
    const targetPanel = document.getElementById(targetId);

    // Agar click kiya hua panel pehle se hi khula hai, toh usko toggle close kar do
    if (item.classList.contains("active")) {
      item.classList.remove("active");
      targetPanel.classList.add("hidden");
    } else {
      // Baki saare panels aur indicators clear karo
      navItems.forEach(nav => nav.classList.remove("active"));
      dynamicPanels.forEach(panel => panel.classList.add("hidden"));

      // Is specific clicked process ko display karo
      item.classList.add("active");
      targetPanel.classList.remove("hidden");
    }
  });
});

// CLOSE BUTTON INSIDE PANELS (❌ trigger management)
closePanelButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const activePanel = e.target.closest(".dynamic-panel");
    if (activePanel) {
      activePanel.classList.add("hidden");
      // Sidebar icons highlight state ko bhi revert karo
      navItems.forEach(nav => {
        if (nav.dataset.target === activePanel.id) {
          nav.classList.remove("active");
        }
      });
    }
  });
});

// VIDEO SCENE SWITCHER
const sceneDropdown = document.getElementById("sceneDropdown");
const sceneVideo = document.getElementById("sceneVideo");

// ==========================================
// AMBIENT SOUNDS — scene ke sath sound link karna
// ------------------------------------------
// SCENE -> AUDIO MAPPING
// Har scene ka apna <audio> element HTML mein hai (audioRain,
// audioSunny, waghera). Bajaye har scene ke liye alag if/else
// likhne ke, hum ek OBJECT banate hain jo scene ka NAAM (string)
// ko uske audio element se JOD deta hai.
//
// C++ comparison: ye bilkul std::map<std::string, Audio*> jaisa
// hai — ya array of structs jaisa (struct { string name; Audio*
// element; }). Farak sirf itna hai ke JS mein object banana aur
// use karna zyada seedha hai — "sceneSounds['rain']" likhte hi
// humein turant sahi audio element mil jata hai, bina loop
// chalaye ya if/else lagaye.
// ==========================================
const sceneSounds = {
  rain: document.getElementById("audioRain"),
  sunny: document.getElementById("audioSunny"),
  snowy: document.getElementById("audioSnowy"),
  windy: document.getElementById("audioWindy"),
  night: document.getElementById("audioNight"),
};

// "currentSceneAudio" hamesha us audio element ko point karta hai
// jo ABHI baj raha hai (ya bajna chahiye) — isse humein pata rehta
// hai ke naye scene pe switch karte waqt KAUNSA audio ROKNA hai.
let currentSceneAudio = null;

const sceneVolumeSlider = document.getElementById("sceneVolumeSlider");
const sceneMuteBtn = document.getElementById("sceneMuteBtn");
let isMuted = false;

// ==========================================
// FUNCTION: Naye scene ki sound bajana (purani ROK kar)
// ==========================================
function playSceneSound(sceneName) {
  // Pehle CURRENTLY playing audio ko ROKO — ".pause()" sound ko
  // rok deta hai, aur "currentTime = 0" use WAPAS SHURU pe le
  // aata hai (taaki agli baar poori tarah se bajay, beech se nahi)
  if (currentSceneAudio) {
    currentSceneAudio.pause();
    currentSceneAudio.currentTime = 0;
  }

  // Object se sahi audio element LOOKUP karo — object ke andar
  // "sceneName" (jaise "rain") ki key dhoondh kar uska audio milta hai
  currentSceneAudio = sceneSounds[sceneName];

  // Naye audio pe wahi volume/mute state apply karo jo slider aur
  // mute button mein set hai — taaki scene badalne se volume reset
  // na ho jaye
  currentSceneAudio.volume = sceneVolumeSlider.value / 100;
  currentSceneAudio.muted = isMuted;

  // Browsers kabhi kabhi audio ko BINA user interaction ke play()
  // hone se rokte hain (autoplay policy) — ".catch()" se hum us
  // error ko silently handle kar lete hain, taaki console mein
  // laal error na aaye
  currentSceneAudio.play().catch(() => {});
}

sceneDropdown.addEventListener("change", (e) => {

    sceneVideo.src = "videos/" + e.target.value + ".mp4";

    sceneVideo.load();

    sceneVideo.play();

    // Video ke sath sath matching ambient sound bhi badlo
    playSceneSound(e.target.value);

});

// ==========================================
// VOLUME SLIDER — 0 se 100 tak, lekin audio.volume 0 se 1 tak
// hoti hai, isliye slider ki value ko /100 karke convert karte hain
// (jaise 50 -> 0.5)
// ==========================================
sceneVolumeSlider.addEventListener("input", () => {
  if (currentSceneAudio) {
    currentSceneAudio.volume = sceneVolumeSlider.value / 100;
  }
});

// ==========================================
// MUTE / UNMUTE BUTTON
// ==========================================
sceneMuteBtn.addEventListener("click", () => {
  isMuted = !isMuted; // true ko false, false ko true — toggle

  if (currentSceneAudio) {
    currentSceneAudio.muted = isMuted;
  }

  // Button ka icon bhi update karo taaki user ko pata chale
  sceneMuteBtn.textContent = isMuted ? "🔇" : "🔊";
});

// Page load hote hi DEFAULT scene ("rain") ki sound bajao
playSceneSound("rain");

// ==========================================
// TODOS LOGIC (GET, POST, PATCH, DELETE)
// ==========================================
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

    // Sirf TAB XP do jab todo COMPLETE hua ho (true) — agar user
    // ne todo ko wapas "un-complete" kiya, XP wapas nahi lete
    // (simple version abhi ke liye, jaisa task mein tha)
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

// ==========================================
// STATS LOGIC — Day 11
// ------------------------------------------
// Backend se saare completed sessions mangwate hain, phir unse
// DO cheezein CALCULATE karte hain: total count aur total minutes.
// Ye "raw data dikhana" nahi hai — hum data ko PROCESS kar rahe
// hain pehle, phir sirf result UI mein dikha rahe hain.
// ==========================================
const statSessionsCountEl = document.getElementById("statSessionsCount");
const statTotalMinutesEl = document.getElementById("statTotalMinutes");
const statTodaySessionsEl = document.getElementById("statTodaySessions");
const statTodayMinutesEl = document.getElementById("statTodayMinutes");
const statsHistoryListEl = document.getElementById("statsHistoryList");

// ==========================================
// HELPER: Kisi bhi date ko "YYYY-MM-DD" string mein badalna
// ------------------------------------------
// Do sessions "SAME DIN" ke hain ya nahi, ye check karne ke liye
// humein sirf DATE chahiye (time nahi) — isliye poori date ko
// ek chhoti STRING "key" mein convert kar rahe hain (jaise
// "2026-07-19"). Do sessions ka key MATCH karega to wo same
// din ke honge — bilkul jaise C++ mein tum kisi struct ko
// std::map ki "key" bana kar group karti ho.
// ==========================================
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

    // ---------- ALL-TIME ----------
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => {
      return sum + session.duration;
    }, 0);

    statSessionsCountEl.textContent = totalSessions;
    statTotalMinutesEl.textContent = totalMinutes;

    // ---------- TODAY ----------
    // ".filter()" array mein se sirf WO items rakhta hai jo condition
    // pe TRUE ho — bilkul C++ mein "if" ke andar push_back() karne
    // jaisa, bas ek line mein. Yahan hum sirf AAJ ke sessions rakh rahe hain.
    const todayKey = getDateKey(new Date());
    const todaySessions = sessions.filter((session) => {
      return getDateKey(session.completedAt) === todayKey;
    });

    const todayMinutes = todaySessions.reduce((sum, session) => {
      return sum + session.duration;
    }, 0);

    statTodaySessionsEl.textContent = todaySessions.length;
    statTodayMinutesEl.textContent = todayMinutes;

    // ---------- LAST 7 DAYS HISTORY ----------
    // Aaj se 6 din peechay tak, har din ka total minutes nikaalte
    // hain — isse ek "mini history list" banti hai (coding websites
    // ke daily-activity jaisi).
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

      // "i === 0" ka matlab ye AAJ ka din hai — uske liye "Today"
      // label dikhao, baaki dinon ke liye short date (jaise "Sat, Jul 18")
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

// ==========================================
// Browser ka built-in "confirm()" CSS se style nahi hota, isliye
// hum apna KHUD ka modal bana rahe hain — bilkul alarm-modal
// jaisa pattern: "hidden" class add/remove karke show/hide karte hain.
// ==========================================
const clearStatsBtn = document.getElementById("clearStatsBtn");
const clearConfirmModal = document.getElementById("clearConfirmModal");
const confirmClearBtn = document.getElementById("confirmClearBtn");
const cancelClearBtn = document.getElementById("cancelClearBtn");

// "Clear Stats" dabane par sirf CONFIRM modal dikhao — abhi
// delete NAHI karna, pehle user se pakka poochna hai
clearStatsBtn.addEventListener("click", () => {
  clearConfirmModal.classList.remove("hidden");
});

// "Cancel" dabane par modal chhupa do, kuch delete mat karo
cancelClearBtn.addEventListener("click", () => {
  clearConfirmModal.classList.add("hidden");
});

// "Yes, Clear" dabane par hi ACTUAL delete request bhejo
confirmClearBtn.addEventListener("click", async () => {
  try {
    await fetch("/api/sessions", { method: "DELETE" });

    clearConfirmModal.classList.add("hidden");

    // Delete hone ke baad Stats card ko refresh karo — ab
    // saare numbers 0 dikhne chahiye
    loadStats();
  } catch (err) {
    console.error("Stats clear karne mein error:", err);
  }
});

loadTodos();
loadStats();
loadProgress();

// ==========================================
// XP & LEVEL SYSTEM
// ------------------------------------------
// XP EK "shared value" hai — do alag features (Todo aur Timer) dono
// isay update karte hain. Isliye humne XP update karne ka logic EK
// hi jagah likha (addXP function), aur dono features (yahan
// toggleComplete, aur timer.js mein saveSession) sirf ise CALL karte
// hain apni apni amount ke sath. Agar kal koi teesra feature
// (Achievements?) bhi XP dena chahe, wo bhi bas "addXP(kuch)" call
// kar dega — logic dobara likhna nahi padega.
// ==========================================
const levelDisplayEl = document.getElementById("levelDisplay");
const xpNumberDisplayEl = document.getElementById("xpNumberDisplay");
const xpBarFillEl = document.getElementById("xpBarFill");
const xpNextLevelTextEl = document.getElementById("xpNextLevelText");

// LOCAL state — page load hote hi backend se "loadProgress()" ye
// values sahi kar deta hai (yaad rakhne ke liye reload ke baad bhi)
let totalXP = 0;
let currentLevel = 1;

// ==========================================
// FUNCTION: XP bar aur level number ki UI update karna
// ------------------------------------------
// Har level 200 XP ka hota hai. "totalXP % 200" (modulo) se pata
// chalta hai CURRENT level ke andar abhi tak kitna XP kama chuke hain
// (hamesha 0 se 199 ke beech ek number) — C++ ke "%" operator jaisa
// hi kaam karta hai yahan. Usay 200 se divide kar ke percentage
// (0-100) nikal lete hain, jo progress bar ki WIDTH ban jata hai.
// ==========================================
function updateXPDisplay() {
  levelDisplayEl.textContent = currentLevel;
  xpNumberDisplayEl.textContent = `${totalXP} XP`;

  const xpIntoCurrentLevel = totalXP % 200;
  const percent = (xpIntoCurrentLevel / 200) * 100;

  // CSS "width" percentage mein set kar rahe hain — style.css mein
  // ".xp-bar-fill" pe "transition: width 0.6s ease" laga hai, isliye
  // ye change AUTOMATICALLY smoothly animate hoga, hume khud animate
  // karne ki zaroorat nahi
  xpBarFillEl.style.width = `${percent}%`;

  // "200 - xpIntoCurrentLevel" batata hai AGLE level tak kitna XP
  // aur chahiye — jaise agar 130 XP is level mein kama liye hain,
  // to 70 XP aur chahiye Level (currentLevel + 1) ke liye
  const xpNeededForNextLevel = 200 - xpIntoCurrentLevel;
  xpNextLevelTextEl.textContent = `${xpNeededForNextLevel} XP to Level ${currentLevel + 1}`;
}

// ==========================================
// FUNCTION: Page load hote hi backend se progress MANGWANA (GET)
// ==========================================
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

// ==========================================
// FUNCTION: Naya XP add karna aur backend mein SAVE karna (PUT)
// ------------------------------------------
// Ye function backend ko sirf "kitna XP ADD karna hai" batata hai
// (jaise 20 ya 50) — actual JOD aur naya level CALCULATE karna
// backend (progressRoutes.js) ka kaam hai. Response mein backend
// jo FINAL totalXP/level bhejta hai, wahi hum yahan store karte hain —
// isse frontend aur database hamesha SYNC rehte hain.
// ==========================================
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

// ==========================================
// RESET XP & LEVEL — bilkul "Clear Stats" jaisa pattern: pehle
// custom confirm modal dikhao, tabhi actual reset karo jab user
// "Yes, Reset" dabaye. Ye sirf totalXP/level ko reset karta hai —
// Todos ya saved Sessions ko bilkul touch nahi karta.
// ==========================================
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

    // Reset ke baad turant naya (0 XP, Level 1) state load karo
    loadProgress();
  } catch (err) {
    console.error("XP reset karne mein error:", err);
  }
});

// ==========================================
// STICKY NOTES — Day 17
// ------------------------------------------
// User Notes panel mein chhota text likhta hai, ek COLOR choose
// karta hai, "Add" dabata hai, aur naya note WALL pe (window ke
// saath) "fly" karke lag jata hai.
// ==========================================
const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const stickyWallRight = document.getElementById("stickyWallRight");
const stickyWallLeft = document.getElementById("stickyWallLeft");
const noteColorSwatches = document.querySelectorAll(".note-color-swatch");

// "selectedNoteColor" yaad rakhta hai user ne ABHI kaunsa color
// choose kiya hai — default "pink" (jo HTML mein already "active" hai)
let selectedNoteColor = "pink";

noteColorSwatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    // Pehle SAARI swatches se "active" hatao, phir sirf clicked
    // wali pe lagao — isse sirf EK hi color highlighted dikhta hai
    noteColorSwatches.forEach((s) => s.classList.remove("active"));
    swatch.classList.add("active");

    selectedNoteColor = swatch.dataset.color;
  });
});

// ==========================================
// HELPER: Kis WALL mein ye note jaana chahiye?
// ------------------------------------------
// PEHLE (aur ab wapas) ye function notes ko "4 right, 4 left, 4
// right..." pattern mein baantta hai — har 4 notes ke baad wall
// switch ho jati hai.
// ==========================================
function getWallForIndex(index) {
  const group = Math.floor(index / 4);
  return group % 2 === 0 ? stickyWallRight : stickyWallLeft;
}

// ==========================================
// HELPER: Ek sticky-note ka HTML element banana
// ------------------------------------------
// Ye function DO jagah se use hota hai: (1) page load pe purane
// saved notes dikhane ke liye [bina fly animation], (2) naya note
// add hone par [fly animation ke SATH].
// ==========================================
function createNoteElement(note, playFlyAnimation) {
  const noteEl = document.createElement("div");

  noteEl.className = `wall-sticky-note color-${note.color}`;
  if (playFlyAnimation) {
    noteEl.classList.add("note-fly-in");
  }

  // Har note ko thoda RANDOM tilt do (jaise sach mein wall pe
  // haath se chipkaya ho)
  const randomTilt = Math.floor(Math.random() * 14) - 7; // -7deg se +6deg tak
  noteEl.style.setProperty("--note-rotate", `${randomTilt}deg`);

  noteEl.innerHTML = `
    <button class="note-delete-btn" data-id="${note._id}" title="Remove note">✕</button>
    ${note.text}
  `;

  return noteEl;
}

// ==========================================
// FUNCTION: Saare saved notes load kar ke sahi wall pe dikhana (GET)
// ==========================================
async function loadNotes() {
  try {
    const response = await fetch("/api/notes");
    const notes = await response.json();

    // Wall ko pehle KHAALI karo, phir sabko dobara rakho — isse
    // delete hone ke baad bhi list sahi reflow ho jati hai
    stickyWallRight.innerHTML = "";
    stickyWallLeft.innerHTML = "";

    notes.forEach((note, index) => {
      // "false" = page load pe fly animation NAHI chalani, warna
      // har refresh pe saare purane notes bhi "urr" ke aayenge
      const noteEl = createNoteElement(note, false);
      const targetWall = getWallForIndex(index);
      targetWall.appendChild(noteEl);
    });
  } catch (err) {
    console.error("Notes load karne mein error:", err);
  }
}

// ==========================================
// FUNCTION: Naya note add karna (POST)
// ==========================================
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

    // Naya note hamesha SABSE AAKHIR mein jaata hai — isliye uska
    // index abhi ki total notes count (dono walls) ke barabar hoga
    const currentCount = stickyWallRight.children.length + stickyWallLeft.children.length;

    // "true" = ye NAYA note hai, isliye fly-in animation chalao
    const noteEl = createNoteElement(savedNote, true);
    const targetWall = getWallForIndex(currentCount);
    targetWall.appendChild(noteEl);

    noteInput.value = "";
  } catch (err) {
    console.error("Note add karne mein error:", err);
  }
}

// ==========================================
// FUNCTION: Note DELETE karna (jab user "done" ho aur note hataye)
// ==========================================
async function deleteNote(id) {
  try {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });

    // Poori list dobara load karna sabse simple/safe tareeka hai —
    // isse baaki notes bhi apni SAHI wall mein reflow ho jate hain
    // (jaise agar 5th note delete ho, to 6th note ab left wall
    // se right wall mein "shift" ho jayega)
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

// EVENT DELEGATION: dono walls ke jitne bhi notes hain, un sab ke
// delete (✕) buttons ke liye listener
stickyWallRight.addEventListener("click", handleNoteWallClick);
stickyWallLeft.addEventListener("click", handleNoteWallClick);

function handleNoteWallClick(e) {
  if (e.target.classList.contains("note-delete-btn")) {
    const id = e.target.dataset.id;
    deleteNote(id);
  }
}

// Page load hote hi purane saved notes dikhao
loadNotes();
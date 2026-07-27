const timerDisplay = document.getElementById("timerDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const studyModeBtn = document.getElementById("studyModeBtn");
const breakModeBtn = document.getElementById("breakModeBtn");
const studyMinutesInput = document.getElementById("studyMinutesInput");
const breakMinutesInput = document.getElementById("breakMinutesInput");

const alarmSound = document.getElementById("alarmSound");
const alarmModal = document.getElementById("alarmModal");
const dismissBtn = document.getElementById("dismissBtn");

const floatingTimerWidget = document.getElementById("floatingTimerWidget");
const floatingTimerText = document.getElementById("floatingTimerText");

let currentMode = "study";

let remainingSeconds = 0;

let timerId = null;
let isRunning = false;

function getModeSeconds(mode) {

  const inputField = mode === "study" ? studyMinutesInput : breakMinutesInput;

  let minutes = parseInt(inputField.value);

  if (isNaN(minutes) || minutes < 1) {
    minutes = mode === "study" ? 25 : 5;
    inputField.value = minutes;
  }

  return minutes * 60;
}

function updateDisplay() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const minutesText = String(minutes).padStart(2, "0");
  const secondsText = String(seconds).padStart(2, "0");

  timerDisplay.textContent = `${minutesText}:${secondsText}`;

  floatingTimerText.textContent = `${minutesText}:${secondsText}`;
}

function switchMode(newMode) {

  if (isRunning) {
    pauseTimer();
  }

  currentMode = newMode;

  studyModeBtn.classList.toggle("active", newMode === "study");
  breakModeBtn.classList.toggle("active", newMode === "break");

  remainingSeconds = getModeSeconds(newMode);
  updateDisplay();
}

function startTimer() {
  if (isRunning) {
    return;
  }

  isRunning = true;

  floatingTimerWidget.classList.remove("ft-hidden");

  timerId = setInterval(() => {
    remainingSeconds = remainingSeconds - 1;
    updateDisplay();

    if (remainingSeconds <= 0) {
      clearInterval(timerId);
      isRunning = false;

      floatingTimerWidget.classList.add("ft-hidden");

      alarmSound.loop = true;
      alarmSound.play();

      alarmModal.classList.remove("hidden");

      if (currentMode === "study") {
        saveSession();
      }
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerId);
  isRunning = false;

  floatingTimerWidget.classList.add("ft-hidden");
}

function resetTimer() {
  clearInterval(timerId);
  isRunning = false;

  floatingTimerWidget.classList.add("ft-hidden");

  remainingSeconds = getModeSeconds(currentMode);
  updateDisplay();
}

async function saveSession() {
  try {

    const duration = parseInt(studyMinutesInput.value);

    await fetch("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        mode: currentMode,
        duration: duration,
      }),
    });

    loadStats();

    addXP(50);
  } catch (err) {
    console.error("Session save karne mein error:", err);
  }
}

function dismissAlarm() {

  alarmSound.pause();
  alarmSound.currentTime = 0;

  alarmModal.classList.add("hidden");
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

studyModeBtn.addEventListener("click", () => switchMode("study"));
breakModeBtn.addEventListener("click", () => switchMode("break"));

dismissBtn.addEventListener("click", dismissAlarm);

floatingTimerWidget.addEventListener("click", () => {
  document.querySelector('.nav-item[data-target="section-pomodoro"]').click();
});

remainingSeconds = getModeSeconds(currentMode);
updateDisplay();

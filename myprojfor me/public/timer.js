// public/timer.js
// Ye file Pomodoro Timer ka poora logic sambhalti hai — ab is baar
// TWO modes hain (Study/Break), aur time FIXED nahi hai — user khud
// minutes enter karta hai har mode ke liye.

// STEP 1: HTML se zaroori elements "pakadna"
const timerDisplay = document.getElementById("timerDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const studyModeBtn = document.getElementById("studyModeBtn");
const breakModeBtn = document.getElementById("breakModeBtn");
const studyMinutesInput = document.getElementById("studyMinutesInput");
const breakMinutesInput = document.getElementById("breakMinutesInput");

// Alarm aur modal ke elements
const alarmSound = document.getElementById("alarmSound");
const alarmModal = document.getElementById("alarmModal");
const dismissBtn = document.getElementById("dismissBtn");

// Floating mini timer widget (room ke top-right corner ka glass pill) —
// isse hum sirf DISPLAY sync aur show/hide karte hain, koi naya
// countdown logic nahi — asal countdown wahi upar wala hai
const floatingTimerWidget = document.getElementById("floatingTimerWidget");
const floatingTimerText = document.getElementById("floatingTimerText");

// ==========================================
// STATE VARIABLES
// ==========================================

// "currentMode" batata hai abhi KAUNSA mode active hai — "study" ya "break".
// Pehle humare paas sirf EK fixed constant tha (FOCUS_TIME). Ab humein
// YAAD RAKHNA padta hai ke user abhi kis mode mein hai, kyunki dono
// modes ka apna alag time hota hai.
let currentMode = "study";

// "remainingSeconds" ab FIXED number se shuru nahi hota — ye function
// se set hota hai jo current mode ke input field se value padhta hai
// (dekho neeche "getModeSeconds" function)
let remainingSeconds = 0;

let timerId = null;
let isRunning = false;

// ==========================================
// FUNCTION: Current mode ka input field padh kar SECONDS mein return karna
// ==========================================
//
// Ye function wahi kaam karta hai jo pehle humara FIXED constant
// (FOCUS_TIME = 25 * 60) karta tha — bas ab value HARDCODE nahi hai,
// balke HTML input se dynamically aati hai.
function getModeSeconds(mode) {
  // Decide karo KAUNSA input field padhna hai, mode ke hisaab se
  const inputField = mode === "study" ? studyMinutesInput : breakMinutesInput;

  // input.value HAMESHA STRING hoti hai, chahe user ne number hi
  // type kiya ho — isliye humein ise explicitly NUMBER mein convert
  // karna zaroori hai. parseInt() yehi kaam karta hai.
  //
  // C++ comparison: bilkul "std::stoi()" jaisa — string ko int mein badalna.
  let minutes = parseInt(inputField.value);

  // VALIDATION: agar user ne khaali chhod diya, ya 0/negative/text
  // daal diya, "parseInt" ya to NaN dega ya invalid number dega.
  // Aise mein hum ek safe default use karte hain, aur input field
  // ko bhi wapas us default pe set kar dete hain (taaki user ko
  // dikhe ke uski value reject ho gayi).
  if (isNaN(minutes) || minutes < 1) {
    minutes = mode === "study" ? 25 : 5;
    inputField.value = minutes;
  }

  // Minutes ko seconds mein convert karo (setInterval seconds mein chalta hai)
  return minutes * 60;
}

// ==========================================
// FUNCTION: MM:SS display update karna
// ==========================================
function updateDisplay() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const minutesText = String(minutes).padStart(2, "0");
  const secondsText = String(seconds).padStart(2, "0");

  timerDisplay.textContent = `${minutesText}:${secondsText}`;

  // Floating widget hamesha SAME text dikhata hai jo panel ke andar
  // wala display — dono ek hi "remainingSeconds" se drive hote hain,
  // isliye alag se koi state maintain nahi karni padi
  floatingTimerText.textContent = `${minutesText}:${secondsText}`;
}

// ==========================================
// FUNCTION: Mode SWITCH karna (Study <-> Break)
// ==========================================
function switchMode(newMode) {
  // Agar timer CHAL raha hai, to mode badalne se pehle use rokna zaroori hai —
  // warna purana interval naye mode ke sath bhi chalta rahega, aur
  // countdown confuse ho jayega.
  if (isRunning) {
    pauseTimer();
  }

  currentMode = newMode;

  // Dono tabs se "active" class hatao, phir sirf selected wale pe lagao —
  // isse visually pata chalta hai kaunsa mode chal raha hai
  studyModeBtn.classList.toggle("active", newMode === "study");
  breakModeBtn.classList.toggle("active", newMode === "break");

  // Naye mode ka time load karo aur display update karo
  remainingSeconds = getModeSeconds(newMode);
  updateDisplay();
}

// ==========================================
// FUNCTION: Timer START karna
// ==========================================
function startTimer() {
  if (isRunning) {
    return;
  }

  isRunning = true;

  // Timer chalna shuru hote hi floating widget ko FADE-IN karo —
  // ye tabhi dikhna chahiye jab study/break actively chal rahi ho
  floatingTimerWidget.classList.remove("ft-hidden");

  timerId = setInterval(() => {
    remainingSeconds = remainingSeconds - 1;
    updateDisplay();

    if (remainingSeconds <= 0) {
      clearInterval(timerId);
      isRunning = false;

      // Session complete — widget ki ab zaroorat nahi, fade-out kar do
      floatingTimerWidget.classList.add("ft-hidden");

      // Alarm bajao — .loop = true matlab khatam hone pe khud
      // dobara shuru ho jayega, jab tak hum khud ROKEIN
      alarmSound.loop = true;
      alarmSound.play();

      // Modal dikhao ("hidden" class hatane se CSS use visible kar deta hai)
      alarmModal.classList.remove("hidden");

      // Sirf STUDY mode complete hone par hi session backend mein save karo —
      // Break mode ka session save nahi karna (jaisa requirement thi)
      if (currentMode === "study") {
        saveSession();
      }
    }
  }, 1000);
}

// ==========================================
// FUNCTION: Timer PAUSE karna
// ==========================================
function pauseTimer() {
  clearInterval(timerId);
  isRunning = false;

  // Paused matlab abhi actively study/break nahi ho rahi — widget
  // fade-out kar do, "Start" dabate hi wapas fade-in ho jayega
  floatingTimerWidget.classList.add("ft-hidden");
}

// ==========================================
// FUNCTION: Timer RESET karna
// ==========================================
function resetTimer() {
  clearInterval(timerId);
  isRunning = false;

  // Reset ka matlab bhi "ab active study nahi ho rahi" — widget hide
  floatingTimerWidget.classList.add("ft-hidden");

  // Current mode ka input field DOBARA padho — agar user ne pause
  // ke dauran value badli ho, to Reset us NAYI value se hoga
  remainingSeconds = getModeSeconds(currentMode);
  updateDisplay();
}

// ==========================================
// FUNCTION: Completed Study session backend mein SAVE karna
// ==========================================
//
// Ye async function hai kyunki fetch() network request hai — result
// aane mein thoda time lagta hai, isliye "await" use karte hain.
async function saveSession() {
  try {
    // Jo minutes user ne is Study session ke liye enter kiye the,
    // wahi "duration" ke taur pe backend ko bhej rahe hain
    const duration = parseInt(studyMinutesInput.value);

    await fetch("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // JSON.stringify() JS object ko ek JSON STRING mein convert
      // karta hai — fetch() ka body hamesha string/text hona chahiye,
      // seedha object nahi bhej sakte
      body: JSON.stringify({
        mode: currentMode,
        duration: duration,
      }),
    });

    // Session save hote hi Stats card ko TURANT refresh karo, taaki
    // user ko naya session count/minutes dikhne ke liye page reload
    // na karna pade. "loadStats" function script.js mein defined hai —
    // script.js aur timer.js dono browser mein EK HI global scope
    // share karte hain (dono <script> tags same page pe load hote hain),
    // isliye ye function yahan bina import ke seedha call ho jata hai.
    loadStats();

    // Study session complete hone par +50 XP. "addXP" script.js mein
    // defined hai, lekin script.js aur timer.js dono same page pe
    // load hote hain (ek hi global scope share karte hain), isliye
    // ye function yahan bina import ke seedha call ho jata hai —
    // bilkul jaise "loadStats()" bhi upar isi tarah call kiya.
    addXP(50);
  } catch (err) {
    console.error("Session save karne mein error:", err);
  }
}

// ==========================================
// FUNCTION: Alarm DISMISS karna
// ==========================================
function dismissAlarm() {
  // Audio ko rokna — sirf pause() se sound RUK jata hai, lekin
  // agar dobara play karein to jahan se ruka tha wahin se bajega.
  // "currentTime = 0" se hum use WAPAS SHURU pe le aate hain,
  // taaki agli baar poori tarah se bajay, beech se nahi.
  alarmSound.pause();
  alarmSound.currentTime = 0;

  // Modal wapas chhupa do
  alarmModal.classList.add("hidden");
}

// ==========================================
// EVENT LISTENERS
// ==========================================
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

studyModeBtn.addEventListener("click", () => switchMode("study"));
breakModeBtn.addEventListener("click", () => switchMode("break"));

dismissBtn.addEventListener("click", dismissAlarm);

// Widget pe click karne se poora Timer panel khulta hai (edit/reset
// ke liye) — hum khud koi naya panel-open logic nahi likh rahe,
// bas wahi ".nav-item" jo already script.js mein handle hota hai,
// use programmatically click kar dete hain
floatingTimerWidget.addEventListener("click", () => {
  document.querySelector('.nav-item[data-target="section-pomodoro"]').click();
});

// Page load hote hi Study Mode ka default time dikhao
remainingSeconds = getModeSeconds(currentMode);
updateDisplay();
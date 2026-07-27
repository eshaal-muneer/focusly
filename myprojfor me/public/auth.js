// public/auth.js
// Login/Signup page ka logic — tab switching, form submit, aur
// errors dikhana. Yahan koi complex state nahi hai, bas do forms
// ke beech toggle aur fetch() calls "/api/auth/login" ya
// "/api/auth/signup" pe.

const loginTabBtn = document.getElementById("loginTabBtn");
const signupTabBtn = document.getElementById("signupTabBtn");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginSwitchText = document.getElementById("loginSwitchText");
const signupSwitchText = document.getElementById("signupSwitchText");
const goToSignup = document.getElementById("goToSignup");
const goToLogin = document.getElementById("goToLogin");
const authError = document.getElementById("authError");

// ==========================================
// FUNCTION: Login form dikhao ya Signup form — dono tab-buttons,
// forms, aur neeche wala "switch" link sab ek sath update karte hain
// ==========================================
function showTab(tab) {
  const isLogin = tab === "login";

  loginTabBtn.classList.toggle("active", isLogin);
  signupTabBtn.classList.toggle("active", !isLogin);

  loginForm.classList.toggle("hidden", !isLogin);
  signupForm.classList.toggle("hidden", isLogin);

  loginSwitchText.classList.toggle("hidden", !isLogin);
  signupSwitchText.classList.toggle("hidden", isLogin);

  hideError();
}

function showError(message) {
  authError.textContent = message;
  authError.classList.remove("hidden");
}

function hideError() {
  authError.classList.add("hidden");
}

// Tab buttons aur "switch" links — dono se tab badal sakte hain
loginTabBtn.addEventListener("click", () => showTab("login"));
signupTabBtn.addEventListener("click", () => showTab("signup"));

// ==========================================
// PASSWORD SHOW/HIDE (eye icon) — har password field ke sath ek
// chhota button hai jo uska "type" password<->text switch karta hai.
// Icon hamesha "eye" hi rehta hai (SVG) — bas jab password VISIBLE
// (type="text") ho, eye ke upar ek diagonal strike-line aa jati hai
// (CSS ".is-visible" class se) — koi monkey/emoji nahi use kiya.
// ==========================================
document.querySelectorAll(".auth-eye-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";
    // Password abhi VISIBLE hai to eye ke upar strike-line dikhao
    btn.classList.toggle("is-visible", isHidden);
  });
});

goToSignup.addEventListener("click", (e) => {
  e.preventDefault();
  showTab("signup");
});

goToLogin.addEventListener("click", (e) => {
  e.preventDefault();
  showTab("login");
});

// ==========================================
// LOGIN FORM SUBMIT
// ==========================================
loginForm.addEventListener("submit", async (e) => {
  // Default behaviour rokna zaroori hai — warna browser page ko
  // REFRESH kar dega (normal HTML form jaisa), aur humara fetch()
  // kabhi chalega hi nahi
  e.preventDefault();
  hideError();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Login mein masla hua");
      return;
    }

    // Login successful — session cookie khud-ba-khud browser mein
    // set ho chuki hai (backend ne bheji), ab bas main app pe le jao
    window.location.href = "/index.html";
  } catch (err) {
    showError("Server se connect nahi ho pa raha. Dobara try karein.");
  }
});

// ==========================================
// SIGNUP FORM SUBMIT
// ==========================================
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Account banane mein masla hua");
      return;
    }

    // Signup ke sath hi backend ne turant login bhi kar diya hai
    // (authRoutes.js dekho) — seedha main app pe le jao
    window.location.href = "/index.html";
  } catch (err) {
    showError("Server se connect nahi ho pa raha. Dobara try karein.");
  }
});

// ==========================================
// PAGE LOAD: agar user PEHLE SE login hai, to login/signup form
// dikhane ki zaroorat nahi — seedha main app pe bhej do
// ==========================================
(async function checkExistingSession() {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      window.location.href = "/index.html";
    }
  } catch (err) {
    // Server se baat na ho paaye to bhi login form hi dikhte rehna
    // theek hai — user manually try kar sakta hai
  }
})();

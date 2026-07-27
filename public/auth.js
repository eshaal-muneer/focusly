const loginTabBtn = document.getElementById("loginTabBtn");
const signupTabBtn = document.getElementById("signupTabBtn");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginSwitchText = document.getElementById("loginSwitchText");
const signupSwitchText = document.getElementById("signupSwitchText");
const goToSignup = document.getElementById("goToSignup");
const goToLogin = document.getElementById("goToLogin");
const authError = document.getElementById("authError");

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

loginTabBtn.addEventListener("click", () => showTab("login"));
signupTabBtn.addEventListener("click", () => showTab("signup"));

document.querySelectorAll(".auth-eye-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";

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

loginForm.addEventListener("submit", async (e) => {

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

    window.location.href = "/index.html";
  } catch (err) {
    showError("Server se connect nahi ho pa raha. Dobara try karein.");
  }
});

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

    window.location.href = "/index.html";
  } catch (err) {
    showError("Server se connect nahi ho pa raha. Dobara try karein.");
  }
});

(async function checkExistingSession() {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      window.location.href = "/index.html";
    }
  } catch (err) {

  }
})();

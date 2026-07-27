// public/authGuard.js
// Ye script index.html mein SABSE PEHLE load hoti hai (script.js se
// bhi pehle) — page dikhne se PEHLE check karti hai ke user login
// hai ya nahi. Agar nahi, seedha login page pe bhej deti hai, taaki
// koi bina login ke app ka data (todos, notes, XP) na dekh sake.

(async function checkAuth() {
  try {
    const res = await fetch("/api/auth/me");

    if (!res.ok) {
      // Login nahi hai — auth page pe bhej do
      window.location.href = "/auth.html";
      return;
    }

    const data = await res.json();

    // Login CONFIRM ho gaya — ab room ko dikha do (index.html ke
    // <head> mein wo inline style hai jo isse abhi tak chhupaye
    // hue thi, taaki redirect hone se pehle room "flash" na ho)
    document.body.classList.add("auth-checked");

    // TOP-RIGHT CORNER mein ek chhota "anonymous user" badge banao —
    // avatar icon upar, "Logout" text neeche. Poora "body" ke fixed
    // corner mein hai, isliye sidebar ki height/overflow se koi
    // farak nahi padta, hamesha visible rahega.
    const userBadge = document.createElement("div");
    userBadge.id = "userBadge";
    userBadge.className = "user-badge-corner";
    userBadge.title = data.user.username;
    userBadge.innerHTML = `
      <div class="user-badge-avatar">👤</div>
      <span class="user-badge-logout-text">Logout</span>
    `;
    document.body.appendChild(userBadge);

    userBadge.addEventListener("click", async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/auth.html";
    });
  } catch (err) {
    // Server se baat hi na ho paaye to bhi safe side lete hue
    // login page pe bhej do
    window.location.href = "/auth.html";
  }
})();

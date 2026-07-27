(async function checkAuth() {
  try {
    const res = await fetch("/api/auth/me");

    if (!res.ok) {

      window.location.href = "/auth.html";
      return;
    }

    const data = await res.json();

    document.body.classList.add("auth-checked");

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

    window.location.href = "/auth.html";
  }
})();

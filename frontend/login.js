document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userId", data.userId);
        window.location.href = "index.html"; // redirect to dashboard
    } else {
        document.getElementById("loginMessage").textContent = data.error || "Login failed";
    }
});
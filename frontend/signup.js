document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("signupUsername").value;
    const password = document.getElementById("signupPassword").value;

    const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
        alert("Signup successful! Please login.");
        window.location.href = "login.html";
    } else {
        document.getElementById("signupMessage").textContent = data.error || "Signup failed";
    }
});
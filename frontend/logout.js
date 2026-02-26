document.getElementById("logoutBtn").addEventListener("click", () => {
    // Clear login state
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userId");

    // Redirect to login page
    window.location.href = "login.html";
});
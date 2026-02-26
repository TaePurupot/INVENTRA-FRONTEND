const express = require("express");

module.exports = () => {
  const router = express.Router();

  // Simple hardcoded login (replace with DB users later)
  router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "1234") {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });

  return router;
};
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const db = new sqlite3.Database(path.join(__dirname, "database/inventra.db"), (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Import routes
const productRoutes = require("./routes/products")(db);
const salesRoutes = require("./routes/sales")(db);

app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);

// SIGNUP route
app.post("/api/signup", (req, res) => {
    const { username, password } = req.body;

    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], function (err) {
        if (err) {
            return res.status(400).json({ success: false, error: "Username already exists" });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// LOGIN route
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(401).json({ success: false, error: "Invalid credentials" });

        res.json({ success: true, userId: row.id });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
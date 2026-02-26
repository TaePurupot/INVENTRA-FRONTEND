// backend/routes/products.js
const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // GET all products
    router.get("/", (req, res) => {
        db.all("SELECT * FROM products", [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // GET single product
    router.get("/:id", (req, res) => {
        const id = req.params.id;
        db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: "Product not found" });
            res.json(row);
        });
    });

    // ADD product
    router.post("/", (req, res) => {
        const { name, sku, quantity, price } = req.body;

        db.run(
            `INSERT INTO products (name, sku, quantity, price)
             VALUES (?, ?, ?, ?)`,
            [name, sku, quantity, price],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID });
            }
        );
    });

    // UPDATE product
    router.put("/:id", (req, res) => {
        const id = req.params.id;
        const { name, sku, quantity, price } = req.body;

        db.run(
            `UPDATE products 
             SET name = COALESCE(?, name),
                 sku = COALESCE(?, sku),
                 quantity = COALESCE(?, quantity),
                 price = COALESCE(?, price)
             WHERE id = ?`,
            [name, sku, quantity, price, id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            }
        );
    });

    // DELETE product
    router.delete("/:id", (req, res) => {
        const id = req.params.id;
        db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
            res.json({ success: true });
        });
    });

    return router;
};
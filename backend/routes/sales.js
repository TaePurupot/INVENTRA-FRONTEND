// backend/routes/sales.js
const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // SELL PRODUCT
    router.post("/", (req, res) => {
        const { productId, quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ error: "Quantity must be a positive integer." });
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            db.get(
                "SELECT * FROM products WHERE id = ?",
                [productId],
                (err, product) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: err.message });
                    }
                    if (!product) {
                        db.run("ROLLBACK");
                        return res.status(404).json({ error: "Product not found" });
                    }

                    if (product.quantity < quantity) {
                        db.run("ROLLBACK");
                        return res.json({ success: false, message: "Not enough stock" });
                    }

                    const newQty = product.quantity - quantity;

                    db.run(
                        "UPDATE products SET quantity = ? WHERE id = ?",
                        [newQty, productId],
                        function (err) {
                            if (err) {
                                db.run("ROLLBACK");
                                return res.status(500).json({ error: err.message });
                            }

                            // Record sale
                            db.run(
                                "INSERT INTO sales (productId, quantity) VALUES (?, ?)",
                                [productId, quantity],
                                function (err) {
                                    if (err) {
                                        db.run("ROLLBACK");
                                        return res.status(500).json({ error: err.message });
                                    }

                                    db.run("COMMIT");
                                    res.json({
                                        success: true,
                                        remaining: newQty,
                                        saleId: this.lastID
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    });

    // GET sales history
    router.get("/", (req, res) => {
        db.all("SELECT * FROM sales ORDER BY date DESC", [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    return router;
};
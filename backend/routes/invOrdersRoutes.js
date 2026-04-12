const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ CREATE ORDER
router.post("/", (req, res) => {
  const {
    order_id,
    product,
    customer,
    quantity,
    delivery_date,
    inventory_status,
  } = req.body;

  const sql = `
    INSERT INTO inv_orders 
    (order_id, product, customer, quantity, delivery_date, inventory_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [order_id, product, customer, quantity, delivery_date, inventory_status],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json(err);
      }

      res.json({ message: "Order created successfully" });
    }
  );
});

// ✅ GET ORDERS (for your dashboard later)
router.get("/", (req, res) => {
  const sql = "SELECT * FROM inv_orders ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json(result);
  });
});

module.exports = router;

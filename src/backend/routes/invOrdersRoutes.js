const express = require("express");
const router = express.Router();
const pool = require('../config/db');
const { recordStockMovement } = require('../controllers/stockController');

const createAutoReorderRequest = async (material) => {
  if (!material || Number(material.quantity) >= Number(material.min_stock || 20)) {
    return null;
  }

  const [existing] = await pool.query(
    "SELECT id FROM requests WHERE material = ? AND status IN ('Pending','Approved','In Progress') LIMIT 1",
    [material.name]
  );

  if (existing.length > 0) {
    return null;
  }

  const reorderAmount = Math.max(Number(material.min_stock || 20) * 2 - Number(material.quantity), Number(material.min_stock || 20));
  const requestId = `RO-${Date.now()}`;

  const [result] = await pool.query(
    'INSERT INTO requests (request_id, job_id, material, quantity, requested_by, status) VALUES (?, ?, ?, ?, ?, ?)',
    [requestId, null, material.name, reorderAmount, 'System Auto Reorder', 'Pending']
  );

  return {
    id: result.insertId,
    request_id: requestId,
    material: material.name,
    quantity: reorderAmount,
    requested_by: 'System Auto Reorder',
    status: 'Pending'
  };
};

// ✅ CREATE ORDER
router.post("/", async (req, res) => {
  const {
    order_id,
    product,
    customer,
    supplier_id,
    quantity,
    delivery_date,
    eta_date,
    inventory_status,
  } = req.body;

  const sql = `
    INSERT INTO inv_orders 
    (order_id, product, customer, supplier_id, quantity, delivery_date, eta_date, inventory_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.query(
      sql,
      [order_id, product, customer, supplier_id || null, quantity, delivery_date, eta_date || null, inventory_status]
    );

    res.status(201).json({ message: "Order created successfully", id: result.insertId });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ORDERS
router.get("/", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM inv_orders ORDER BY id DESC");
    res.json(result);
  } catch (err) {
    console.error("GET Orders Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE ORDER STATUS
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { inventory_status } = req.body;

  try {
    const [orders] = await pool.query("SELECT * FROM inv_orders WHERE id = ?", [id]);
    if (!orders.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[0];
    const wasDelivered = order.inventory_status === 'Delivered';

    let query = "UPDATE inv_orders SET inventory_status = ?";
    const queryParams = [inventory_status];

    if (inventory_status === "Delivered" && !wasDelivered) {
      query += ", received_date = CURRENT_DATE()";
    }

    query += " WHERE id = ?";
    queryParams.push(id);

    await pool.query(query, queryParams);

    if (inventory_status === "Delivered" && !wasDelivered) {
      const [materials] = await pool.query(
        "SELECT * FROM materials WHERE name = ? LIMIT 1",
        [order.product]
      );

      if (materials.length) {
        const material = materials[0];
        const newQuantity = Number(material.quantity) + Number(order.quantity);

        await pool.query(
          "UPDATE materials SET quantity = ? WHERE id = ?",
          [newQuantity, material.id]
        );

        await recordStockMovement(
          material,
          'Purchase Receipt',
          Number(order.quantity),
          newQuantity,
          `Received order ${order.order_id}`,
          'Purchase Order',
          order.id
        );

        await createAutoReorderRequest({
          ...material,
          quantity: newQuantity,
          min_stock: material.min_stock || 20
        });
      }
    }

    res.json({ message: `Order status updated to ${inventory_status}` });
  } catch (err) {
    console.error("UPDATE Order Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE ORDER
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM inv_orders WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("DELETE Order Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

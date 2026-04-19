const express = require('express');
const router  = express.Router();

// GET all returns
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const query = `
    SELECT r.*, o.customer_name, o.item_name 
    FROM returns r
    JOIN orders o ON r.order_id = o.id
    ORDER BY r.created_at DESC
  `;
  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: rows });
  });
});

// POST create return request
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { order_id, reason, type, status } = req.body;

  if (!order_id || !reason)
    return res.status(400).json({ success: false, message: 'order_id and reason are required' });

  const query = 'INSERT INTO returns (order_id, reason, type, status) VALUES (?,?,?,?)';
  const params = [order_id, reason, type || 'return', status || 'pending'];

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    
    // Update order status to 'returned' if it's a return
    if (status === 'completed' || type === 'return') {
       db.query('UPDATE orders SET status = "returned" WHERE id = ?', [order_id]);
    }

    res.status(201).json({ success: true, message: 'Return request created', id: result.insertId });
  });
});

// PATCH update return status
router.patch('/:id/status', (req, res) => {
  const db = req.app.locals.db;
  const { status } = req.body;
  db.query('UPDATE returns SET status=? WHERE id=?', [status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Return status updated' });
  });
});

module.exports = router;

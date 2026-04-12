const express = require('express');
const router  = express.Router();

// GET all customers
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const query = `
    SELECT c.*, 
    (SELECT COUNT(*) FROM orders WHERE customer_name = c.name) as total_orders,
    (SELECT MAX(created_at) FROM orders WHERE customer_name = c.name) as last_order_date
    FROM customers c
    ORDER BY c.name ASC
  `;
  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: rows });
  });
});

// GET customer details with order history
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.query('SELECT * FROM customers WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Customer not found' });
    
    const customer = rows[0];
    db.query('SELECT * FROM orders WHERE customer_name = ? ORDER BY created_at DESC', [customer.name], (err, orders) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, data: { ...customer, orders } });
    });
  });
});

// POST create customer
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { name, email, phone, address } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

  db.query('INSERT INTO customers (name, email, phone, address) VALUES (?,?,?,?)', 
    [name, email, phone, address], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.status(201).json({ success: true, message: 'Customer created', id: result.insertId });
  });
});

module.exports = router;

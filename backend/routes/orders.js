const express = require('express');
const router  = express.Router();

// GET all orders with stats
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { status, search } = req.query;
  let query = 'SELECT * FROM orders';
  const params = [];

  const conditions = [];
  if (status && status !== 'all') {
    conditions.push('status = ?');
    params.push(status);
  }
  if (search) {
    conditions.push('(customer_name LIKE ? OR item_name LIKE ? OR id LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY created_at DESC';

  db.query(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: rows });
  });
});

// GET order summary/stats
router.get('/stats', (req, res) => {
  const db = req.app.locals.db;
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
      SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
      SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
    FROM orders
  `;
  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: rows[0] });
  });
});

// GET single order details with history
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const orderId = req.params.id;

  db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    
    const order = rows[0];
    
    db.query('SELECT * FROM order_history WHERE order_id = ? ORDER BY created_at DESC', [orderId], (err, history) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, data: { ...order, history } });
    });
  });
});

// POST create order
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { 
    customer_name, email, mobile_number, delivery_address, 
    item_name, quantity, price, status, priority, 
    shipping_method, courier_details, tracking_number, remarks 
  } = req.body;

  if (!customer_name || !item_name || !quantity || !price)
    return res.status(400).json({ success: false, message: 'Missing required fields' });

  const query = `
    INSERT INTO orders (
      customer_name, email, mobile_number, delivery_address, 
      item_name, quantity, price, status, priority, 
      shipping_method, courier_details, tracking_number, remarks
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;
  const params = [
    customer_name, email, mobile_number, delivery_address, 
    item_name, quantity, price, status || 'new', priority || 'medium', 
    shipping_method, courier_details, tracking_number, remarks
  ];

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    
    // Auto-sync Customer profile
    db.query('SELECT * FROM customers WHERE name = ?', [customer_name], (cErr, cRows) => {
      if (!cErr && cRows.length === 0) {
        db.query('INSERT INTO customers (name, email, address) VALUES (?,?,?)', 
          [customer_name, email, delivery_address], (insErr) => {
            if (insErr) console.error('Auto-customer creation failed:', insErr.message);
          });
      }
    });

    // Log initial history
    db.query('INSERT INTO order_history (order_id, status, remarks) VALUES (?,?,?)', 
      [result.insertId, status || 'new', 'Order created manually'], (hErr) => {
        if (hErr) console.error('History log error:', hErr.message);
      }
    );

    res.status(201).json({ success: true, message: 'Order created', id: result.insertId });
  });
});

// PATCH update status
router.patch('/:id/status', (req, res) => {
  const db = req.app.locals.db;
  const { status, remarks } = req.body;
  const valid = ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

  db.query('UPDATE orders SET status=? WHERE id=?', [status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Order not found' });
    
    // Log history
    db.query('INSERT INTO order_history (order_id, status, remarks) VALUES (?,?,?)', 
      [req.params.id, status, remarks || `Status changed to ${status}`], (hErr) => {
        if (hErr) console.error('History log error:', hErr.message);
      }
    );

    res.json({ success: true, message: 'Status updated' });
  });
});

// PUT update order
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { 
    customer_name, email, mobile_number, delivery_address, 
    item_name, quantity, price, status, priority, 
    shipping_method, courier_details, tracking_number, remarks 
  } = req.body;

  const query = `
    UPDATE orders SET 
      customer_name=?, email=?, mobile_number=?, delivery_address=?, 
      item_name=?, quantity=?, price=?, status=?, priority=?, 
      shipping_method=?, courier_details=?, tracking_number=?, remarks=?
    WHERE id=?
  `;
  const params = [
    customer_name, email, mobile_number, delivery_address, 
    item_name, quantity, price, status, priority, 
    shipping_method, courier_details, tracking_number, remarks,
    req.params.id
  ];

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order updated' });
  });
});

// DELETE
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  const orderId = req.params.id;

  // 1. Get customer name before deleting
  db.query('SELECT customer_name FROM orders WHERE id = ?', [orderId], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });

    const customerName = rows[0].customer_name;

    // 2. Delete the order
    db.query('DELETE FROM orders WHERE id = ?', [orderId], (delErr, result) => {
      if (delErr) return res.status(500).json({ success: false, message: delErr.message });

      // 3. Check if any other orders exist for this customer
      db.query('SELECT COUNT(*) as count FROM orders WHERE customer_name = ?', [customerName], (countErr, countRows) => {
        if (!countErr && countRows[0].count === 0) {
          // 4. No orders left, delete the customer profile
          db.query('DELETE FROM customers WHERE name = ?', [customerName], (custDelErr) => {
            if (custDelErr) console.error('Failed to cleanup customer:', custDelErr.message);
          });
        }
      });

      res.json({ success: true, message: 'Order and associated contact cleaned up successfully' });
    });
  });
});

module.exports = router;

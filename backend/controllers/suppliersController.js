const db = require('../config/db');

exports.getSuppliers = (req, res) => {
  db.query('SELECT * FROM suppliers', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.addSupplier = (req, res) => {
  const { name, contact_email, contact_phone, location, rating, active_orders, status } = req.body;
  db.query(
    'INSERT INTO suppliers (name,contact_email,contact_phone,location,rating,active_orders,status) VALUES (?,?,?,?,?,?,?)',
    [name, contact_email, contact_phone, location, rating, active_orders, status],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, name, contact_email, contact_phone, location, rating, active_orders, status });
    }
  );
};

exports.updateSupplier = (req, res) => {
  const { id } = req.params;
  const { name, contact_email, contact_phone, location, rating, active_orders, status } = req.body;
  db.query(
    'UPDATE suppliers SET name=?,contact_email=?,contact_phone=?,location=?,rating=?,active_orders=?,status=? WHERE id=?',
    [name, contact_email, contact_phone, location, rating, active_orders, status, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Supplier updated successfully' });
    }
  );
};

exports.deleteSupplier = (req, res) => {
  db.query('DELETE FROM suppliers WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Supplier deleted successfully' });
  });
};

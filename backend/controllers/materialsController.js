const db = require('../config/db');

exports.getMaterials = (req, res) => {
  db.query('SELECT * FROM materials', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.addMaterial = (req, res) => {
  const { name, type, quantity, dimensions, unit, supplier, purchase_date, purchase_price } = req.body;
  db.query(
    'INSERT INTO materials (name, type, quantity, dimensions, unit, supplier, purchase_date, purchase_price) VALUES (?,?,?,?,?,?,?,?)',
    [name, type, quantity, dimensions, unit, supplier, purchase_date, purchase_price],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, name, type, quantity, dimensions, unit, supplier, purchase_date, purchase_price });
    }
  );
};

exports.updateMaterial = (req, res) => {
  const { id } = req.params;
  const { name, type, quantity, dimensions, unit, supplier, purchase_date, purchase_price } = req.body;
  db.query(
    'UPDATE materials SET name=?, type=?, quantity=?, dimensions=?, unit=?, supplier=?, purchase_date=?, purchase_price=? WHERE id=?',
    [name, type, quantity, dimensions, unit, supplier, purchase_date, purchase_price, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Material updated successfully' });
    }
  );
};


exports.deleteMaterial = (req, res) => {
  db.query('DELETE FROM materials WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Material deleted successfully' });
  });
};

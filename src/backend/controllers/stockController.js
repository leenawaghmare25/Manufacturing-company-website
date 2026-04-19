const pool = require('../config/db');

exports.recordStockMovement = async (
  material,
  changeType,
  quantityChange,
  resultingQuantity,
  note,
  referenceType = null,
  referenceId = null
) => {
  try {
    await pool.query(
      'INSERT INTO stock_movements (material_id, material_name, change_type, quantity_change, resulting_quantity, reference_type, reference_id, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        material.id || null,
        material.name,
        changeType,
        Number(quantityChange),
        Number(resultingQuantity),
        referenceType,
        referenceId,
        note,
      ]
    );
  } catch (err) {
    console.error('recordStockMovement error:', err);
  }
};

exports.getStockMovements = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM stock_movements ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getStockMovements error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const pool = require('../config/db');
const { recordStockMovement } = require('./stockController');

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

exports.getMaterials = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM materials');
    res.json(rows);
  } catch (err) {
    console.error('getMaterials error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.addMaterial = async (req, res) => {
  const { name, type, quantity, min_stock, dimensions, unit, supplier, purchase_date, purchase_price } = req.body;
  try {
    const qty = Number(quantity) || 0;
    const minStockValue = Number(min_stock) || 20;

    const [existingRows] = await pool.query(
      'SELECT * FROM materials WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND LOWER(TRIM(type)) = LOWER(TRIM(?))',
      [name, type]
    );

    if (existingRows.length > 0) {
      const primaryMaterial = existingRows[0];
      const duplicateIds = existingRows.slice(1).map((row) => row.id);
      const totalExistingQuantity = existingRows.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
      const newQuantity = totalExistingQuantity + qty;
      const updatedMaterial = {
        ...primaryMaterial,
        quantity: newQuantity,
        min_stock: min_stock != null ? minStockValue : Number(primaryMaterial.min_stock || 20),
        dimensions: dimensions || primaryMaterial.dimensions,
        unit: unit || primaryMaterial.unit,
        supplier: supplier || primaryMaterial.supplier,
        purchase_date: purchase_date || primaryMaterial.purchase_date,
        purchase_price: purchase_price != null && purchase_price !== '' ? purchase_price : primaryMaterial.purchase_price,
      };

      if (duplicateIds.length > 0) {
        await pool.query('DELETE FROM materials WHERE id IN (?)', [duplicateIds]);
      }

      await pool.query(
        'UPDATE materials SET quantity=?, min_stock=?, dimensions=?, unit=?, supplier=?, purchase_date=?, purchase_price=? WHERE id=?',
        [
          updatedMaterial.quantity,
          updatedMaterial.min_stock,
          updatedMaterial.dimensions,
          updatedMaterial.unit,
          updatedMaterial.supplier,
          updatedMaterial.purchase_date,
          updatedMaterial.purchase_price,
          primaryMaterial.id,
        ]
      );

      if (qty !== 0) {
        await recordStockMovement(
          updatedMaterial,
          'Restock',
          qty,
          newQuantity,
          'Merged duplicate material quantity',
          'Material',
          primaryMaterial.id
        );
      }

      await createAutoReorderRequest(updatedMaterial);
      return res.json(updatedMaterial);
    }

    const [result] = await pool.query(
      'INSERT INTO materials (name, type, quantity, min_stock, dimensions, unit, supplier, purchase_date, purchase_price) VALUES (?,?,?,?,?,?,?,?,?)',
      [name, type, quantity, min_stock || 20, dimensions, unit, supplier, purchase_date, purchase_price]
    );

    const createdMaterial = {
      id: result.insertId,
      name,
      type,
      quantity: Number(quantity) || 0,
      min_stock: Number(min_stock) || 20,
      dimensions,
      unit,
      supplier,
      purchase_date,
      purchase_price,
    };

    if (Number(createdMaterial.quantity) !== 0) {
      await recordStockMovement(
        createdMaterial,
        'Initial Stock',
        Number(createdMaterial.quantity),
        Number(createdMaterial.quantity),
        'Material created with initial quantity',
        'Material',
        createdMaterial.id
      );
    }

    await createAutoReorderRequest(createdMaterial);
    res.json(createdMaterial);
  } catch (err) {
    console.error('addMaterial error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateMaterial = async (req, res) => {
  const { id } = req.params;
  const { name, type, quantity, min_stock, dimensions, unit, supplier, purchase_date, purchase_price } = req.body;
  try {
    const [existingRows] = await pool.query('SELECT * FROM materials WHERE id=?', [id]);
    const existingMaterial = existingRows[0];

    await pool.query(
      'UPDATE materials SET name=?, type=?, quantity=?, min_stock=?, dimensions=?, unit=?, supplier=?, purchase_date=?, purchase_price=? WHERE id=?',
      [name, type, quantity, min_stock || 20, dimensions, unit, supplier, purchase_date, purchase_price, id]
    );

    const updatedMaterial = {
      id,
      name,
      type,
      quantity: Number(quantity) || 0,
      min_stock: Number(min_stock) || 20,
      dimensions,
      unit,
      supplier,
      purchase_date,
      purchase_price
    };

    if (existingMaterial) {
      const previousQuantity = Number(existingMaterial.quantity || 0);
      const newQuantity = Number(updatedMaterial.quantity || 0);
      const quantityChange = newQuantity - previousQuantity;
      if (quantityChange !== 0) {
        await recordStockMovement(
          updatedMaterial,
          'Manual Adjustment',
          quantityChange,
          newQuantity,
          `Quantity changed from ${previousQuantity} to ${newQuantity}`,
          'Material',
          id
        );
      }
    }

    await createAutoReorderRequest(updatedMaterial);

    res.json({ message: 'Material updated successfully' });
  } catch (err) {
    console.error('updateMaterial error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    await pool.query('DELETE FROM materials WHERE id=?', [req.params.id]);
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    console.error('deleteMaterial error:', err);
    res.status(500).json({ error: err.message });
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

exports.reorderScan = async (req, res) => {
  try {
    const [materials] = await pool.query('SELECT * FROM materials');
    const results = [];

    for (const material of materials) {
      const reorder = await createAutoReorderRequest(material);
      if (reorder) {
        results.push(reorder);
      }
    }

    res.json({ success: true, message: 'Reorder scan completed.', count: results.length, created: results });
  } catch (err) {
    console.error('reorderScan error:', err);
    res.status(500).json({ error: err.message });
  }
};

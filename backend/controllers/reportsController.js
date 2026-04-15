const pool = require('../config/db');

exports.getInventorySummary = async (req, res) => {
  try {
    const [materials] = await pool.query('SELECT * FROM materials');
    const [requests] = await pool.query('SELECT * FROM requests');
    const [orders] = await pool.query('SELECT * FROM inv_orders');

    const materialRows = Array.isArray(materials) ? materials : [];
    const requestRows = Array.isArray(requests) ? requests : [];
    const orderRows = Array.isArray(orders) ? orders : [];

    const lowStockMaterials = materialRows
      .filter((m) => Number(m.quantity) < Number(m.min_stock || 20))
      .map((m) => ({
        ...m,
        reorder_amount: Math.max(Number(m.min_stock || 20) * 2 - Number(m.quantity), Number(m.min_stock || 20))
      }))
      .sort((a, b) => Number(a.quantity) - Number(b.quantity));

    const orderStatusCounts = orderRows.reduce((acc, order) => {
      const status = order.inventory_status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const summary = {
      totalMaterials: materialRows.length,
      lowStockCount: lowStockMaterials.length,
      lowStockMaterials: lowStockMaterials.slice(0, 10),
      totalRequests: requestRows.length,
      pendingRequests: requestRows.filter((r) => r.status === 'Pending').length,
      autoReorderCount: requestRows.filter((r) => r.requested_by === 'System Auto Reorder').length,
      pendingOrders: orderRows.filter((o) => o.inventory_status === 'Pending').length,
      orderedOrders: orderRows.filter((o) => o.inventory_status === 'Ordered').length,
      deliveredOrders: orderRows.filter((o) => o.inventory_status === 'Delivered').length,
      orderStatusCounts,
      stockLevels: materialRows.map((m) => ({ name: m.name, quantity: Number(m.quantity) })),
    };

    res.json({ success: true, summary });
  } catch (err) {
    console.error('getInventorySummary error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

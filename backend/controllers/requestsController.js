const db = require('../config/db');

exports.getRequests = (req, res) => {
  const db = req.app.locals.db;
  db.query('SELECT * FROM requests ORDER BY requested_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
};

exports.addRequest = (req, res) => {
  const db = req.app.locals.db;
  const { job_id, material, quantity, requested_by } = req.body;
  const request_id = 'REQ-' + Date.now();

  if (!material || !quantity) {
    return res.status(400).json({ success: false, message: 'Material and quantity are required' });
  }

  db.query(
    'INSERT INTO requests (request_id, job_id, material, quantity, requested_by) VALUES (?,?,?,?,?)',
    [request_id, job_id, material, quantity, requested_by],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.status(201).json({ 
        success: true, 
        message: 'Request created',
        data: { id: result.insertId, request_id, job_id, material, quantity, requested_by, status: 'Pending' } 
      });
    }
  );
};

exports.updateRequestStatus = (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { status } = req.body;
  db.query('UPDATE requests SET status=? WHERE id=?', [status, id], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: `Request ${status} successfully` });
  });
};

exports.deleteRequest = (req, res) => {
  const db = req.app.locals.db;
  db.query('DELETE FROM requests WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: 'Request deleted successfully' });
  });
};

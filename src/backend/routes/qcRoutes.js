// Import Express framework for creating route handlers
const express = require('express');
// Create a new Express Router instance
const router = express.Router();
// Import the QC controller which handles quality check record operations
const qcController = require('../controllers/qcController');
// Import the auth middleware — ALL QC routes require authentication
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/qc — Fetch all quality check records (newest first)
router.get('/', authMiddleware, qcController.getQCRecords);
// GET /api/qc/job/:jobId — Fetch QC records for a specific job
router.get('/job/:jobId', authMiddleware, qcController.getQCRecordsByJobId);
// POST /api/qc — Create a new quality check record (Pass or Fail)
router.post('/', authMiddleware, qcController.addQCRecord);

// Export the router so it can be mounted in app.js at /api/qc
module.exports = router;

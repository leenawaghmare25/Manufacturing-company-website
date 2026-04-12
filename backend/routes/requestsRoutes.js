const express = require('express');
const router = express.Router();
const { getRequests, addRequest, updateRequestStatus, deleteRequest } = require('../controllers/requestsController');

router.get('/', getRequests);
router.post('/', addRequest);
router.put('/:id', updateRequestStatus);
router.delete('/:id', deleteRequest);

module.exports = router;

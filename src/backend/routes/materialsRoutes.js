const express = require('express');
const router = express.Router();
const { getMaterials, addMaterial, updateMaterial, deleteMaterial, getStockMovements, reorderScan } = require('../controllers/materialsController');

router.get('/', getMaterials);
router.get('/movements', getStockMovements);
router.post('/', addMaterial);
router.post('/reorder-scan', reorderScan);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

module.exports = router;

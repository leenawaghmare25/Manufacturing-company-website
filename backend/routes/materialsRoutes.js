const express = require('express');
const router = express.Router();
const { getMaterials, addMaterial, updateMaterial, deleteMaterial } = require('../controllers/materialsController');

router.get('/', getMaterials);
router.post('/', addMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

module.exports = router;

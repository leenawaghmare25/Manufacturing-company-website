const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/templateController');
const authMiddleware = require('../middleware/authMiddleware');

// All template routes require authentication
router.use(authMiddleware);

// Template CRUD
router.get('/',           ctrl.getTemplates);
router.get('/match/:name', ctrl.getTemplateByName);  // Auto-match by product name
router.post('/',          ctrl.createTemplate);
router.put('/:id',        ctrl.updateTemplate);
router.delete('/:id',     ctrl.deleteTemplate);

// Parts management within a template
router.post('/:id/parts',        ctrl.addPart);
router.delete('/:id/parts/:pid', ctrl.deletePart);

module.exports = router;

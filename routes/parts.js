// routes/parts.js
const express = require('express');
const router = express.Router();
const partsController = require('../controllers/partsController');
const { verifyAdmin } = require('../middleware/adminAuth');
const { createPartValidation, updatePartValidation } = require('../middleware/validation');

router.get('/', partsController.getParts);
router.get('/brands', partsController.getBrands);
router.get('/categories', partsController.getCategories);
router.get('/:id', partsController.getPartById);

// Admin routes for product management (Protected)
router.post('/', verifyAdmin, createPartValidation, partsController.createPart);
router.put('/:id', verifyAdmin, updatePartValidation, partsController.updatePart);
router.delete('/:id', verifyAdmin, partsController.deletePart);
router.get('/admin/all', verifyAdmin, partsController.getAllPartsAdmin);

module.exports = router;
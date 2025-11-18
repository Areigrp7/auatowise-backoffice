// routes/parts.js
const express = require('express');
const router = express.Router();
const partsController = require('../controllers/partsController');

router.get('/', partsController.getParts);
router.get('/brands', partsController.getBrands);
router.get('/categories', partsController.getCategories);
router.get('/:id', partsController.getPartById);

module.exports = router;
// routes/shops.js
const express = require('express');
const router = express.Router();
const shopsController = require('../controllers/shopsController');

router.get('/', shopsController.getShops);
router.get('/services', shopsController.getServices);
router.get('/:id', shopsController.getShopById);

module.exports = router;
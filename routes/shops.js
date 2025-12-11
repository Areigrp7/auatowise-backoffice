// routes/shops.js
const express = require('express');
const router = express.Router();
const shopsController = require('../controllers/shopsController');
router.get('/nearby', shopsController.getNearbyShops);

router.get('/', shopsController.getShops);
router.get('/', shopsController.getShops);
router.get('/services', shopsController.getServices);
router.get('/:id', shopsController.getShopById);

router.post('/', shopsController.addShop);
router.put('/:shopId', shopsController.updateShop);

module.exports = router;
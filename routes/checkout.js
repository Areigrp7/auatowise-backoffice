// routes/checkout.js
const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const auth = require('../middleware/auth');
const { orderValidation, addressValidation } = require('../middleware/checkoutValidation');

// Order management
router.post('/orders', auth.verifyToken, orderValidation, checkoutController.createOrder);
router.post('/orders/payment', auth.verifyToken, checkoutController.processPayment);
router.get('/orders', auth.verifyToken, checkoutController.getOrderHistory);
router.get('/orders/:orderId', auth.verifyToken, checkoutController.getOrderById);

// Shipping address management
router.post('/addresses', auth.verifyToken, addressValidation, checkoutController.addShippingAddress);
router.get('/addresses', auth.verifyToken, checkoutController.getShippingAddresses);
router.put('/addresses/:addressId/default', auth.verifyToken, checkoutController.setDefaultAddress);
router.delete('/addresses/:addressId', auth.verifyToken, checkoutController.deleteAddress);

module.exports = router;
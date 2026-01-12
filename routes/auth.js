// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  registerShopValidation
} = require('../middleware/validation');

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/register-shop', registerShopValidation, authController.registerShop);
router.post('/login', loginValidation, authController.login);

// Protected routes
router.get('/profile', auth.verifyToken, authController.getProfile);
router.put('/profile', auth.verifyToken, updateProfileValidation, authController.updateProfile);
router.put('/change-password', auth.verifyToken, changePasswordValidation, authController.changePassword);

module.exports = router;
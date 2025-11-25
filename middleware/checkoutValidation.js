// middleware/checkoutValidation.js
const { body } = require('express-validator');

const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.id')
    .notEmpty()
    .withMessage('Item ID is required'),
  body('items.*.name')
    .notEmpty()
    .withMessage('Item name is required'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Valid item price is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Valid item quantity is required'),
  body('shippingAddress.fullName')
    .notEmpty()
    .withMessage('Full name is required'),
  body('shippingAddress.addressLine1')
    .notEmpty()
    .withMessage('Address line 1 is required'),
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.zipCode')
    .notEmpty()
    .withMessage('ZIP code is required'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
];

const addressValidation = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required'),
  body('addressLine1')
    .notEmpty()
    .withMessage('Address line 1 is required'),
  body('city')
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .notEmpty()
    .withMessage('State is required'),
  body('zipCode')
    .notEmpty()
    .withMessage('ZIP code is required'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required')
];

module.exports = {
  orderValidation,
  addressValidation
};
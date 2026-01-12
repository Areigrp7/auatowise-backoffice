// middleware/validation.js
const { body } = require('express-validator');

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  body('last_name')
    .notEmpty()
    .trim()
    .withMessage('Last name is required')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('first_name')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  body('last_name')
    .notEmpty()
    .trim()
    .withMessage('Last name is required'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const registerShopValidation = [
  // Account Information
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid business email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  // Business Information
  body('business_name')
    .notEmpty()
    .trim()
    .withMessage('Business name is required'),
  body('owner_first_name')
    .notEmpty()
    .trim()
    .withMessage('Owner first name is required'),
  body('owner_last_name')
    .notEmpty()
    .trim()
    .withMessage('Owner last name is required'),
  body('business_phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid business phone number'),

  // Business Address
  body('street_address')
    .notEmpty()
    .trim()
    .withMessage('Street address is required'),
  body('city')
    .notEmpty()
    .trim()
    .withMessage('City is required'),
  body('state')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Please provide a valid 2-letter state code'),
  body('zip_code')
    .isPostalCode('US')
    .withMessage('Please provide a valid ZIP code'),

  // Business Details
  body('business_type')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim(),
  body('years_in_business')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0, max: 100 })
    .withMessage('Years in business must be a valid number'),
  body('business_license')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim(),
  body('ein_tax_id')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^[\dX-]+$/)
    .withMessage('Please provide a valid EIN/Tax ID format'),
  body('business_description')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Business description must be less than 1000 characters')
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  registerShopValidation
};
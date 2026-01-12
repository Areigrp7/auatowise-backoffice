// controllers/authController.js
const User = require('../models/Users');
const Shop = require('../models/Shop');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'your_jwt_secret', 
    { expiresIn: '30d' }
  );
};

exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, first_name, last_name, phone, role } = req.body;

    // Create user
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      phone,
      role
    });

    // Generate token
    const token = generateToken(user.id);

    // Return user data and token
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.message === 'User already exists with this email') {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

exports.registerShop = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      // Account Information
      email,
      password,

      // Business Information
      business_name,
      owner_first_name,
      owner_last_name,
      business_phone,

      // Business Address
      street_address,
      city,
      state,
      zip_code,

      // Business Details
      business_type,
      years_in_business,
      business_license,
      ein_tax_id,
      business_description
    } = req.body;

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Prepare user data
    const userData = {
      email,
      password: hashedPassword,
      first_name: owner_first_name,
      last_name: owner_last_name,
      phone: business_phone
    };

    // Prepare shop data
    const shopData = {
      business_name,
      business_phone,
      street_address,
      city,
      state,
      zip_code,
      business_type,
      years_in_business,
      business_license,
      ein_tax_id,
      business_description
    };

    // Create user and shop in transaction
    const { user, shop } = await Shop.createWithUser(userData, shopData);

    // Generate token
    const token = generateToken(user.id);

    // Return user and shop data
    res.status(201).json({
      message: 'Shop registered successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role
      },
      shop: {
        id: shop.id,
        name: shop.name,
        address: shop.address,
        phone: shop.phone,
        business_type: shop.business_type,
        verified: shop.verified
      },
      token
    });

  } catch (error) {
    console.error('Shop registration error:', error);

    if (error.message === 'User already exists with this email') {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: 'Internal server error during shop registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data and token
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { first_name, last_name, phone } = req.body;
    
    const user = await User.updateProfile(req.user.userId, {
      first_name,
      last_name,
      phone
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findByEmail(req.user.email);
    
    // Verify current password
    const isCurrentPasswordValid = await User.verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    await User.updatePassword(req.user.userId, newPassword);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// controllers/checkoutController.js
const Order = require('../models/order');
const ShippingAddress = require('../models/ShippingAddress');
const { validationResult } = require('express-validator');

// Calculate tax and shipping (simplified)
const calculateTax = (subtotal, state) => {
  // Simple tax calculation - in real app, use tax API
  const taxRates = {
    'CA': 0.0825,
    'NY': 0.08875,
    'TX': 0.0825,
    'FL': 0.07,
    'default': 0.06
  };
  const rate = taxRates[state] || taxRates.default;
  return Math.round(subtotal * rate * 100) / 100;
};

const calculateShipping = (subtotal, itemsCount) => {
  // Simple shipping calculation
  if (subtotal > 100) return 0; // Free shipping over $100
  return 9.99; // Flat rate shipping
};

exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { items, shippingAddress, billingAddress, customerNotes, paymentMethod } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = calculateTax(subtotal, shippingAddress.state);
    const shippingAmount = calculateShipping(subtotal, items.length);
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Create order
    const order = await Order.create({
      userId: req.user.userId,
      items,
      subtotal,
      taxAmount,
      shippingAmount,
      totalAmount,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      customerNotes,
      paymentMethod
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        shipping_amount: order.shipping_amount,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        created_at: order.created_at
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error during order creation' });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { orderId, paymentDetails } = req.body;

    // In a real application, integrate with Stripe, PayPal, etc.
    // For demo purposes, we'll simulate payment processing
    const order = await Order.findById(orderId, req.user.userId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order already processed' });
    }

    // Simulate payment processing
    const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

    if (paymentSuccess) {
      const updatedOrder = await Order.updatePaymentStatus(
        orderId, 
        'paid', 
        'pm_' + Math.random().toString(36).substr(2, 16)
      );

      res.json({
        message: 'Payment processed successfully',
        order: updatedOrder
      });
    } else {
      await Order.updatePaymentStatus(orderId, 'failed');
      res.status(400).json({ error: 'Payment failed. Please try again.' });
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Internal server error during payment processing' });
  }
};

exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user.userId);
    res.json({ orders });
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId, req.user.userId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Shipping Address Management
exports.addShippingAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const address = await ShippingAddress.create({
      userId: req.user.userId,
      ...req.body
    });

    res.status(201).json({
      message: 'Shipping address added successfully',
      address
    });

  } catch (error) {
    console.error('Add shipping address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getShippingAddresses = async (req, res) => {
  try {
    const addresses = await ShippingAddress.findByUserId(req.user.userId);
    res.json({ addresses });
  } catch (error) {
    console.error('Get shipping addresses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const address = await ShippingAddress.setDefault(req.params.addressId, req.user.userId);
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({
      message: 'Default address updated successfully',
      address
    });

  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const address = await ShippingAddress.delete(req.params.addressId, req.user.userId);
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
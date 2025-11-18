// controllers/shopsController.js
const Shop = require('../models/Shop');

exports.getShops = async (req, res) => {
  try {
    const { service, maxDistance, verified } = req.query;
    
    const filters = {};
    if (service) filters.service = service;
    if (maxDistance) filters.maxDistance = parseFloat(maxDistance);
    if (verified !== undefined) filters.verified = verified === 'true';

    const shops = await Shop.findAll(filters);
    res.json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    res.json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Shop.getServices();
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
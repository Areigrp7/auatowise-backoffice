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

exports.getNearbyShops = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    const shops = await Shop.findNearby(lat, lng, radius);
    res.json(shops);

  } catch (error) {
    console.error('Error fetching nearby shops:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addShop = async (req, res) => {
  try {
    const newShop = await Shop.create(req.body);
    res.status(201).json({ success: true, data: { id: newShop.id, ...newShop } });
  } catch (error) {
    console.error('Error adding new shop:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.updateShop = async (req, res) => {
  try {
    const updatedShop = await Shop.update(req.params.id, req.body);
    if (!updatedShop) {
      return res.status(404).json({ success: false, error: 'Shop not found' });
    }
    res.json({ success: true, data: { id: req.params.id, ...updatedShop } });
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
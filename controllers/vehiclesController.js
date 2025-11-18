// controllers/vehiclesController.js
const Vehicle = require('../models/Vehicle');

exports.getMakes = async (req, res) => {
  try {
    const makes = await Vehicle.getMakes();
    res.json(makes);
  } catch (error) {
    console.error('Error fetching makes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getModels = async (req, res) => {
  try {
    const { makeId } = req.params;
    const models = await Vehicle.getModels(makeId);
    res.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getYears = async (req, res) => {
  try {
    const years = await Vehicle.getYears();
    res.json(years);
  } catch (error) {
    console.error('Error fetching years:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
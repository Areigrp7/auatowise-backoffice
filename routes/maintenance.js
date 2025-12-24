const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
// const auth = require('../middleware/auth');

// Create Maintenance Record
router.post('/',  async (req, res) => {
  try {
    const newMaintenance = await Maintenance.create(req.body);
    res.status(201).json(newMaintenance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get Maintenance Records by Vehicle ID
router.get('/vehicle/:vehicle_id',  async (req, res) => {
  try {
    const maintenances = await Maintenance.findByVehicleId(req.params.vehicle_id);
    res.json(maintenances);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update Maintenance Record
router.put('/:id',  async (req, res) => {
  try {
    const updatedMaintenance = await Maintenance.update(req.params.id, req.body);
    if (!updatedMaintenance) {
      return res.status(404).json({ msg: 'Maintenance record not found' });
    }
    res.json(updatedMaintenance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete Maintenance Record
router.delete('/:id',  async (req, res) => {
  try {
    const removedMaintenance = await Maintenance.remove(req.params.id);
    if (!removedMaintenance) {
      return res.status(404).json({ msg: 'Maintenance record not found' });
    }
    res.json({ msg: 'Maintenance record removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get All Maintenance Records
router.get('/', async (req, res) => {
  try {
    const maintenances = await Maintenance.getAll();
    res.json(maintenances);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;


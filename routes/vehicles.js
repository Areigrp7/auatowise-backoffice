// routes/vehicles.js
const express = require('express');
const router = express.Router();
const vehiclesController = require('../controllers/vehiclesController');

router.get('/makes', vehiclesController.getMakes);
router.get('/models/:makeId', vehiclesController.getModels);
router.get('/years', vehiclesController.getYears);

module.exports = router;
const express = require('express');
const router = express.Router();
const vehiclesController = require('../controllers/vehiclesController');

router.get('/', vehiclesController.getVehiclesByUserId);
router.post('/', vehiclesController.addVehicle);
router.put('/:id', vehiclesController.updateVehicle);
router.delete('/:id', vehiclesController.deleteVehicle);

module.exports = router;
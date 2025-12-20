const express = require('express');
const router = express.Router();
const vehiclesController = require('../controllers/vehiclesController');

router.post('/', vehiclesController.addVehicle);
router.get('/', vehiclesController.getVehiclesByUserId);
router.put('/:id', vehiclesController.updateVehicle);
router.delete('/:id', vehiclesController.deleteVehicle);

module.exports = router;
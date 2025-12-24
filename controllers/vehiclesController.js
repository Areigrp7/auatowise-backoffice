const Vehicle = require('../models/Vehicle');

exports.addVehicle = async (req, res) => {
  try {
    const { year, make, model, trim, vin, mileage, color, nickname, image_url } = req.body;
    // const userId = req.user.id; // Assuming user ID is available from authentication middleware
    const userId = 1; // Assuming user ID is available from authentication middleware

    const newVehicle = await Vehicle.create({
      user_id: userId,
      year,
      make,
      model,
      trim,
      vin,
      mileage,
      color,
      nickname,
      image_url,
    });

    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getVehiclesByUserId = async (req, res) => {
  try {
    const userId = 1; // Assuming user ID is available from authentication middleware
    const vehicles = await Vehicle.findByUserId(userId);
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles by user ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, make, model, trim, vin, mileage, color, nickname, image_url } = req.body;

    const updatedVehicle = await Vehicle.update(id, {
      year,
      make,
      model,
      trim,
      vin,
      mileage,
      color,
      nickname,
      image_url,
    });

    if (!updatedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVehicle = await Vehicle.remove(id);

    if (!deletedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const db = require('../config/database');

const Vehicle = {
  create: async (vehicleData) => {
    const { user_id, year, make, model, trim, vin, mileage, color, nickname, image_url } = vehicleData;
  console.log(user_id)
    const query = `
      INSERT INTO user_vehicles (user_id, year, make, model, trim, vin, mileage, color, nickname, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, year, make, model, trim, vin, mileage, color, nickname, image_url, created_at, updated_at;
    `;
    const values = [
      user_id,
      year,
      make,
      model,
      trim,
      vin,
      mileage,
      color,
      nickname,
      image_url,
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  findByUserId: async (userId) => {
    const query = 'SELECT id, year, make, model, trim, vin, mileage, color, nickname, image_url, created_at, updated_at FROM user_vehicles WHERE user_id = $1 ORDER BY created_at DESC';
    const { rows } = await db.query(query, [userId]);
    return rows;
  },

  update: async (id, vehicleData) => {
    const { year, make, model, trim, vin, mileage, color, nickname, image_url } = vehicleData;
    const query = `
      UPDATE user_vehicles
      SET year = $1, make = $2, model = $3, trim = $4, vin = $5, mileage = $6, color = $7, nickname = $8, image_url = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING id, year, make, model, trim, vin, mileage, color, nickname, image_url, created_at, updated_at;
    `;
    const values = [
      year,
      make,
      model,
      trim,
      vin,
      mileage,
      color,
      nickname,
      image_url,
      id,
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  remove: async (id) => {
    const query = 'DELETE FROM user_vehicles WHERE id = $1 RETURNING id';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },
};

module.exports = Vehicle;
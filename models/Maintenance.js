const db = require('../config/database');

const Maintenance = {
  create: async (maintenanceData) => {
    const { vehicle_id, type, date, mileage, cost, description, shop, nextDue, nextMileage, status } = maintenanceData;
    const query = `
      INSERT INTO maintenance_records (vehicle_id, type, date, mileage, cost, description, shop, next_due, next_mileage, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, vehicle_id, type, date, mileage, cost, description, shop, next_due, next_mileage, status, created_at;
    `;
    const values = [vehicle_id, type, date, mileage, cost, description, shop, nextDue, nextMileage, status];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  findByVehicleId: async (vehicleId) => {
    const query = 'SELECT id, vehicle_id, type, date, mileage, cost, description, shop, next_due, next_mileage, status, created_at, updated_at FROM maintenance WHERE vehicle_id = $1 ORDER BY date DESC';
    const { rows } = await db.query(query, [vehicleId]);
    return rows;
  },

  update: async (id, maintenanceData) => {
    const { vehicle_id, type, date, mileage, cost, description, shop, nextDue, nextMileage, status } = maintenanceData;
    const query = `
      UPDATE maintenance_records
      SET vehicle_id = $1, type = $2, date = $3, mileage = $4, cost = $5, description = $6, shop = $7, next_due = $8, next_mileage = $9, status = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING id, vehicle_id, type, date, mileage, cost, description, shop, next_due, next_mileage, status, created_at, updated_at;
    `;
    const values = [vehicle_id, type, date, mileage, cost, description, shop, nextDue, nextMileage, status, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  remove: async (id) => {
    const query = 'DELETE FROM maintenance_records WHERE id = $1 RETURNING id';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  getAll: async () => {
    const query = 'SELECT id, vehicle_id, type, date, mileage, cost, description, shop, next_due, next_mileage, status, created_at, updated_at FROM maintenance_records ORDER BY date DESC';
    const { rows } = await db.query(query);
    return rows;
  },
};

module.exports = Maintenance;

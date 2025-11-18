// models/Shop.js
const db = require('../config/database');

class Shop {
  static async findAll(filters = {}) {
    let query = `SELECT * FROM shops WHERE 1=1`;
    const values = [];
    let paramCount = 0;

    if (filters.service) {
      paramCount++;
      query += ` AND $${paramCount} = ANY(services)`;
      values.push(filters.service);
    }

    if (filters.maxDistance) {
      // This is a simplified distance filter - you might want to implement actual geolocation
      paramCount++;
      query += ` AND REPLACE(distance, ' mi', '')::numeric <= $${paramCount}`;
      values.push(filters.maxDistance);
    }

    if (filters.verified !== undefined) {
      paramCount++;
      query += ` AND verified = $${paramCount}`;
      values.push(filters.verified);
    }

    query += ` ORDER BY rating DESC, reviews DESC`;

    const result = await db.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM shops WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async getServices() {
    const result = await db.query(`
      SELECT DISTINCT unnest(services) as service 
      FROM shops 
      ORDER BY service
    `);
    return result.rows.map(row => row.service);
  }
}

module.exports = Shop;
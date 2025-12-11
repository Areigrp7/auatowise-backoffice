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

static async findNearby(lat, lng, radiusKm) {
  const query = `
    SELECT
      id,
      name,
      rating,
      reviews,
      distance AS stored_distance,
      address,
      phone,
      website,
      specialties,
      services,
      certifications,
      hours,
      next_available,
      pricing,
      verified,
      images,
      description,
      coordinates,
      -- calculate actual geographic distance
      (
        6371 * acos(
          cos(radians($1)) *
          cos(radians(coordinates[1])) *
          cos(radians(coordinates[0]) - radians($2)) +
          sin(radians($1)) *
          sin(radians(coordinates[1]))
        )
      ) AS distance_km
    FROM shops
    WHERE (
      6371 * acos(
        cos(radians($1)) *
        cos(radians(coordinates[1])) *
        cos(radians(coordinates[0]) - radians($2)) +
        sin(radians($1)) *
        sin(radians(coordinates[1]))
      )
    ) <= $3
    ORDER BY distance_km ASC;
  `;

  const values = [lat, lng, radiusKm];
  const result = await db.query(query, values);
  return result.rows;
}

  static async create(shopData) {
    const { name, address, coordinates, phone, email, website, services, specialties, certifications, hours, description } = shopData;
    const result = await db.query(
      `INSERT INTO shops (name, address, coordinates, phone, email, website, services, specialties, certifications, hours, description, rating, reviews, verified, distance, distanceUnit) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [name, address, coordinates, phone, email, website, services, specialties, certifications, hours, description, 0, 0, false, 0, 'miles']
    );
    return result.rows[0];
  }

  static async update(id, shopData) {
    const fields = Object.keys(shopData).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(shopData);
    const result = await db.query(
      `UPDATE shops SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }
}

module.exports = Shop;
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
    const {
      user_id,
      name,
      address,
      coordinates,
      phone,
      email,
      website,
      services,
      specialties,
      certifications,
      hours,
      description,
      business_type,
      years_in_business,
      business_license,
      ein_tax_id
    } = shopData;

    const result = await db.query(
      `INSERT INTO shops (
        user_id, name, address, coordinates, phone, email, website, services,
        specialties, certifications, hours, description, rating, reviews,
        verified, distance, distanceUnit, business_type, years_in_business,
        business_license, ein_tax_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *`,
      [
        user_id, name, address, coordinates, phone, email, website, services || [],
        specialties || [], certifications || [], hours || {}, description,
        0, 0, false, 0, 'miles', business_type, years_in_business,
        business_license, ein_tax_id
      ]
    );
    return result.rows[0];
  }

  static async update(id, shopData) {
    const fields = Object.keys(shopData).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(shopData);
    const result = await db.query(
      `UPDATE shops SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query('SELECT * FROM shops WHERE user_id = $1', [userId]);
    return result.rows[0];
  }

  static async createWithUser(userData, shopData) {
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // Create user with mechanic role
      const userResult = await client.query(
        `INSERT INTO users (email, password, first_name, last_name, phone, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, first_name, last_name, phone, role, created_at`,
        [userData.email, userData.password, userData.first_name, userData.last_name, userData.phone, 'mechanic']
      );

      const user = userResult.rows[0];

      // Create shop associated with the user
      const shopResult = await client.query(
        `INSERT INTO shops (
          user_id, name, address, phone, email, business_type, years_in_business,
          business_license, ein_tax_id, description, rating, reviews, verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [
          user.id,
          shopData.business_name,
          JSON.stringify({
            address_line1: shopData.street_address,
            city: shopData.city,
            state: shopData.state,
            zip_code: shopData.zip_code,
            country: 'United States'
          }),
          shopData.business_phone,
          userData.email, // Use the same email for shop
          shopData.business_type,
          shopData.years_in_business,
          shopData.business_license,
          shopData.ein_tax_id,
          shopData.business_description,
          0, // rating
          0, // reviews
          false // verified
        ]
      );

      const shop = shopResult.rows[0];

      await client.query('COMMIT');

      return { user, shop };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Shop;
// models/ShippingAddress.js
const db = require('../config/database');

class ShippingAddress {
  static async create(addressData) {
    const { userId, fullName, addressLine1, addressLine2, city, state, zipCode, country, phone, isDefault } = addressData;

    // If setting as default, remove default from other addresses
    if (isDefault) {
      await db.query(
        'UPDATE shipping_addresses SET is_default = false WHERE user_id = $1',
        [userId]
      );
    }

    const result = await db.query(
      `INSERT INTO shipping_addresses (
        user_id, full_name, address_line1, address_line2, city, state, 
        zip_code, country, phone, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [userId, fullName, addressLine1, addressLine2, city, state, zipCode, country, phone, isDefault]
    );

    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM shipping_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async setDefault(addressId, userId) {
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // Remove default from all addresses
      await client.query(
        'UPDATE shipping_addresses SET is_default = false WHERE user_id = $1',
        [userId]
      );

      // Set new default
      const result = await client.query(
        'UPDATE shipping_addresses SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [addressId, userId]
      );

      await client.query('COMMIT');
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(addressId, userId) {
    const result = await db.query(
      'DELETE FROM shipping_addresses WHERE id = $1 AND user_id = $2 RETURNING *',
      [addressId, userId]
    );
    return result.rows[0];
  }
}

module.exports = ShippingAddress;
// models/Part.js
const db = require('../config/database');

class Part {
  static async findAll(filters = {}) {
    let query = `SELECT * FROM parts WHERE 1=1`;
    const values = [];
    let paramCount = 0;

    if (filters.category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.brand) {
      paramCount++;
      query += ` AND brand = $${paramCount}`;
      values.push(filters.brand);
    }

    if (filters.minPrice) {
      paramCount++;
      query += ` AND price >= $${paramCount}`;
      values.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      paramCount++;
      query += ` AND price <= $${paramCount}`;
      values.push(filters.maxPrice);
    }

    if (filters.inStock !== undefined) {
      paramCount++;
      query += ` AND in_stock = $${paramCount}`;
      values.push(filters.inStock);
    }

    // Add sorting
    if (filters.sortBy) {
      const sortOptions = {
        'priceLow': 'price ASC',
        'priceHigh': 'price DESC',
        'rating': 'rating DESC',
        'reviews': 'reviews DESC',
        'bestValue': 'best_value_score DESC'
      };
      query += ` ORDER BY ${sortOptions[filters.sortBy] || 'best_value_score DESC'}`;
    } else {
      query += ` ORDER BY best_value_score DESC`;
    }

    const result = await db.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM parts WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async getBrands() {
    const result = await db.query('SELECT DISTINCT brand FROM parts ORDER BY brand');
    return result.rows.map(row => row.brand);
  }

  static async getCategories() {
    const result = await db.query('SELECT name FROM categories ORDER BY name');
    return result.rows.map(row => row.name);
  }

  static async create(partData) {
    const {
      name, brand, price, original_price, rating, reviews, is_oem, seller,
      shipping, warranty, in_stock, image_url, best_value_score, features,
      compatibility, category
    } = partData;

    const result = await db.query(
      `INSERT INTO parts (
        name, brand, price, original_price, rating, reviews, is_oem, seller,
        shipping, warranty, in_stock, image_url, best_value_score, features,
        compatibility, category
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        name, brand, price, original_price || null, rating || 0, reviews || 0, is_oem || false, seller || null,
        shipping || null, warranty || null, in_stock || true, image_url || null, best_value_score || null,
        features || [], compatibility || [], category || null
      ]
    );
    return result.rows[0];
  }

  static async update(id, partData) {
    const fields = Object.keys(partData).map((key, index) => {
      // Handle array fields (features, compatibility) as they need specific syntax in update
      if (key === 'features' || key === 'compatibility') {
        return `${key} = $${index + 2}::text[]`;
      }
      return `${key} = $${index + 2}`;
    }).join(', ');
    const values = Object.values(partData);

    const result = await db.query(
      `UPDATE parts SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM parts WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

module.exports = Part;
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
}

module.exports = Part;
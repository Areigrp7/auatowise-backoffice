// models/Part.js - Add search functionality
const db = require('../config/database');

class Part {
  // static async search(searchParams) {
  //   const {
  //     query = '',
  //     category = '',
  //     brand = '',
  //     minPrice = 0,
  //     maxPrice = 10000,
  //     inStock = null,
  //     sortBy = 'best_value_score',
  //     sortOrder = 'DESC',
  //     page = 1,
  //     limit = 20
  //   } = searchParams;

  //   let whereConditions = [];
  //   let values = [];
  //   let paramCount = 0;

  //   // Search query (search in name, brand, and features)
  //   if (query) {
  //     paramCount++;
  //     whereConditions.push(
  //       `(name ILIKE $${paramCount} OR brand ILIKE $${paramCount} OR EXISTS (
  //         SELECT 1 FROM unnest(features) AS feature 
  //         WHERE feature ILIKE $${paramCount}
  //       ))`
  //     );
  //     values.push(`%${query}%`);
  //   }

  //   // Category filter
  //   if (category) {
  //     paramCount++;
  //     whereConditions.push(`category = $${paramCount}`);
  //     values.push(category);
  //   }

  //   // Brand filter
  //   if (brand) {
  //     paramCount++;
  //     whereConditions.push(`brand = $${paramCount}`);
  //     values.push(brand);
  //   }

  //   // Price range
  //   paramCount++;
  //   whereConditions.push(`price >= $${paramCount}`);
  //   values.push(minPrice);

  //   paramCount++;
  //   whereConditions.push(`price <= $${paramCount}`);
  //   values.push(maxPrice);

  //   // In stock filter
  //   if (inStock !== null) {
  //     paramCount++;
  //     whereConditions.push(`in_stock = $${paramCount}`);
  //     values.push(inStock);
  //   }

  //   // Build WHERE clause
  //   const whereClause = whereConditions.length > 0 
  //     ? `WHERE ${whereConditions.join(' AND ')}` 
  //     : '';

  //   // Sorting
  //   const sortOptions = {
  //     'bestValue': 'best_value_score',
  //     'priceLow': 'price',
  //     'priceHigh': 'price',
  //     'rating': 'rating',
  //     'reviews': 'reviews',
  //     'name': 'name'
  //   };

  //   const sortField = sortOptions[sortBy] || 'best_value_score';
  //   const order = sortBy === 'priceLow' ? 'ASC' : sortOrder;

  //   // Count total results
  //   const countResult = await db.query(
  //     `SELECT COUNT(*) FROM parts ${whereClause}`,
  //     values
  //   );
  //   const totalCount = parseInt(countResult.rows[0].count);

  //   // Calculate pagination
  //   const offset = (page - 1) * limit;

  //   // Main query
  //   const result = await db.query(
  //     `SELECT * FROM parts 
  //      ${whereClause}
  //      ORDER BY ${sortField} ${order}
  //      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
  //     [...values, limit, offset]
  //   );

  //   return {
  //     parts: result.rows,
  //     totalCount,
  //     currentPage: page,
  //     totalPages: Math.ceil(totalCount / limit),
  //     hasNext: page < Math.ceil(totalCount / limit),
  //     hasPrev: page > 1
  //   };
  // }

  // static async getSearchSuggestions(query, limit = 10) {
  //   const result = await db.query(
  //     `SELECT DISTINCT name, brand, category 
  //      FROM parts 
  //      WHERE name ILIKE $1 OR brand ILIKE $1
  //      LIMIT $2`,
  //     [`%${query}%`, limit]
  //   );
  //   return result.rows;
  // }

  // static async getPopularSearches(limit = 10) {
  //   // In a real app, you might track search popularity
  //   // For now, return parts with highest reviews
  //   const result = await db.query(
  //     `SELECT name, brand, category, reviews 
  //      FROM parts 
  //      ORDER BY reviews DESC 
  //      LIMIT $1`,
  //     [limit]
  //   );
  //   return result.rows;
  // }

  
  

  // // Existing methods...
  // static async findAll(filters = {}) {
  //   // Your existing implementation
  //   let query = `SELECT * FROM parts WHERE 1=1`;
  //   const values = [];
  //   let paramCount = 0;

  //   if (filters.category) {
  //     paramCount++;
  //     query += ` AND category = $${paramCount}`;
  //     values.push(filters.category);
  //   }

  //   if (filters.brand) {
  //     paramCount++;
  //     query += ` AND brand = $${paramCount}`;
  //     values.push(filters.brand);
  //   }

  //   if (filters.minPrice) {
  //     paramCount++;
  //     query += ` AND price >= $${paramCount}`;
  //     values.push(filters.minPrice);
  //   }

  //   if (filters.maxPrice) {
  //     paramCount++;
  //     query += ` AND price <= $${paramCount}`;
  //     values.push(filters.maxPrice);
  //   }

  //   if (filters.inStock !== undefined) {
  //     paramCount++;
  //     query += ` AND in_stock = $${paramCount}`;
  //     values.push(filters.inStock);
  //   }

  //   // Add sorting
  //   if (filters.sortBy) {
  //     const sortOptions = {
  //       'priceLow': 'price ASC',
  //       'priceHigh': 'price DESC',
  //       'rating': 'rating DESC',
  //       'reviews': 'reviews DESC',
  //       'bestValue': 'best_value_score DESC'
  //     };
  //     query += ` ORDER BY ${sortOptions[filters.sortBy] || 'best_value_score DESC'}`;
  //   } else {
  //     query += ` ORDER BY best_value_score DESC`;
  //   }

  //   const result = await db.query(query, values);
  //   return result.rows;
  // }

  // static async findById(id) {
  //   const result = await db.query('SELECT * FROM parts WHERE id = $1', [id]);
  //   return result.rows[0];
  // }

  // static async getBrands() {
  //   const result = await db.query('SELECT DISTINCT brand FROM parts ORDER BY brand');
  //   return result.rows.map(row => row.brand);
  // }

  // static async getCategories() {
  //   const result = await db.query('SELECT name FROM categories ORDER BY name');
  //   return result.rows.map(row => row.name);
  // }

  // models/Part.js - Enhanced search methods
static async searchByVehicleAndName(vehicleInfo, searchParams = {}) {
    const { year, make, model } = vehicleInfo;
    const {
      query = '',
      category = '',
      brand = '',
      minPrice = 0,
      maxPrice = 10000,
      inStock = null,
      sortBy = 'best_value_score',
      sortOrder = 'DESC',
      page = 1,
      limit = 20
    } = searchParams;

    let whereConditions = [];
    let values = [];
    let paramCount = 0;

    // Vehicle compatibility search
    // Look for parts that have the vehicle in their compatibility array
    const vehiclePatterns = [
      `%${year}%${make}%${model}%`,
      `%${make}%${model}%`,
      `%${model}%`
    ];

    const vehicleConditions = vehiclePatterns.map((pattern, index) => {
      paramCount++;
      values.push(pattern);
      return `compatibility::text ILIKE $${paramCount}`;
    });

    whereConditions.push(`(${vehicleConditions.join(' OR ')})`);

    // Part name search - search in name, brand, and features
    if (query) {
      paramCount++;
      whereConditions.push(`(
        name ILIKE $${paramCount} OR 
        brand ILIKE $${paramCount} OR 
        category ILIKE $${paramCount} OR
        EXISTS (
          SELECT 1 FROM unnest(features) AS feature 
          WHERE feature ILIKE $${paramCount}
        )
      )`);
      values.push(`%${query}%`);
    }

    // Category filter
    if (category) {
      paramCount++;
      whereConditions.push(`category = $${paramCount}`);
      values.push(category);
    }

    // Brand filter
    if (brand) {
      paramCount++;
      whereConditions.push(`brand = $${paramCount}`);
      values.push(brand);
    }

    // Price range
    paramCount++;
    whereConditions.push(`price >= $${paramCount}`);
    values.push(minPrice);

    paramCount++;
    whereConditions.push(`price <= $${paramCount}`);
    values.push(maxPrice);

    // In stock filter
    if (inStock !== null) {
      paramCount++;
      whereConditions.push(`in_stock = $${paramCount}`);
      values.push(inStock);
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Sorting
    const sortOptions = {
      'bestValue': 'best_value_score',
      'priceLow': 'price',
      'priceHigh': 'price',
      'rating': 'rating',
      'reviews': 'reviews',
      'name': 'name'
    };

    const sortField = sortOptions[sortBy] || 'best_value_score';
    const order = sortBy === 'priceLow' ? 'ASC' : sortOrder;

    // Count total results
    const countResult = await db.query(
      `SELECT COUNT(*) FROM parts ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Main query
    const result = await db.query(
      `SELECT * FROM parts 
       ${whereClause}
       ORDER BY ${sortField} ${order}
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...values, limit, offset]
    );

    return {
      parts: result.rows,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page < Math.ceil(totalCount / limit),
      hasPrev: page > 1,
      vehicle: vehicleInfo
    };
  }

  static async search(searchParams = {}) {
    const {
      query = '',
      category = '',
      brand = '',
      minPrice = 0,
      maxPrice = 10000,
      inStock = null,
      sortBy = 'best_value_score',
      sortOrder = 'DESC',
      page = 1,
      limit = 20
    } = searchParams;

    let whereConditions = [];
    let values = [];
    let paramCount = 0;

    // General search - search in name, brand, category, and features
    if (query) {
      paramCount++;
      whereConditions.push(`(
        name ILIKE $${paramCount} OR 
        brand ILIKE $${paramCount} OR 
        category ILIKE $${paramCount} OR
        EXISTS (
          SELECT 1 FROM unnest(features) AS feature 
          WHERE feature ILIKE $${paramCount}
        )
      )`);
      values.push(`%${query}%`);
    }

    // Category filter
    if (category) {
      paramCount++;
      whereConditions.push(`category = $${paramCount}`);
      values.push(category);
    }

    // Brand filter
    if (brand) {
      paramCount++;
      whereConditions.push(`brand = $${paramCount}`);
      values.push(brand);
    }

    // Price range
    paramCount++;
    whereConditions.push(`price >= $${paramCount}`);
    values.push(minPrice);

    paramCount++;
    whereConditions.push(`price <= $${paramCount}`);
    values.push(maxPrice);

    // In stock filter
    if (inStock !== null) {
      paramCount++;
      whereConditions.push(`in_stock = $${paramCount}`);
      values.push(inStock);
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Sorting
    const sortOptions = {
      'bestValue': 'best_value_score',
      'priceLow': 'price',
      'priceHigh': 'price',
      'rating': 'rating',
      'reviews': 'reviews',
      'name': 'name'
    };

    const sortField = sortOptions[sortBy] || 'best_value_score';
    const order = sortBy === 'priceLow' ? 'ASC' : sortOrder;

    // Count total results
    const countResult = await db.query(
      `SELECT COUNT(*) FROM parts ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Main query
    const result = await db.query(
      `SELECT * FROM parts 
       ${whereClause}
       ORDER BY ${sortField} ${order}
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...values, limit, offset]
    );

    return {
      parts: result.rows,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page < Math.ceil(totalCount / limit),
      hasPrev: page > 1
    };
  }
}

module.exports = Part;
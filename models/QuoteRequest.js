const db = require('../config/database');

const QuoteRequest = {
  create: async (quoteRequestData) => {
    const { user_id, part_price, preferred_date, expires_at, description, status, part_name, part_brand, urgency, vehicle } = quoteRequestData;
    const query = `
      INSERT INTO quote_requests (user_id, part_price, preferred_date, expires_at, description, status, part_name, part_brand, urgency, vehicle)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, user_id, part_price, preferred_date, expires_at, description, status, part_name, part_brand, urgency, vehicle, created_at;
    `;
    const values = [user_id, part_price, preferred_date, expires_at, description, status, part_name, part_brand, urgency, vehicle];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  getAll: async () => {
    const query = 'SELECT id, user_id, part_price, preferred_date, expires_at, description, status, part_name, part_brand, urgency, vehicle, created_at FROM quote_requests ORDER BY created_at DESC';
    const { rows } = await db.query(query);
    return rows;
  },

  getActiveQuotes: async () => {
    const query = "SELECT id, user_id, part_price, preferred_date, expires_at, description, status, part_name, part_brand, urgency, vehicle, created_at FROM quote_requests WHERE active = true ORDER BY created_at DESC LIMIT 1";
    const { rows } = await db.query(query);
    return rows;
  },
};

module.exports = QuoteRequest;

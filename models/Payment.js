const db = require('../config/database');

const Payment = {
  // Create a new payment/order record
  create: async (paymentData) => {
    const {
      user_id,
      stripe_payment_intent_id,
      amount,
      currency,
      status,
      items,
      shipping_address
    } = paymentData;

    const query = `
      INSERT INTO payments (user_id, stripe_payment_intent_id, amount, currency, status, items, shipping_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, user_id, stripe_payment_intent_id, amount, currency, status, items, shipping_address, created_at;
    `;

    const values = [
      user_id,
      stripe_payment_intent_id,
      amount,
      currency || 'usd',
      status || 'pending',
      JSON.stringify(items),
      shipping_address ? JSON.stringify(shipping_address) : null
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Update payment status
  updateStatus: async (stripe_payment_intent_id, status) => {
    const query = `
      UPDATE payments
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE stripe_payment_intent_id = $2
      RETURNING id, user_id, stripe_payment_intent_id, amount, currency, status, items, shipping_address, created_at, updated_at;
    `;

    const { rows } = await db.query(query, [status, stripe_payment_intent_id]);
    return rows[0];
  },

  // Find payment by Stripe payment intent ID
  findByPaymentIntentId: async (paymentIntentId) => {
    const query = 'SELECT * FROM payments WHERE stripe_payment_intent_id = $1';
    const { rows } = await db.query(query, [paymentIntentId]);
    return rows[0];
  },

  // Get payments by user ID
  findByUserId: async (userId) => {
    const query = 'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC';
    const { rows } = await db.query(query, [userId]);
    return rows;
  },

  // Get all payments (admin)
  getAll: async () => {
    const query = 'SELECT * FROM payments ORDER BY created_at DESC';
    const { rows } = await db.query(query);
    return rows;
  }
};

module.exports = Payment;

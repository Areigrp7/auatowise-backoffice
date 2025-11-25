// models/Order.js - Fix the query
const db = require('../config/database');

class Order {
  static async create(orderData) {
    const {
      userId,
      items,
      subtotal,
      taxAmount,
      shippingAmount,
      totalAmount,
      shippingAddress,
      billingAddress,
      customerNotes,
      paymentMethod
    } = orderData;

    // Generate unique order number
    const orderNumber = 'AUTO' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // Insert order
      const orderResult = await client.query(
        `INSERT INTO orders (
          user_id, order_number, subtotal, tax_amount, shipping_amount, 
          total_amount, shipping_address, billing_address, customer_notes, payment_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          userId,
          orderNumber,
          subtotal,
          taxAmount,
          shippingAmount,
          totalAmount,
          JSON.stringify(shippingAddress),
          billingAddress ? JSON.stringify(billingAddress) : JSON.stringify(shippingAddress),
          customerNotes,
          paymentMethod
        ]
      );

      const order = orderResult.rows[0];

      // Insert order items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (
            order_id, part_id, part_name, part_brand, part_price, 
            quantity, total_price, image_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            order.id,
            item.id,
            item.name,
            item.brand,
            item.price,
            item.quantity,
            item.price * item.quantity,
            item.image_url || item.imageUrl || '/api/placeholder/300/200'
          ]
        );
      }

      await client.query('COMMIT');
      return order;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByUserId(userId) {
    const result = await db.query(
      `SELECT 
        o.*,
        COUNT(oi.id) as item_count,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', oi.id,
            'part_name', oi.part_name,
            'part_brand', oi.part_brand,
            'quantity', oi.quantity,
            'unit_price', oi.part_price,
            'total_price', oi.total_price,
            'image_url', oi.image_url
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findById(orderId, userId = null) {
    let query = `
      SELECT 
        o.*,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', oi.id,
            'part_id', oi.part_id,
            'part_name', oi.part_name,
            'part_brand', oi.part_brand,
            'quantity', oi.quantity,
            'unit_price', oi.part_price,
            'total_price', oi.total_price,
            'image_url', oi.image_url
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
    `;

    const values = [orderId];

    if (userId) {
      query += ' AND o.user_id = $2';
      values.push(userId);
    }

    query += ' GROUP BY o.id';

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async updatePaymentStatus(orderId, paymentStatus, paymentId = null) {
    const result = await db.query(
      `UPDATE orders 
       SET payment_status = $1, payment_id = $2, status = 'confirmed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [paymentStatus, paymentId, orderId]
    );
    return result.rows[0];
  }

  static async updateStatus(orderId, status) {
    const result = await db.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *`,
      [status, orderId]
    );
    return result.rows[0];
  }
}

module.exports = Order;
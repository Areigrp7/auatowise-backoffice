// scripts/quickSetup.js
const { Client } = require('pg');
require('dotenv').config();

const config = {
  // user: process.env.DB_USER || 'postgres',
  // host: process.env.DB_HOST || 'localhost',
  // password: process.env.DB_PASSWORD || 'password',
  // port: process.env.DB_PORT || 5432,
  // database: process.env.DB_NAME || 'autowise'
    user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 10000
};

async function quickSetup() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('Connected to database');

    // Create the essential tables for checkout
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) NOT NULL,
        shipping_amount DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(100),
        payment_id VARCHAR(255),
        shipping_address JSONB NOT NULL,
        billing_address JSONB,
        customer_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER,
        part_id INTEGER,
        part_name VARCHAR(255) NOT NULL,
        part_brand VARCHAR(100) NOT NULL,
        part_price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS shipping_addresses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        full_name VARCHAR(255) NOT NULL,
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        zip_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) DEFAULT 'United States',
        phone VARCHAR(20),
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Essential checkout tables created successfully');
    
  } catch (error) {
    console.error('Error in quick setup:', error);
  } finally {
    await client.end();
  }
}

quickSetup();
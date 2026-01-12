// scripts/addShopUserAssociation.js
const { Client } = require('pg');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000
};

async function addShopUserAssociation() {
  const client = new Client(config);

  try {
    await client.connect();
    console.log('Connected to autowise database, adding shop user associations...');

    // Add user_id column to shops table if it doesn't exist
    await client.query(`
      ALTER TABLE shops
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
    `);

    // Add business information columns
    await client.query(`
      ALTER TABLE shops
      ADD COLUMN IF NOT EXISTS business_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS years_in_business INTEGER,
      ADD COLUMN IF NOT EXISTS business_license VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ein_tax_id VARCHAR(20)
    `);

    // Create unique constraint to ensure one shop per user
    try {
      await client.query(`
        ALTER TABLE shops
        ADD CONSTRAINT unique_user_shop UNIQUE (user_id)
      `);
    } catch (error) {
      // Constraint might already exist, ignore
      console.log('Unique constraint already exists or could not be created');
    }

    console.log('Shop user associations added successfully!');

  } catch (error) {
    console.error('Error adding shop user associations:', error);
  } finally {
    await client.end();
  }
}

addShopUserAssociation().catch(console.error);
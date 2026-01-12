// scripts/addUserRoles.js
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

async function addUserRoles() {
  const client = new Client(config);

  try {
    await client.connect();
    console.log('Connected to autowise database, adding user roles...');

    // Add role column to users table if it doesn't exist
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer'
      CHECK (role IN ('customer', 'mechanic', 'admin'))
    `);

    // Update existing users to have the 'customer' role if they don't have a role
    await client.query(`
      UPDATE users
      SET role = 'customer'
      WHERE role IS NULL
    `);

    console.log('User roles added successfully!');

    // Show current user distribution
    const result = await client.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY role
    `);

    console.log('\nCurrent user role distribution:');
    result.rows.forEach(row => {
      console.log(`${row.role}: ${row.count} users`);
    });

  } catch (error) {
    console.error('Error adding user roles:', error);
  } finally {
    await client.end();
  }
}

addUserRoles().catch(console.error);
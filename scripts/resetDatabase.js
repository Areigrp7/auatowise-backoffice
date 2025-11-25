// scripts/resetDatabase.js
const { Client } = require('pg');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'autowise'
};

async function resetDatabase() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('Connected to database');

    // Drop tables in correct order (due to foreign key constraints)
    const tables = [
      'order_items',
      'orders', 
      'shipping_addresses',
      'payment_methods',
      'bids',
      'quote_requests',
      'reminders',
      'maintenance_records',
      'user_vehicles',
      'users',
      'parts',
      'shops',
      'models',
      'makes',
      'vehicle_years',
      'categories'
    ];

    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`Dropped table: ${table}`);
      } catch (error) {
        console.log(`Table ${table} doesn't exist or couldn't be dropped:`, error.message);
      }
    }

    console.log('All tables dropped successfully');
    
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await client.end();
  }
}

resetDatabase().then(() => {
  console.log('Database reset completed. Now run: npm run setup-db');
  process.exit(0);
}).catch(error => {
  console.error('Database reset failed:', error);
  process.exit(1);
});
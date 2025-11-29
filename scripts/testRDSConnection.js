// scripts/testRDSConnection.js
const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 10000
};

async function testConnection() {
  console.log('Testing RDS connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('Database:', process.env.DB_NAME);
  console.log('User:', process.env.DB_USER);
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ SUCCESS: Connected to RDS PostgreSQL!');
    
    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('✅ Database version:', result.rows[0].version);
    
    // Check if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('✅ Tables found:', tables.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('❌ FAILED: Could not connect to RDS');
    console.error('Error details:', error.message);
    
    // Provide troubleshooting tips
    if (error.code === 'ETIMEDOUT') {
      console.log('\n🔧 TROUBLESHOOTING TIPS:');
      console.log('1. Check if your RDS instance is publicly accessible');
      console.log('2. Verify the RDS endpoint in AWS Console');
      console.log('3. Check security group inbound rules for PostgreSQL (port 5432)');
      console.log('4. Ensure the RDS instance is running');
    }
    
  } finally {
    await client.end();
    process.exit();
  }
}

testConnection();

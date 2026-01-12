// scripts/createAdminUser.js
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
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

async function createAdminUser() {
  const client = new Client(config);

  try {
    await client.connect();
    console.log('Connected to autowise database, creating admin user...');

    // Check if admin already exists
    const existingAdmin = await client.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists!');
      console.log('Admin user details:');
      const admin = await client.query(
        "SELECT id, email, first_name, last_name FROM users WHERE role = 'admin'"
      );
      console.log(admin.rows[0]);
      return;
    }

    // Create admin user
    const adminEmail = 'admin@autowise.com';
    const adminPassword = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const result = await client.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, phone, role, created_at`,
      [adminEmail, hashedPassword, 'Admin', 'User', '+15551234567', 'admin']
    );

    const admin = result.rows[0];

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@autowise.com');
    console.log('🔑 Password: admin123');
    console.log('👤 User Details:', {
      id: admin.id,
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name,
      role: admin.role
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.end();
  }
}

createAdminUser().catch(console.error);
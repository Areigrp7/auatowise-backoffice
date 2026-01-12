// models/User.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Role constants
  static ROLES = {
    CUSTOMER: 'customer',
    MECHANIC: 'mechanic',
    ADMIN: 'admin'
  };

  // Role descriptions for reference
  static ROLE_DESCRIPTIONS = {
    [User.ROLES.CUSTOMER]: 'Individual Customer - Buy parts, request installs, compare quotes',
    [User.ROLES.MECHANIC]: 'Mechanic / Shop (Business) - Bid on jobs, advertise, manage profile',
    [User.ROLES.ADMIN]: 'Admin (Internal) - Approvals, disputes, payouts, moderation'
  };

  // Validate role
  static isValidRole(role) {
    return Object.values(User.ROLES).includes(role);
  }
  static async create(userData) {
    const { email, password, first_name, last_name, phone, role = User.ROLES.CUSTOMER } = userData;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists with this email');
    }

    // Validate role
    if (!User.isValidRole(role)) {
      throw new Error(`Invalid role. Must be one of: ${Object.values(User.ROLES).join(', ')}`);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await db.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, phone, role, created_at`,
      [email, hashedPassword, first_name, last_name, phone, role]
    );

    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT id, email, first_name, last_name, phone, role, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async updateProfile(id, updateData) {
    const { first_name, last_name, phone } = updateData;

    const result = await db.query(
      `UPDATE users
       SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at`,
      [first_name, last_name, phone, id]
    );

    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );
  }

  static async updateRole(id, newRole) {
    // Validate role
    if (!User.isValidRole(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${Object.values(User.ROLES).join(', ')}`);
    }

    const result = await db.query(
      `UPDATE users
       SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at`,
      [newRole, id]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }

  static async findByRole(role) {
    if (!User.isValidRole(role)) {
      throw new Error(`Invalid role. Must be one of: ${Object.values(User.ROLES).join(', ')}`);
    }

    const result = await db.query(
      `SELECT id, email, first_name, last_name, phone, role, created_at, updated_at
       FROM users WHERE role = $1
       ORDER BY created_at DESC`,
      [role]
    );

    return result.rows;
  }

  static async getRoleStats() {
    const result = await db.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY role
    `);

    return result.rows;
  }
}

module.exports = User;
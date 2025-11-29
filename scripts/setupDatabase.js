// scripts/setupDatabase.js
const { Client } = require('pg');
require('dotenv').config();

const config = {
  // user: process.env.DB_USER ,
  // host: process.env.DB_HOST ,
  // password: process.env.DB_PASSWORD ,
  // port: process.env.DB_PORT,
    user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 10000
};

const dbName = process.env.DB_NAME;

async function setupDatabase() {
  const client = new Client(config);

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Check if database exists
    const dbCheck = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
  }
}

async function runSchema() {
  const client = new Client({
    ...config,
    database: dbName
  });

  try {
    await client.connect();
    console.log('Connected to autowise database, running schema...');

    // Vehicle Makes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS makes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Vehicle Models table
    await client.query(`
      CREATE TABLE IF NOT EXISTS models (
        id SERIAL PRIMARY KEY,
        make_id INTEGER REFERENCES makes(id),
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Vehicle Years table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicle_years (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Parts table
    // Update the setupDatabase.js file - add this to the runSchema function

    // Make sure the parts table has all the correct columns
    await client.query(`
  CREATE TABLE IF NOT EXISTS parts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    rating DECIMAL(3,2),
    reviews INTEGER DEFAULT 0,
    is_oem BOOLEAN DEFAULT false,
    seller VARCHAR(100),
    shipping VARCHAR(100),
    warranty VARCHAR(100),
    in_stock BOOLEAN DEFAULT true,
    image_url VARCHAR(500),
    best_value_score DECIMAL(3,1),
    features TEXT[],
    compatibility TEXT[],
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

    // Create order_items table
    await client.query(`
  CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    part_id INTEGER REFERENCES parts(id),
    part_name VARCHAR(255) NOT NULL,
    part_brand VARCHAR(100) NOT NULL,
    part_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

    // Create orders table
    await client.query(`
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
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

    // Create shipping_addresses table
    await client.query(`
  CREATE TABLE IF NOT EXISTS shipping_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
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

    // Shops table
    await client.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rating DECIMAL(3,2),
        reviews INTEGER DEFAULT 0,
        distance VARCHAR(50),
        address TEXT,
        phone VARCHAR(20),
        website VARCHAR(255),
        specialties TEXT[],
        services TEXT[],
        certifications TEXT[],
        hours JSONB,
        next_available VARCHAR(100),
        pricing VARCHAR(50),
        verified BOOLEAN DEFAULT false,
        images TEXT[],
        description TEXT,
        coordinates POINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User Vehicles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_vehicles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        year INTEGER NOT NULL,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        trim VARCHAR(100),
        vin VARCHAR(17),
        mileage INTEGER,
        color VARCHAR(50),
        nickname VARCHAR(100),
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Maintenance Records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance_records (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER REFERENCES user_vehicles(id),
        date DATE NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        mileage INTEGER,
        cost DECIMAL(10,2),
        shop VARCHAR(255),
        next_due DATE,
        next_mileage INTEGER,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reminders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER REFERENCES user_vehicles(id),
        type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        due_date DATE,
        due_mileage INTEGER,
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quote Requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quote_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        part_name VARCHAR(255) NOT NULL,
        part_brand VARCHAR(100) NOT NULL,
        part_price DECIMAL(10,2) NOT NULL,
        vehicle VARCHAR(255) NOT NULL,
        description TEXT,
        preferred_date DATE,
        urgency VARCHAR(50) DEFAULT 'Medium',
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `);

    // Bids table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        quote_request_id INTEGER REFERENCES quote_requests(id),
        shop_id INTEGER REFERENCES shops(id),
        labor_cost DECIMAL(10,2) NOT NULL,
        estimated_time VARCHAR(100),
        warranty VARCHAR(100),
        next_available VARCHAR(100),
        certifications TEXT[],
        special_notes TEXT,
        bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('All tables created successfully');

  } catch (error) {
    console.error('Error running schema:', error);
  } finally {
    await client.end();
  }
}

async function seedData() {
  const client = new Client({
    ...config,
    database: dbName
  });

  try {
    await client.connect();
    console.log('Connected to autowise database, seeding data...');

    // Insert makes
    await client.query(`
      INSERT INTO makes (name) VALUES 
      ('Toyota'), ('Honda'), ('Ford'), ('Chevrolet'), ('Nissan'), ('BMW'), ('Mercedes-Benz'), ('Audi')
      ON CONFLICT (name) DO NOTHING
    `);

    // Insert models
    await client.query(`
      INSERT INTO models (make_id, name) VALUES
      (1, 'Camry'), (1, 'Corolla'), (1, 'RAV4'), (1, 'Prius'), (1, 'Highlander'),
      (2, 'Civic'), (2, 'Accord'), (2, 'CR-V'), (2, 'Pilot'), (2, 'Fit'),
      (3, 'F-150'), (3, 'Escape'), (3, 'Explorer'), (3, 'Mustang'), (3, 'Focus')
      ON CONFLICT DO NOTHING
    `);

    // Insert categories
    await client.query(`
      INSERT INTO categories (name) VALUES
      ('Brake System'), ('Engine'), ('Suspension'), ('Electrical'), ('Filters'), ('Fluids'), ('Belts & Hoses')
      ON CONFLICT (name) DO NOTHING
    `);

    // Insert sample parts
    await client.query(`
      INSERT INTO parts (name, brand, price, original_price, rating, reviews, is_oem, seller, shipping, warranty, in_stock, image_url, best_value_score, features, compatibility, category) VALUES
      ('Premium Ceramic Brake Pads - Front Set', 'Brembo', 89.99, 129.99, 4.8, 1247, false, 'AutoZone', 'Free 2-day shipping', '3 years / 36,000 miles', true, '/api/placeholder/300/200', 9.2, '{"Low dust formula", "Quiet operation", "Extended wear"}', '{"2019-2024 Toyota Camry", "2020-2024 Honda Accord"}', 'Brake System'),
      ('OEM Brake Pad Set - Front', 'Toyota', 149.99, NULL, 4.9, 892, true, 'Toyota Dealer', '3-5 business days', '2 years / 24,000 miles', true, '/api/placeholder/300/200', 8.7, '{"OEM specification", "Perfect fit", "Factory quality"}', '{"2019-2024 Toyota Camry"}', 'Brake System'),
      ('Performance Brake Pads - Sport', 'Hawk Performance', 124.99, 159.99, 4.6, 634, false, 'Summit Racing', 'Free shipping over $99', '1 year / 12,000 miles', false, '/api/placeholder/300/200', 8.1, '{"High temperature resistance", "Aggressive bite", "Track tested"}', '{"2019-2024 Toyota Camry", "2018-2024 Honda Civic Si"}', 'Brake System'),
      ('Economy Brake Pads - Front', 'Bosch', 54.99, NULL, 4.3, 423, false, 'Amazon', 'Prime 1-day delivery', '1 year / 12,000 miles', true, '/api/placeholder/300/200', 7.8, '{"Budget friendly", "Reliable performance", "Easy installation"}', '{"2015-2024 Toyota Camry", "2016-2024 Honda Accord"}', 'Brake System'),
      ('Engine Air Filter', 'K&N', 34.99, 49.99, 4.7, 892, false, 'AutoZone', 'Free shipping', 'Lifetime warranty', true, '/api/placeholder/300/200', 8.5, '{"Washable and reusable", "Increased airflow", "Performance gain"}', '{"2019-2024 Toyota Camry", "2020-2024 Honda Accord"}', 'Filters'),
      ('Synthetic Motor Oil 5W-30', 'Mobil 1', 29.99, 39.99, 4.8, 1567, false, 'Walmart', 'Free 2-day shipping', 'Manufacturer warranty', true, '/api/placeholder/300/200', 9.0, '{"Full synthetic", "Advanced protection", "Improved fuel economy"}', '{"All vehicles requiring 5W-30"}', 'Fluids')
      ON CONFLICT DO NOTHING
    `);

    // Insert sample shops
    await client.query(`
      INSERT INTO shops (name, rating, reviews, distance, address, phone, website, specialties, services, certifications, hours, next_available, pricing, verified, images, description) VALUES
      ('QuickFix Auto Service', 4.8, 324, '1.2 mi', '123 Main St, Downtown', '(555) 123-4567', 'quickfixauto.com', '{"Brakes", "Oil Change", "Diagnostics"}', '{"General Repair", "Maintenance", "Inspection", "Tire Service"}', '{"ASE Certified", "AAA Approved", "NAPA AutoCare"}', '{"Monday": "8:00 AM - 6:00 PM", "Tuesday": "8:00 AM - 6:00 PM", "Wednesday": "8:00 AM - 6:00 PM", "Thursday": "8:00 AM - 6:00 PM", "Friday": "8:00 AM - 6:00 PM", "Saturday": "9:00 AM - 4:00 PM", "Sunday": "Closed"}', 'Today 2:30 PM', 'Moderate', true, '{"shop1.jpg", "shop2.jpg"}', 'Family-owned auto service center with over 20 years of experience. Specializing in brake service and general automotive repair.'),
      ('Premier Automotive', 4.9, 567, '2.1 mi', '456 Oak Avenue, Midtown', '(555) 987-6543', 'premierauto.com', '{"Engine Repair", "Transmission", "AC Service"}', '{"Engine Diagnostics", "Transmission Repair", "AC Repair", "Electrical"}', '{"ASE Master Technician", "Bosch Authorized", "BMW Specialist"}', '{"Monday": "7:30 AM - 7:00 PM", "Tuesday": "7:30 AM - 7:00 PM", "Wednesday": "7:30 AM - 7:00 PM", "Thursday": "7:30 AM - 7:00 PM", "Friday": "7:30 AM - 7:00 PM", "Saturday": "8:00 AM - 5:00 PM", "Sunday": "10:00 AM - 3:00 PM"}', 'Tomorrow 9:00 AM', 'Premium', true, '{"premier1.jpg", "premier2.jpg"}', 'Premium automotive service specializing in European vehicles and complex engine diagnostics.'),
      ('City Motors Garage', 4.6, 189, '2.8 mi', '789 Industrial Blvd, East Side', '(555) 456-7890', 'citymotors.com', '{"Tires", "Alignment", "Suspension"}', '{"Tire Installation", "Wheel Alignment", "Suspension Repair", "Brake Service"}', '{"ASE Certified", "Michelin Dealer"}', '{"Monday": "8:00 AM - 5:30 PM", "Tuesday": "8:00 AM - 5:30 PM", "Wednesday": "8:00 AM - 5:30 PM", "Thursday": "8:00 AM - 5:30 PM", "Friday": "8:00 AM - 5:30 PM", "Saturday": "9:00 AM - 2:00 PM", "Sunday": "Closed"}', 'Today 4:00 PM', 'Budget', false, '{"city1.jpg"}', 'Honest and reliable service for all your tire and suspension needs. Competitive pricing and quick turnaround.')
      ON CONFLICT DO NOTHING
    `);

    // Insert vehicle years
    await client.query(`
      INSERT INTO vehicle_years (year) VALUES
      (2015), (2016), (2017), (2018), (2019), (2020), (2021), (2022), (2023), (2024)
      ON CONFLICT DO NOTHING
    `);

    console.log('Sample data inserted successfully');
    console.log('Database setup completed!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('Starting Autowise database setup...');
  await setupDatabase();
  await runSchema();
  await seedData();
  console.log('Autowise database setup completed successfully!');
}

main().catch(console.error);
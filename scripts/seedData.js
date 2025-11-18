// scripts/seedData.js
const db = require('../config/database');

async function seedData() {
  try {
    // Insert sample parts
    await db.query(`
      INSERT INTO parts (name, brand, price, original_price, rating, reviews, is_oem, seller, shipping, warranty, in_stock, image_url, best_value_score, features, compatibility, category) VALUES
      ('Premium Ceramic Brake Pads - Front Set', 'Brembo', 89.99, 129.99, 4.8, 1247, false, 'AutoZone', 'Free 2-day shipping', '3 years / 36,000 miles', true, '/api/placeholder/300/200', 9.2, '{"Low dust formula", "Quiet operation", "Extended wear"}', '{"2019-2024 Toyota Camry", "2020-2024 Honda Accord"}', 'Brake System'),
      ('OEM Brake Pad Set - Front', 'Toyota', 149.99, NULL, 4.9, 892, true, 'Toyota Dealer', '3-5 business days', '2 years / 24,000 miles', true, '/api/placeholder/300/200', 8.7, '{"OEM specification", "Perfect fit", "Factory quality"}', '{"2019-2024 Toyota Camry"}', 'Brake System')
    `);

    // Insert sample shops
    await db.query(`
      INSERT INTO shops (name, rating, reviews, distance, address, phone, website, specialties, services, certifications, hours, next_available, pricing, verified, images, description) VALUES
      ('QuickFix Auto Service', 4.8, 324, '1.2 mi', '123 Main St, Downtown', '(555) 123-4567', 'quickfixauto.com', '{"Brakes", "Oil Change", "Diagnostics"}', '{"General Repair", "Maintenance", "Inspection", "Tire Service"}', '{"ASE Certified", "AAA Approved", "NAPA AutoCare"}', '{"Monday": "8:00 AM - 6:00 PM", "Tuesday": "8:00 AM - 6:00 PM", "Wednesday": "8:00 AM - 6:00 PM", "Thursday": "8:00 AM - 6:00 PM", "Friday": "8:00 AM - 6:00 PM", "Saturday": "9:00 AM - 4:00 PM", "Sunday": "Closed"}', 'Today 2:30 PM', 'Moderate', true, '{"image1.jpg", "image2.jpg"}', 'Family-owned auto service center with over 20 years of experience.')
    `);

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

seedData();
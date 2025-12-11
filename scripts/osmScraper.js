// const axios = require("axios");
// const db = require("../config/database");

// async function scrapeOSM(lat, lng, radius = 5000) {
//   const query = `
//     [out:json][timeout:25];
//     (
//       node["shop"="car_parts"](around:${radius}, ${lat}, ${lng});
//       node["shop"="car_repair"](around:${radius}, ${lat}, ${lng});
//       node["service"="automotive"](around:${radius}, ${lat}, ${lng});
//       node["auto_parts"="yes"](around:${radius}, ${lat}, ${lng});
//     );
//     out body;
//   `;

//   const url = "https://overpass-api.de/api/interpreter";

//   const OVERPASS_ENDPOINTS = [
//   "https://overpass-api.de/api/interpreter",
//   "https://overpass.kumi.systems/api/interpreter",
//   "https://overpass.nchc.org.tw/api/interpreter",
//   "https://overpass.openstreetmap.fr/api/interpreter"
// ];

//   const response = await axios.post(url, query, {
//     headers: { "Content-Type": "text/plain" }
//   });

//   return response.data.elements;
// }

// async function saveToDatabase(items) {
//   for (const item of items) {
//     const { id: osm_id, lat, lon, tags = {} } = item;

//     const name = tags.name || "Unknown Shop";
//     const address = tags["addr:full"] ||
//                     `${tags["addr:street"] || ""} ${tags["addr:housenumber"] || ""}`.trim();
//     const phone = tags.phone || null;

//     await db.query(
//       `
//       INSERT INTO shopstest (osm_id, name, lat, lng, coordinates, address, phone)
//       VALUES ($1, $2, $3, $4, ARRAY[$4, $3], $5, $6)
//       ON CONFLICT (osm_id)
//       DO UPDATE SET name=$2, address=$5, phone=$6;
//     `,
//       [osm_id, name, lat, lon, address, phone]
//     );
//   }
//   console.log("✔ OSM shops saved/updated!");
// }

// async function fetchFromOverpass(query) {
//   for (const url of OVERPASS_ENDPOINTS) {
//     try {
//       console.log("🌍 Trying:", url);

//       const res = await axios.post(url, query, {
//         timeout: 15000,
//         headers: { "Content-Type": "text/plain" }
//       });

//       if (res.status === 200) {
//         console.log("✅ Success:", url);
//         return res.data;
//       }
//     } catch (err) {
//       console.log("❌ Failed:", url, err.message);
//     }
//   }

//   throw new Error("All Overpass servers failed!");
// }


// async function runScraper() {
//   const lat = 40.73509;
//   const lng = -73.877562;
//   const radius = 5000;

//   const data = await scrapeOSM(lat, lng, radius);
//   console.log("Found:", data.length);

//   await saveToDatabase(data);
// }

// // module.exports = { runScraper };
// runScraper();



const axios = require("axios");
const { Pool } = require("pg");

// -----------------------
// PostgreSQL Connection
// -----------------------
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "admin",
  database: "autowise",
  port: 5432
});

// -----------------------
// Overpass Endpoints (Failover)
// -----------------------
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.nchc.org.tw/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter"
];

// -----------------------
// Fetch with failover
// -----------------------
async function fetchFromOverpass(query) {
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      console.log("🌍 Trying Overpass:", url);

      const res = await axios.post(url, query, {
        timeout: 15000,
        headers: { "Content-Type": "text/plain" }
      });

      if (res.status === 200) {
        console.log("✅ Success:", url);
        return res.data;
      }
    } catch (err) {
      console.log("❌ Failed:", url, err.message);
    }
  }

  throw new Error("All Overpass servers failed!");
}

// -----------------------
// Retry wrapper
// -----------------------
async function retry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.log(`🔁 Retry ${i + 1}/${retries} failed`);
      if (i === retries - 1) throw err;
    //   await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// -----------------------
// Save or update in DB
// -----------------------
// async function saveShop(shop) {
//   const query = `
//     INSERT INTO shoptest (osm_id, name, lat, lng, coordinates, address, phone, website)
//     VALUES ($1,$2,$3,$4,ARRAY[$4,$3],$5,$6,$7)
//     ON CONFLICT (osm_id) DO UPDATE SET
//       name = EXCLUDED.name,
//       lat = EXCLUDED.lat,
//       lng = EXCLUDED.lng,
//       coordinates = EXCLUDED.coordinates,
//       address = EXCLUDED.address,
//       phone = EXCLUDED.phone,
//       website = EXCLUDED.website,
//       updated_at = NOW();
//   `;

//   const values = [
//     shop.osm_id,
//     shop.name,
//     shop.lat,
//     shop.lng,
//     shop.address,
//     shop.phone,
//     shop.website
//   ];

//   await pool.query(query, values);
//   console.log(`💾 Saved: ${shop.name || "Unnamed Shop"}`);
// }

async function saveShop(shop) {
  const query = `
    INSERT INTO shoptest (
      osm_id, 
      name, 
      lat, 
      lng, 
      coordinates, 
      address, 
      phone, 
      website
    )
    VALUES (
      $1,
      $2,
      $3::double precision,
      $4::double precision,
      ARRAY[$4::double precision, $3::double precision],
      $5::text,
      $6::text,
      $7::text
    )
    ON CONFLICT (osm_id) DO UPDATE SET
      name = EXCLUDED.name,
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      coordinates = EXCLUDED.coordinates,
      address = EXCLUDED.address,
      phone = EXCLUDED.phone,
      website = EXCLUDED.website,
      updated_at = NOW();
  `;

  const values = [
    shop.osm_id,
    shop.name || null,
    Number(shop.lat),
    Number(shop.lng),
    shop.address || null,
    shop.phone || null,
    shop.website || null
  ];

  await pool.query(query, values);
  console.log(`💾 Saved: ${shop.name || "Unnamed Shop"}`);
}


// -----------------------
// Main Scraper Function
// -----------------------
async function runScraper() {
  console.log("🚀 Starting OSM Scraper...");

  // LOCATION (you can change)
  const lat = 40.73509;
  const lng = -73.877562;
  const radius = 5000; // meters

  const query = `
    [out:json][timeout:25];
    (
      node["shop"="car_parts"](around:${radius},${lat},${lng});
      node["service"="car_repair"](around:${radius},${lat},${lng});
      node["amenity"="car_repair"](around:${radius},${lat},${lng});
      node["amenity"="car_parts"](around:${radius},${lat},${lng});

      node["shop"="auto"](around:${radius},${lat},${lng});
      node["shop"="tyres"](around:${radius},${lat},${lng});
      node["service"="automotive"](around:${radius},${lat},${lng});
    );
    out body;
  `;

  console.log("📡 Sending request to Overpass...");

  const data = await retry(() => fetchFromOverpass(query), 3);

  if (!data.elements || data.elements.length === 0) {
    console.log("❌ No shops found!");
    return;
  }

  console.log(`📍 Found ${data.elements.length} shops`);

  for (const node of data.elements) {
    const shop = {
      osm_id: node.id,
      name: node.tags?.name || null,
      lat: node.lat,
      lng: node.lon,
      address: node.tags?.["addr:full"] || 
               node.tags?.["addr:street"] || 
               null,
      phone: node.tags?.phone || null,
      website: node.tags?.website || null
    };

    await saveShop(shop);
  }

  console.log("🎉 Scraping Completed!");
  process.exit(0);
}

// Start
runScraper().catch(err => {
  console.error("❌ Fatal Error:", err);
  process.exit(1);
});

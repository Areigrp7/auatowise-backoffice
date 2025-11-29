// routes/search.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
// const db = require('../config/database');
const db = require('../config/database');

// Search parts with filters
// router.get('/parts', searchController.searchParts);
// GET /api/search/parts?year=2024&make=Toyota&model=Camry&q=oil
// router.get("/parts", async (req, res) => {
//     try {
//         const { year, make, model, q } = req.query;

//         if (!year || !make || !model) {
//             return res.status(400).json({
//                 error: "year, make, and model are required parameters",
//             });
//         }

//         let params = [year, make, model];
//         let textSearchSQL = "";

//         // Optional keyword search (name, brand, features, category)
//         if (q) {
//             params.push(`%${q}%`);
//             params.push(`%${q}%`);
//             params.push(`%${q}%`);
//             params.push(`%${q}%`);

//             textSearchSQL = `
//         AND (
//           p.name ILIKE $4 OR
//           p.brand ILIKE $5 OR
//           p.category ILIKE $6 OR
//           p.features::text ILIKE $7
//         )
//       `;
//         }

//         //     const sql = `
//         //   SELECT *
//         //   FROM parts p
//         //   WHERE EXISTS (
//         //     SELECT 1
//         //     FROM unnest(p.compatibility) AS c(value)
//         //     WHERE 
//         //       value ILIKE '%' || $1 || '%'
//         //       AND value ILIKE '%' || $2 || '%'
//         //       AND value ILIKE '%' || $3 || '%'
//         //   )
//         //   ${textSearchSQL}
//         //   ORDER BY p.rating DESC, p.best_value_score DESC;
//         // `;

//         const sql = `
//   SELECT *
//   FROM parts p
//   WHERE EXISTS (
//     SELECT 1
//     FROM unnest(p.compatibility) AS c(value)
//     WHERE 
//       LOWER(TRIM(value)) LIKE '%' || LOWER($1) || '%'
//       AND LOWER(TRIM(value)) LIKE '%' || LOWER($2) || '%'
//       AND LOWER(TRIM(value)) LIKE '%' || LOWER($3) || '%'
//   )
//   ${textSearchSQL}
//   ORDER BY p.rating DESC, p.best_value_score DESC;
// `;





//         const result = await db.query(sql, params);
//         console.log({ result })

//         res.json(result.rows);

//     } catch (err) {
//         console.error("Search API error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });


router.get('/parts', async (req, res) => {
  const { year, make, model, q } = req.query;

  if (!year || !make || !model) {
    return res.status(400).json({ error: "year, make, model are required" });
  }

  try {
    const search = q ? `%${q}%` : `%`;

    const sql = `
      SELECT p.*
      FROM parts p
      CROSS JOIN LATERAL (
          SELECT 
              m[1]::int AS start_year,
              m[2]::int AS end_year,
              value
          FROM unnest(p.compatibility) AS c(value)
          CROSS JOIN LATERAL regexp_matches(value, '(\\d{4})-(\\d{4})') AS m
      ) AS comp
      WHERE 
          $1::int BETWEEN comp.start_year AND comp.end_year
          AND LOWER(comp.value) LIKE '%' || LOWER($2) || '%'
          AND LOWER(comp.value) LIKE '%' || LOWER($3) || '%'
          AND (
              p.name ILIKE $4 OR
              p.brand ILIKE $4 OR
              p.category ILIKE $4 OR
              p.features::text ILIKE $4
          )
      ORDER BY p.rating DESC, p.best_value_score DESC;
    `;

    const params = [
      year,      // $1
      make,      // $2
      model,     // $3
      search     // $4
    ];

    const result = await db.query(sql, params);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get search suggestions (for autocomplete)
router.get('/suggestions', searchController.getSearchSuggestions);

// Get popular searches
router.get('/popular', searchController.getPopularSearches);

// Get available filters
router.get('/filters', searchController.getSearchFilters);

module.exports = router;
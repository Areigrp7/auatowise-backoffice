const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

/* ===============================
   Allowed Origins (NO wildcards)
================================= */
const allowedOrigins = [
  'https://autowise.club',
  'https://www.autowise.club',
  'http://localhost:5173',
];

/* ===============================
   CORS Configuration
================================= */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, Postman, curl
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, origin); // echo ONE origin only
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

/* ===============================
   Global Middleware Order
================================= */

// CORS FIRST (only once)
app.use(cors(corsOptions));

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting (skip OPTIONS)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skip: (req) => req.method === 'OPTIONS',
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   Routes
================================= */
app.use('/api/parts', require('./routes/parts'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/search', require('./routes/search'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/quote_requests', require('./routes/quoteRequest'));

/* ===============================
   Health Check
================================= */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/* ===============================
   Error Handler
================================= */
app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
});

/* ===============================
   404 Handler
================================= */
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ===============================
   Server Start
================================= */
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('✅ Allowed Origins:', allowedOrigins);
});

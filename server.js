const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  next();
});

// CORS Configuration
const allowedOrigins = process.env.CLIENT_ORIGIN ? 
  process.env.CLIENT_ORIGIN.split(',') : [
    "https://autowise.club",
    "https://www.autowise.club",
    "http://localhost:5173",
    // Add your Amplify URLs
    "https://*.amplifyapp.com",
    "https://*.amplifyapp.com"
  ];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowedOrigins
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || 
             (allowedOrigin.includes('*') && 
              origin.endsWith(allowedOrigin.split('*')[1]));
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.error('CORS Blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  credentials: true,
  exposedHeaders: ["Content-Length", "Authorization"],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply middleware in correct order
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting (skip for OPTIONS requests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.method === 'OPTIONS', // Don't rate limit preflight
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/parts', require('./routes/parts'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/search', require('./routes/search'));

// Health check with CORS headers explicitly
app.get('/health', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});
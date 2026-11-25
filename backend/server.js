const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { PORT, CLIENT_URL, NODE_ENV } = require('./config/env');
const { connectDB } = require('./config/db');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { generalRateLimiter } = require('./middleware/rateLimiter');
const { seedSuperAdmin } = require('./scripts/seedSuperAdmin');

const app = express();

// Security HTTP headers
app.use(helmet());

// Logging
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// CORS configuration supporting HttpOnly cookies and credentials
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body and cookie parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// General rate limiter on all API routes
app.use('/api', generalRateLimiter);

// API Routes
app.use('/api', routes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    await connectDB();
    // Auto-seed initial super admin if missing
    await seedSuperAdmin(false);

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 ERP Server running in [${NODE_ENV}] mode`);
      console.log(`📡 Listening on http://localhost:${PORT}`);
      console.log(`🔐 Allowed Client URL: ${CLIENT_URL}`);
      console.log(`===============================================`);
    });

    return server;
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

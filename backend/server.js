const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { PORT, CLIENT_URL, NODE_ENV } = require('./config/env');
const { connectDB } = require('./config/db');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { generalRateLimiter } = require('./middleware/rateLimiter');
const { seedSuperAdmin } = require('./scripts/seedSuperAdmin');

const app = express();

// Enable trust proxy for secure cookies and accurate IP behind reverse proxies (Vercel, Render, etc.)
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

// Logging
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parse allowed client origins
const rawClientUrls = CLIENT_URL ? CLIENT_URL.split(',').map((u) => u.trim()) : [];
const allowedOrigins = [
  ...rawClientUrls,
  'https://erp-machine-test.vercel.app',
  'https://frontend-eta-ruby-66.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].map((url) => (url ? url.replace(/\/$/, '') : '')).filter(Boolean);

// CORS configuration supporting HttpOnly cookies and credentials
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        NODE_ENV === 'development';

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
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

// Serverless DB connection middleware (essential for Vercel functions where startServer is not called)
let serverlessDbPromise = null;
app.use(async (req, res, next) => {
  if (NODE_ENV === 'test' || mongoose.connection.readyState === 1) {
    return next();
  }

  if (!serverlessDbPromise) {
    serverlessDbPromise = connectDB()
      .then(async () => {
        try {
          await seedSuperAdmin(false);
        } catch (seedErr) {
          console.warn('[Seed] Super admin auto-seed error:', seedErr.message);
        }
      })
      .catch((err) => {
        serverlessDbPromise = null;
        console.error('[Database] Serverless connection error:', err);
        throw err;
      });
  }

  try {
    await serverlessDbPromise;
    next();
  } catch (err) {
    next(err);
  }
});

// General rate limiter on all API routes
app.use('/api', generalRateLimiter);

// API Routes - mount both under /api and root fallback to prevent 404s if frontend omits /api prefix
app.use('/api', routes);
app.use('/', routes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware
app.use(errorHandler);

// Start server function (used for traditional long-running Node.js process)
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

// Export app directly for Vercel serverless function compatibility
module.exports = app;
module.exports.app = app;
module.exports.startServer = startServer;

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/apiResponse');

// Login rate limiter: max 15 requests per 15 minutes per IP
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many login attempts. Please try again after 15 minutes.',
      429
    );
  }
});

// General API rate limiter: 300 requests per 15 minutes
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many requests. Please slow down and try again later.',
      429
    );
  }
});

module.exports = {
  loginRateLimiter,
  generalRateLimiter
};

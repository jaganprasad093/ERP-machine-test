const { sendError } = require('../utils/apiResponse');
const { NODE_ENV } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message
    }));
    return sendError(res, 'Validation failed', 400, errors);
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return sendError(
      res,
      `An account with ${field} '${value}' already exists.`,
      409
    );
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Invalid format for resource ID: ${err.value}`, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token. Please authenticate.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Session expired. Please log in again.', 401);
  }

  const statusCode = err.statusCode || 500;
  const message =
    NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error. Please try again later.'
      : err.message || 'Internal server error';

  return sendError(res, message, statusCode);
};

module.exports = { errorHandler };

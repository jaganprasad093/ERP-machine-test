const { sendError } = require('../utils/apiResponse');

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      // Assign back sanitized/parsed fields
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;
      next();
    } catch (err) {
      if (err.errors) {
        const errorDetails = err.errors.map((e) => ({
          field: e.path.slice(1).join('.'),
          message: e.message
        }));
        return sendError(
          res,
          err.errors[0]?.message || 'Validation error',
          400,
          errorDetails
        );
      }
      return sendError(res, err.message || 'Validation error', 400);
    }
  };
};

module.exports = { validate };

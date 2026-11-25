const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { loginRateLimiter } = require('../middleware/rateLimiter');
const {
  loginSchema,
  changePasswordSchema
} = require('../validators/authValidators');

router.post(
  '/login',
  loginRateLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.get(
  '/me',
  authenticate,
  authController.getMe
);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

module.exports = router;

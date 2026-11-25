const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { USER_ROLES } = require('../models/User');
const {
  createAdminSchema,
  updateAdminSchema,
  changeStatusSchema,
  resetPasswordSchema
} = require('../validators/adminValidators');

// Protect all admin management routes: must be authenticated and have SUPER_ADMIN role
router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN));

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// Admin CRUD
router.post('/', validate(createAdminSchema), adminController.createAdmin);
router.get('/', adminController.getAdmins);
router.get('/:id', adminController.getAdminById);
router.put('/:id', validate(updateAdminSchema), adminController.updateAdmin);
router.patch('/:id/status', validate(changeStatusSchema), adminController.changeStatus);
router.patch('/:id/reset-password', validate(resetPasswordSchema), adminController.resetPassword);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;

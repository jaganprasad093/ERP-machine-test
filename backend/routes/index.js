const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const profileRoutes = require('./profileRoutes');

router.use('/auth', authRoutes);
router.use('/admins', adminRoutes);
router.use('/profile', profileRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ERP Backend API'
  });
});

module.exports = router;

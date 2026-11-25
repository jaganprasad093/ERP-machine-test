require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_management',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_erp_jwt_key_2026_production_grade',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CLIENT_URL: (process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? 'https://erp-machine-test.vercel.app' : 'http://localhost:5173')).replace(/\/$/, ''),
  COOKIE_NAME: 'erp_token',
  SEED_SUPER_ADMIN: {
    name: process.env.SUPER_ADMIN_NAME || 'Super Administrator',
    email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@erp.com',
    phone: process.env.SUPER_ADMIN_PHONE || '+1234567890',
    password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123456'
  }
};

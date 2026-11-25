const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const { User, USER_ROLES, USER_STATUS } = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { SEED_SUPER_ADMIN } = require('../config/env');

const seedSuperAdmin = async (standalone = true) => {
  try {
    if (standalone && mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const existingSuperAdmin = await User.findOne({ role: USER_ROLES.SUPER_ADMIN });
    if (existingSuperAdmin) {
      console.log(`[Seed] Super Admin already exists: ${existingSuperAdmin.email}`);
      if (standalone) {
        await disconnectDB();
        process.exit(0);
      }
      return existingSuperAdmin;
    }

    console.log('[Seed] No Super Admin found. Creating initial Super Admin account...');
    const superAdmin = new User({
      name: SEED_SUPER_ADMIN.name,
      email: SEED_SUPER_ADMIN.email.toLowerCase().trim(),
      phone: SEED_SUPER_ADMIN.phone.trim(),
      password: SEED_SUPER_ADMIN.password, // Pre-save hook will hash with bcrypt
      role: USER_ROLES.SUPER_ADMIN,
      status: USER_STATUS.ACTIVE
    });

    await superAdmin.save();

    await AuditLog.create({
      performedBy: superAdmin._id,
      performedByName: 'Initial Seeder',
      action: 'SYSTEM_SEED',
      targetUser: superAdmin._id,
      targetUserEmail: superAdmin.email,
      details: {
        message: 'Super Admin initialized via secure seed script',
        role: USER_ROLES.SUPER_ADMIN
      }
    });

    console.log('----------------------------------------------------');
    console.log('✅ Super Admin account seeded successfully!');
    console.log(`Email:    ${superAdmin.email}`);
    console.log(`Password: ${SEED_SUPER_ADMIN.password}`);
    console.log(`Role:     ${superAdmin.role}`);
    console.log('----------------------------------------------------');

    if (standalone) {
      await disconnectDB();
      process.exit(0);
    }
    return superAdmin;
  } catch (error) {
    console.error('❌ Error seeding Super Admin:', error);
    if (standalone) {
      await disconnectDB();
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedSuperAdmin(true);
}

module.exports = { seedSuperAdmin };

process.env.NODE_ENV = 'test';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');
const { User, USER_ROLES, USER_STATUS } = require('../models/User');
const { seedSuperAdmin } = require('../scripts/seedSuperAdmin');

let mongoServer;
let superAdminToken;
let superAdminUser;
let createdAdminId;
let adminToken;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    driverInfo: { name: 'nodejs', version: '26.0.0' }
  });

  // Seed super admin
  superAdminUser = await seedSuperAdmin(false);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('ERP Backend & Security API Tests', () => {
  describe('Authentication Endpoints', () => {
    it('Should login Super Admin with seeded credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@erp.com',
          password: 'SuperAdmin@123456'
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.user.role, USER_ROLES.SUPER_ADMIN);
      assert.strictEqual(res.body.data.user.password, undefined);
      assert.ok(res.body.data.token);

      superAdminToken = res.body.data.token;
    });

    it('Should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@erp.com',
          password: 'WrongPassword'
        });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    it('Should return current user via /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${superAdminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.email, 'superadmin@erp.com');
      assert.strictEqual(res.body.data.role, USER_ROLES.SUPER_ADMIN);
    });
  });

  describe('Super Admin Management CRUD & Authorization', () => {
    it('Should reject unauthenticated access to /api/admins', async () => {
      const res = await request(app).get('/api/admins');
      assert.strictEqual(res.status, 401);
    });

    it('Should create a new Admin account', async () => {
      const res = await request(app)
        .post('/api/admins')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Jane Doe',
          email: 'jane.admin@erp.com',
          phone: '+1987654321',
          password: 'AdminPassword@123',
          confirmPassword: 'AdminPassword@123',
          status: 'ACTIVE'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.email, 'jane.admin@erp.com');
      assert.strictEqual(res.body.data.role, USER_ROLES.ADMIN);
      assert.strictEqual(res.body.data.password, undefined);

      createdAdminId = res.body.data._id;
    });

    it('Should reject duplicate admin email', async () => {
      const res = await request(app)
        .post('/api/admins')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Duplicate Jane',
          email: 'jane.admin@erp.com',
          phone: '+1987654321',
          password: 'AdminPassword@123',
          confirmPassword: 'AdminPassword@123',
          status: 'ACTIVE'
        });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
    });

    it('Should list admins with search and pagination', async () => {
      const res = await request(app)
        .get('/api/admins?search=Jane&page=1&limit=10')
        .set('Authorization', `Bearer ${superAdminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.admins.length, 1);
      assert.strictEqual(res.body.data.admins[0].email, 'jane.admin@erp.com');
      assert.strictEqual(res.body.data.pagination.totalCount, 1);
    });

    it('Should get single admin details by ID', async () => {
      const res = await request(app)
        .get(`/api/admins/${createdAdminId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data._id, createdAdminId);
      assert.strictEqual(res.body.data.name, 'Jane Doe');
    });

    it('Should update admin details', async () => {
      const res = await request(app)
        .put(`/api/admins/${createdAdminId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Jane Doe Updated',
          phone: '+1122334455'
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.name, 'Jane Doe Updated');
      assert.strictEqual(res.body.data.phone, '+1122334455');
    });

    it('Should deactivate admin account and prevent login', async () => {
      const statusRes = await request(app)
        .patch(`/api/admins/${createdAdminId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'INACTIVE' });

      assert.strictEqual(statusRes.status, 200);
      assert.strictEqual(statusRes.body.data.status, 'INACTIVE');

      // Attempt login as deactivated admin
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane.admin@erp.com',
          password: 'AdminPassword@123'
        });

      assert.strictEqual(loginRes.status, 403);
      assert.ok(loginRes.body.message.includes('inactive') || loginRes.body.message.includes('deactivated'));
    });

    it('Should reactivate admin account and allow login', async () => {
      await request(app)
        .patch(`/api/admins/${createdAdminId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'ACTIVE' });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane.admin@erp.com',
          password: 'AdminPassword@123'
        });

      assert.strictEqual(loginRes.status, 200);
      adminToken = loginRes.body.data.token;
      assert.ok(adminToken);
    });

    it('Admin cannot access Super Admin endpoints (Role Authorization Check)', async () => {
      const res = await request(app)
        .get('/api/admins')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 403);
      assert.ok(res.body.message.includes('Access denied') || res.body.message.includes('permission'));
    });

    it('Admin can view and update their own profile', async () => {
      const getRes = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(getRes.status, 200);
      assert.strictEqual(getRes.body.data.email, 'jane.admin@erp.com');

      const updateRes = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jane Self Updated',
          phone: '+1999888777'
        });

      assert.strictEqual(updateRes.status, 200);
      assert.strictEqual(updateRes.body.data.name, 'Jane Self Updated');
    });

    it('Admin can change their own password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'AdminPassword@123',
          newPassword: 'NewPassword@456',
          confirmPassword: 'NewPassword@456'
        });

      assert.strictEqual(res.status, 200);

      // Verify login with new password
      const reLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane.admin@erp.com',
          password: 'NewPassword@456'
        });

      assert.strictEqual(reLogin.status, 200);
    });

    it('Super Admin can reset admin password', async () => {
      const res = await request(app)
        .patch(`/api/admins/${createdAdminId}/reset-password`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          password: 'ResetPassword@789',
          confirmPassword: 'ResetPassword@789'
        });

      assert.strictEqual(res.status, 200);

      // Verify login with reset password
      const reLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane.admin@erp.com',
          password: 'ResetPassword@789'
        });

      assert.strictEqual(reLogin.status, 200);
    });

    it('Prevent Super Admin account deletion or demotion via Admin CRUD', async () => {
      const res = await request(app)
        .delete(`/api/admins/${superAdminUser._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      assert.ok([400, 404].includes(res.status));
    });

    it('Super Admin dashboard stats returns accurate metrics', async () => {
      const res = await request(app)
        .get('/api/admins/stats')
        .set('Authorization', `Bearer ${superAdminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.stats.totalAdmins, 1);
      assert.strictEqual(res.body.data.stats.activeAdmins, 1);
      assert.strictEqual(res.body.data.stats.inactiveAdmins, 0);
      assert.ok(res.body.data.recentActivities.length > 0);
    });

    it('Should delete admin account successfully', async () => {
      const res = await request(app)
        .delete(`/api/admins/${createdAdminId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.message.includes('deleted'));

      // Verify admin no longer exists
      const checkRes = await request(app)
        .get(`/api/admins/${createdAdminId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      assert.strictEqual(checkRes.status, 404);
    });
  });
});

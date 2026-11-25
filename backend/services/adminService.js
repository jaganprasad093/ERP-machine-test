const { User, USER_ROLES, USER_STATUS } = require('../models/User');
const auditService = require('./auditService');

const createAdmin = async ({
  name,
  email,
  phone,
  password,
  status = USER_STATUS.ACTIVE,
  creator,
  ipAddress,
  userAgent
}) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  const newAdmin = new User({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    password, // pre-save hook will hash it
    role: USER_ROLES.ADMIN,
    status,
    createdBy: creator._id,
    updatedBy: creator._id
  });

  await newAdmin.save();

  await auditService.createLog({
    performedBy: creator._id,
    performedByName: creator.name,
    action: 'ADMIN_CREATE',
    targetUser: newAdmin._id,
    targetUserEmail: newAdmin.email,
    details: { name: newAdmin.name, status: newAdmin.status },
    ipAddress,
    userAgent
  });

  return newAdmin.toJSON();
};

const getAdmins = async ({
  search = '',
  status = '',
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc'
}) => {
  const query = { role: USER_ROLES.ADMIN };

  if (status && (status === USER_STATUS.ACTIVE || status === USER_STATUS.INACTIVE)) {
    query.status = status;
  }

  if (search) {
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSearch, 'i');
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const allowedSortFields = ['name', 'email', 'phone', 'status', 'createdAt', 'updatedAt'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [admins, totalCount] = await Promise.all([
    User.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email'),
    User.countDocuments(query)
  ]);

  return {
    admins,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      totalCount,
      limit: limitNum
    }
  };
};

const getAdminById = async (id) => {
  const admin = await User.findOne({ _id: id, role: USER_ROLES.ADMIN })
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!admin) {
    const error = new Error('Admin not found or access restricted');
    error.statusCode = 404;
    throw error;
  }

  return admin.toJSON();
};

const updateAdmin = async (id, { name, phone, status }, updater, ipAddress, userAgent) => {
  const admin = await User.findOne({ _id: id, role: USER_ROLES.ADMIN });
  if (!admin) {
    const error = new Error('Admin account not found or access restricted');
    error.statusCode = 404;
    throw error;
  }

  if (name !== undefined) admin.name = name.trim();
  if (phone !== undefined) admin.phone = phone.trim();
  if (status !== undefined) admin.status = status;
  admin.updatedBy = updater._id;

  await admin.save();

  await auditService.createLog({
    performedBy: updater._id,
    performedByName: updater.name,
    action: 'ADMIN_UPDATE',
    targetUser: admin._id,
    targetUserEmail: admin.email,
    details: { updatedFields: { name, phone, status } },
    ipAddress,
    userAgent
  });

  return admin.toJSON();
};

const changeAdminStatus = async (id, newStatus, updater, ipAddress, userAgent) => {
  const admin = await User.findOne({ _id: id, role: USER_ROLES.ADMIN });
  if (!admin) {
    const error = new Error('Admin account not found or access restricted');
    error.statusCode = 404;
    throw error;
  }

  admin.status = newStatus;
  admin.updatedBy = updater._id;
  await admin.save();

  await auditService.createLog({
    performedBy: updater._id,
    performedByName: updater.name,
    action: 'ADMIN_STATUS_CHANGE',
    targetUser: admin._id,
    targetUserEmail: admin.email,
    details: { status: newStatus },
    ipAddress,
    userAgent
  });

  return admin.toJSON();
};

const resetAdminPassword = async (id, newPassword, updater, ipAddress, userAgent) => {
  const admin = await User.findOne({ _id: id, role: USER_ROLES.ADMIN });
  if (!admin) {
    const error = new Error('Admin account not found or access restricted');
    error.statusCode = 404;
    throw error;
  }

  admin.password = newPassword; // Pre-save hook will hash
  admin.updatedBy = updater._id;
  await admin.save();

  await auditService.createLog({
    performedBy: updater._id,
    performedByName: updater.name,
    action: 'ADMIN_PASSWORD_RESET',
    targetUser: admin._id,
    targetUserEmail: admin.email,
    details: { message: 'Password reset by Super Admin' },
    ipAddress,
    userAgent
  });

  return { message: 'Password successfully reset' };
};

const deleteAdmin = async (id, requester, ipAddress, userAgent) => {
  if (id === requester._id.toString()) {
    const error = new Error('You cannot delete your own account');
    error.statusCode = 400;
    throw error;
  }

  const admin = await User.findOne({ _id: id, role: USER_ROLES.ADMIN });
  if (!admin) {
    const error = new Error('Admin account not found or cannot be deleted');
    error.statusCode = 404;
    throw error;
  }

  await User.deleteOne({ _id: id });

  await auditService.createLog({
    performedBy: requester._id,
    performedByName: requester.name,
    action: 'ADMIN_DELETE',
    targetUser: admin._id,
    targetUserEmail: admin.email,
    details: { name: admin.name, email: admin.email },
    ipAddress,
    userAgent
  });

  return { message: 'Admin account permanently deleted' };
};

const getDashboardStats = async () => {
  const [totalAdmins, activeAdmins, inactiveAdmins, recentlyCreatedAdmins, recentActivities] =
    await Promise.all([
      User.countDocuments({ role: USER_ROLES.ADMIN }),
      User.countDocuments({ role: USER_ROLES.ADMIN, status: USER_STATUS.ACTIVE }),
      User.countDocuments({ role: USER_ROLES.ADMIN, status: USER_STATUS.INACTIVE }),
      User.find({ role: USER_ROLES.ADMIN })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email phone status createdAt'),
      auditService.getRecentLogs(8)
    ]);

  return {
    stats: {
      totalAdmins,
      activeAdmins,
      inactiveAdmins,
      recentlyCreatedCount: recentlyCreatedAdmins.length
    },
    recentlyCreatedAdmins,
    recentActivities
  };
};

module.exports = {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  changeAdminStatus,
  resetAdminPassword,
  deleteAdmin,
  getDashboardStats
};

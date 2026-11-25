const adminService = require('../services/adminService');
const { sendSuccess } = require('../utils/apiResponse');

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password, status } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const admin = await adminService.createAdmin({
      name,
      email,
      phone,
      password,
      status,
      creator: req.user,
      ipAddress,
      userAgent
    });

    return sendSuccess(res, 'Admin account created successfully', admin, 201);
  } catch (error) {
    next(error);
  }
};

const getAdmins = async (req, res, next) => {
  try {
    const { search, status, page, limit, sortBy, sortOrder } = req.query;

    const result = await adminService.getAdmins({
      search,
      status,
      page,
      limit,
      sortBy,
      sortOrder
    });

    return sendSuccess(res, 'Admins fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

const getAdminById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await adminService.getAdminById(id);
    return sendSuccess(res, 'Admin retrieved successfully', admin);
  } catch (error) {
    next(error);
  }
};

const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, status } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const updated = await adminService.updateAdmin(
      id,
      { name, phone, status },
      req.user,
      ipAddress,
      userAgent
    );

    return sendSuccess(res, 'Admin details updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

const changeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const updated = await adminService.changeAdminStatus(
      id,
      status,
      req.user,
      ipAddress,
      userAgent
    );

    return sendSuccess(res, `Admin status updated to ${status}`, updated);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await adminService.resetAdminPassword(
      id,
      password,
      req.user,
      ipAddress,
      userAgent
    );

    return sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
};

const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await adminService.deleteAdmin(
      id,
      req.user,
      ipAddress,
      userAgent
    );

    return sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, 'Dashboard statistics fetched successfully', stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  changeStatus,
  resetPassword,
  deleteAdmin,
  getDashboardStats
};

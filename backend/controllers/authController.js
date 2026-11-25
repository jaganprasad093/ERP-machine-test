const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');
const { setAuthCookie, clearAuthCookie } = require('../utils/tokenUtils');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.login({
      email,
      password,
      ipAddress,
      userAgent
    });

    setAuthCookie(res, result.token);
    
    return sendSuccess(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    return sendSuccess(res, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Current user retrieved successfully', req.user.toJSON());
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.changePassword({
      userId: req.user._id,
      currentPassword,
      newPassword,
      ipAddress,
      userAgent
    });

    return sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getMe,
  changePassword
};

const { User, USER_STATUS } = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');
const auditService = require('./auditService');

const login = async ({ email, password, ipAddress, userAgent }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    await auditService.createLog({
      action: 'LOGIN_FAILED',
      targetUserEmail: normalizedEmail,
      details: { reason: 'User not found' },
      ipAddress,
      userAgent
    });
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await auditService.createLog({
      performedBy: user._id,
      performedByName: user.name,
      action: 'LOGIN_FAILED',
      targetUser: user._id,
      targetUserEmail: user.email,
      details: { reason: 'Incorrect password' },
      ipAddress,
      userAgent
    });
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    await auditService.createLog({
      performedBy: user._id,
      performedByName: user.name,
      action: 'LOGIN_FAILED',
      targetUser: user._id,
      targetUserEmail: user.email,
      details: { reason: 'Account inactive' },
      ipAddress,
      userAgent
    });
    const error = new Error('Your account is inactive. Please contact Super Administrator.');
    error.statusCode = 403;
    throw error;
  }

  const token = generateToken({
    id: user._id,
    role: user.role,
    email: user.email
  });

  await auditService.createLog({
    performedBy: user._id,
    performedByName: user.name,
    action: 'LOGIN_SUCCESS',
    targetUser: user._id,
    targetUserEmail: user.email,
    details: { role: user.role },
    ipAddress,
    userAgent
  });

  return {
    user: user.toJSON(),
    token
  };
};

const changePassword = async ({ userId, currentPassword, newPassword, ipAddress, userAgent }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isCurrentMatch = await user.comparePassword(currentPassword);
  if (!isCurrentMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  // Set new password (pre-save hook will hash it)
  user.password = newPassword;
  user.updatedBy = userId;
  await user.save();

  await auditService.createLog({
    performedBy: user._id,
    performedByName: user.name,
    action: 'PASSWORD_CHANGE',
    targetUser: user._id,
    targetUserEmail: user.email,
    details: { message: 'Password changed successfully' },
    ipAddress,
    userAgent
  });

  return { message: 'Password updated successfully' };
};

module.exports = {
  login,
  changePassword
};

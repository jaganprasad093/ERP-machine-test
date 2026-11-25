const { User } = require('../models/User');
const auditService = require('./auditService');

const getProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!user) {
    const error = new Error('User profile not found');
    error.statusCode = 404;
    throw error;
  }

  return user.toJSON();
};

const updateProfile = async (userId, { name, phone }, ipAddress, userAgent) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.name = name.trim();
  user.phone = phone.trim();
  user.updatedBy = userId;
  await user.save();

  await auditService.createLog({
    performedBy: user._id,
    performedByName: user.name,
    action: 'PROFILE_UPDATE',
    targetUser: user._id,
    targetUserEmail: user.email,
    details: { name: user.name, phone: user.phone },
    ipAddress,
    userAgent
  });

  return user.toJSON();
};

module.exports = {
  getProfile,
  updateProfile
};

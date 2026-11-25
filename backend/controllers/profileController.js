const profileService = require('../services/profileService');
const { sendSuccess } = require('../utils/apiResponse');

const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user._id);
    return sendSuccess(res, 'Profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const updated = await profileService.updateProfile(
      req.user._id,
      { name, phone },
      ipAddress,
      userAgent
    );

    return sendSuccess(res, 'Profile updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};

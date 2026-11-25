const AuditLog = require('../models/AuditLog');

const createLog = async ({
  performedBy = null,
  performedByName = 'System',
  action,
  targetUser = null,
  targetUserEmail = null,
  details = {},
  ipAddress = null,
  userAgent = null
}) => {
  try {
    await AuditLog.create({
      performedBy,
      performedByName,
      action,
      targetUser,
      targetUserEmail,
      details,
      ipAddress,
      userAgent
    });
  } catch (err) {
    console.error('[AuditService Error] Failed to record audit log:', err.message);
  }
};

const getRecentLogs = async (limit = 10) => {
  return AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('performedBy', 'name email role')
    .populate('targetUser', 'name email role');
};

module.exports = {
  createLog,
  getRecentLogs
};

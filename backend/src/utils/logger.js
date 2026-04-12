const AuditLog = require('../models/AuditLog');

/**
 * Log a PM action to the database
 * @param {string} actorId - The user performing the action
 * @param {string} action - Description of the action (e.g., 'INVITE_USER')
 * @param {string} workspaceId - Associated workspace
 * @param {string} [targetId] - Target user/object ID
 * @param {object} [details] - Additional JSON metadata
 */
async function logAudit(actorId, action, workspaceId, targetId = null, details = {}) {
  try {
    await AuditLog.create({
      actorId,
      action,
      workspaceId,
      targetId,
      details
    });
  } catch (err) {
    console.warn('[AuditLog] Failed to create log entry:', err.message);
  }
}

module.exports = { logAudit };

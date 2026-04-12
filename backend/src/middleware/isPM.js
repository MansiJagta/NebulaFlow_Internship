const Workspace = require('../models/Workspace');

/**
 * Middleware: Check if the current user is a PM in the workspace
 * 
 * Requirements:
 * - Must have requireAuth middleware applied first (sets req.user)
 * - workspaceId must be in req.params
 * 
 * Returns:
 * - 403 if user is not a PM in the workspace
 * - 404 if workspace is not found
 * - Calls next() if user is a PM
 */
async function isPM(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const currentUserId = req.user._id;

    // Validate workspaceId exists
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }

    // Find workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Find current user in workspace members
    const currentUserMember = workspace.members.find(m =>
      m.userId.toString() === currentUserId.toString()
    );

    // Check if user is a member and has PM role
    if (!currentUserMember || currentUserMember.role !== 'pm') {
      return res.status(403).json({ error: 'Only PMs can perform this action' });
    }

    // User is PM, proceed to next middleware/route handler
    next();
  } catch (err) {
    console.error('[middleware] isPM check failed', err);
    res.status(500).json({ error: 'Authorization check failed' });
  }
}

module.exports = { isPM };

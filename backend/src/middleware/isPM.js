const Workspace = require('../models/Workspace');
const UserIdentity = require('../models/UserIdentity');

/**
 * Middleware: Check if the current user is a PM in the workspace
 * 
 * Requirements:
 * - Must have requireAuth middleware applied first (sets req.user)
 * - workspaceId must be in req.params
 * 
 * Checks (in order):
 * 1. User has 'pm' role in workspace members
 * 2. User is the workspace owner
 * 3. User is the GitHub repo owner for this workspace
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

    const userIdStr = currentUserId.toString();

    // Find ALL entries for the current user in workspace members
    const userEntries = workspace.members.filter(m => {
      const entryId = (m.userId?._id || m.userId || '').toString();
      return entryId === userIdStr;
    });

    // Check if ANY entry has PM role
    const hasPMRole = userEntries.some(m => m.role === 'pm');

    // Fallback: Also check if user is the workspace owner
    const isOwner = workspace.ownerId && (workspace.ownerId._id || workspace.ownerId).toString() === userIdStr;

    console.log(`[isPM] User ${userIdStr} in workspace ${workspaceId}:`);
    console.log(`[isPM]   Entries found: ${userEntries.length}, roles: [${userEntries.map(m => m.role).join(', ')}]`);
    console.log(`[isPM]   hasPMRole: ${hasPMRole}, isOwner: ${isOwner}`);

    let authorized = hasPMRole || isOwner;

    // Additional check: Is this user the GitHub repo owner for this workspace?
    if (!authorized && workspace.githubConfig?.repoOwner) {
      try {
        const identity = await UserIdentity.findOne({
          userId: currentUserId,
          provider: 'github'
        });

        if (identity) {
          const ghUsername = (identity.username || '').toLowerCase();
          const repoOwner = (workspace.githubConfig.repoOwner || '').toLowerCase();

          console.log(`[isPM]   GitHub identity: ${ghUsername}, repoOwner: ${repoOwner}`);

          if (ghUsername && repoOwner && ghUsername === repoOwner) {
            authorized = true;
            console.log(`[isPM]   ✅ User is the GitHub repo owner — auto-promoting to PM`);

            // Auto-fix: Update the user's role to PM in the workspace
            if (userEntries.length > 0) {
              userEntries[0].role = 'pm';
            } else {
              workspace.members.push({
                userId: currentUserId,
                role: 'pm',
                joinedAt: new Date()
              });
            }
            
            // Also update ownerId if not set correctly
            if (!isOwner) {
              workspace.ownerId = currentUserId;
            }
            
            await workspace.save();
            console.log(`[isPM]   Database updated: user is now PM in workspace`);
          }
        }
      } catch (identityErr) {
        console.warn(`[isPM]   GitHub identity check failed:`, identityErr.message);
      }
    }

    if (!authorized) {
      console.log(`[isPM] ❌ Access denied for user ${userIdStr}`);
      return res.status(403).json({ error: 'Only PMs can perform this action' });
    }

    // Attach workspace to request for downstream use
    req.workspace = workspace;

    // User is PM, proceed to next middleware/route handler
    console.log(`[isPM] ✅ PM access granted for user ${userIdStr}`);
    next();
  } catch (err) {
    console.error('[middleware] isPM check failed', err);
    res.status(500).json({ error: 'Authorization check failed' });
  }
}

module.exports = { isPM };

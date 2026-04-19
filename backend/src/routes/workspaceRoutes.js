const express = require('express');
const {
    getMyWorkspace,
    createWorkspace,
    getWorkspaceMembers, // Added this new function
    getWorkspaceById,
    addMemberToWorkspace,
    updateMemberRole,
    removeMember
} = require('../controllers/workspaceController');
const { requireAuth } = require('../middleware/auth');
const { isPM } = require('../middleware/isPM');

const router = express.Router();

// Apply authentication to all workspace routes
router.use(requireAuth);

// Dashboard & Active Workspace Context
router.get('/me', getMyWorkspace);
router.post('/', createWorkspace);

// Scoped Member Fetching (Fixes the "Global Collaborators" issue)
// This route ensures Slack and the UI only show people in THIS specific repo
router.get('/:workspaceId/members', getWorkspaceMembers);
router.get('/:workspaceId', getWorkspaceById);

// Member Management (Restricted to PMs)
router.post('/:workspaceId/add-member', isPM, addMemberToWorkspace);
router.patch('/:workspaceId/members/:memberId/role', isPM, updateMemberRole);
router.delete('/:workspaceId/members/:memberId', isPM, removeMember);

module.exports = router;
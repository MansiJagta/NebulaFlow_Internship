const express = require('express');
const { getMyWorkspace, createWorkspace, addMemberToWorkspace } = require('../controllers/workspaceController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/me', getMyWorkspace);
router.post('/', createWorkspace);
router.post('/:workspaceId/add-member', addMemberToWorkspace);

module.exports = router;

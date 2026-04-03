const express = require('express');
const { getMyWorkspace, createWorkspace } = require('../controllers/workspaceController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/me', getMyWorkspace);
router.post('/', createWorkspace);

module.exports = router;

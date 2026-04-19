const express = require('express');
const { getPerformanceData, getCollaboratorPerformance } = require('../controllers/performanceController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Register the GET /api/performance/:workspaceId route
router.get('/:workspaceId', requireAuth, getPerformanceData);

// GET /api/performance/user/:userId?workspaceId=ID
router.get('/user/:userId', requireAuth, getCollaboratorPerformance);

module.exports = router;

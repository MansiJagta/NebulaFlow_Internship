const express = require('express');
const { getPerformanceData } = require('../controllers/performanceController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Register the GET /api/performance/:workspaceId route
router.get('/:workspaceId', requireAuth, getPerformanceData);

module.exports = router;

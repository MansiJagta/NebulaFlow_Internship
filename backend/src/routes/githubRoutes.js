const express = require('express');
const {
    getRepoDetails,
    getRepoCollaborators,
    syncGitHubRepository,
} = require('../controllers/githubController');
const { getAdvancedGitHubAnalytics } = require('../controllers/githubAnalyticsController');
const { sendInvite } = require('../controllers/inviteController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/github/repo?owner=<owner>&repo=<repo>
router.get('/repo', getRepoDetails);

// GET /api/github/repo/collaborators?owner=<owner>&repo=<repo>
router.get('/repo/collaborators', getRepoCollaborators);

// POST /api/github/sync-repo (requires authentication)
// Syncs a GitHub repository and assigns roles based on ownership
router.post('/sync-repo', requireAuth, syncGitHubRepository);

// GET /api/github/advanced-analytics
router.get('/advanced-analytics', requireAuth, getAdvancedGitHubAnalytics);

// POST /api/github/invite  { email, githubUsername?, role, repoOwner, repoName }
router.post('/invite', sendInvite);

module.exports = router;

const express = require('express');
const {
    getRepoDetails,
    getRepoCollaborators,
} = require('../controllers/githubController');
const { sendInvite } = require('../controllers/inviteController');

const router = express.Router();

// GET /api/github/repo?owner=<owner>&repo=<repo>
router.get('/repo', getRepoDetails);

// GET /api/github/repo/collaborators?owner=<owner>&repo=<repo>
router.get('/repo/collaborators', getRepoCollaborators);

// POST /api/github/invite  { email, githubUsername?, role, repoOwner, repoName }
router.post('/invite', sendInvite);

module.exports = router;

const express = require('express');
const {
  registerWithEmail,
  loginWithEmailPassword,
  getCurrentUser,
  logout,
  startGoogleOAuth,
  handleGoogleCallback,
  connectGitHub,
  githubCallback,
  getGitHubRepos,
  getGitHubStatus,
} = require('../controllers/authController');
const { acceptInvite } = require('../controllers/inviteController');

const router = express.Router();

// Manual email/password auth with JWT
router.post('/register', registerWithEmail);
router.post('/login-email', loginWithEmailPassword);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

// Invite acceptance
router.get('/accept-invite', acceptInvite);

// Google OAuth for login / signup
router.get('/google', startGoogleOAuth);
router.get('/google/callback', handleGoogleCallback);

router.get('/github', connectGitHub);
router.get('/github/callback', githubCallback);
router.get('/github/repos', getGitHubRepos);
router.get('/github/status', getGitHubStatus);

module.exports = router;

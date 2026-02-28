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
  getGitHubRepos
} = require('../controllers/authController');

const router = express.Router();

// Manual email/password auth with JWT
router.post('/register', registerWithEmail);
router.post('/login-email', loginWithEmailPassword);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

// Google OAuth for login / signup
router.get('/google', startGoogleOAuth);
router.get('/google/callback', handleGoogleCallback);

router.get('/github', connectGitHub);
router.get('/github/callback', githubCallback);
router.get('/github/repos', getGitHubRepos);
module.exports = router;

const express = require('express');
const {
  registerWithEmail,
  loginWithEmailPassword,
  getCurrentUser,
  logout,
  startGoogleOAuth,
  handleGoogleCallback,
  redirectToGitHub,
  handleGitHubCallback,
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

// Existing GitHub OAuth (used later for repository access)
router.get('/github', redirectToGitHub);
router.get('/github/callback', handleGitHubCallback);

module.exports = router;

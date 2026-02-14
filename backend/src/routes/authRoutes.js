const router = require('express-validator').router(); // Assuming router setup
const { redirectToGitHub, handleCallback } = require('../controllers/authController');
router.get('/github', redirectToGitHub);
router.get('/github/callback', handleCallback);
module.exports = router;
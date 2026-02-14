const router = require('express').Router();
const { getRepos } = require('../controllers/repoController');
router.get('/', getRepos);
module.exports = router;
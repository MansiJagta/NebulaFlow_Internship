const express = require('express');
const {
  getUsers,
  getSprints,
  getIssues,
  createIssue,
  updateIssue,
} = require('../controllers/pmController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/users', getUsers);
router.get('/sprints', getSprints);
router.get('/issues', getIssues);
router.post('/issues', createIssue);
router.patch('/issues/:id', updateIssue);

module.exports = router;

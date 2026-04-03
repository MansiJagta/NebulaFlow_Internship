const express = require('express');
const {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} = require('../controllers/milestoneController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getMilestones);
router.post('/', createMilestone);
router.patch('/:id', updateMilestone);
router.delete('/:id', deleteMilestone);

module.exports = router;

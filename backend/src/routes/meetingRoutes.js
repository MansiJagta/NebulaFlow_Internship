const express = require('express');
const {
  getMeetings,
  createMeeting,
  deleteMeeting,
} = require('../controllers/meetingController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getMeetings);
router.post('/', createMeeting);
router.delete('/:id', deleteMeeting);

module.exports = router;

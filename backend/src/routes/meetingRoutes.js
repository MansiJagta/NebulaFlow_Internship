const express = require('express');
const {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  attendMeeting,
} = require('../controllers/meetingController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getMeetings);
router.post('/', createMeeting);
router.patch('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);
router.post('/:id/attend', attendMeeting);

module.exports = router;

const Meeting = require('../models/Meeting');

// GET all meetings for a workspace
exports.getMeetings = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    const filter = {};
    if (workspaceId) filter.workspaceId = workspaceId;

    const meetings = await Meeting.find(filter)
      .populate('organizerId', 'fullName email')
      .populate('attendees', 'fullName email')
      .sort({ startTime: 1 })
      .lean();

    res.json(meetings);
  } catch (err) {
    console.error('[meeting] getMeetings failed', err);
    res.status(500).json({ error: 'Failed to load meetings' });
  }
};

// CREATE a meeting
exports.createMeeting = async (req, res) => {
  try {
    const {
      workspaceId,
      title,
      startTime,
      endTime,
      attendees,
      slackChannelId,
      description,
    } = req.body;
    
    const organizerId = req.user._id;

    if (!workspaceId || !title || !startTime || !endTime) {
      return res.status(400).json({ error: 'workspaceId, title, startTime, and endTime are required' });
    }

    const meeting = await Meeting.create({
      workspaceId,
      title,
      startTime,
      endTime,
      organizerId,
      attendees: attendees || [],
      slackChannelId,
      description: description || '',
    });

    res.status(201).json(meeting);
  } catch (err) {
    console.error('[meeting] createMeeting failed', err);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
};

// UPDATE a meeting (organizer only)
exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Only organizer can update meeting
    if (meeting.organizerId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only organizer can update meeting' });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(id, updates, { new: true })
      .populate('organizerId', 'fullName email')
      .populate('attendees', 'fullName email');

    res.json(updatedMeeting);
  } catch (err) {
    console.error('[meeting] updateMeeting failed', err);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
};

// RSVP to meeting (accept/decline)
exports.attendMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accept' or 'decline'
    const userId = req.user._id;

    if (!['accept', 'decline'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accept or decline' });
    }

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Check if user is an attendee
    const isAttendee = meeting.attendees.some(id => id.toString() === userId.toString());
    if (!isAttendee) {
      return res.status(400).json({ error: 'User is not an attendee' });
    }

    // For now, just mark as accepted
    // Future enhancement: store actual RSVP status separately
    res.json({ message: `Meeting ${status}ed` });
  } catch (err) {
    console.error('[meeting] attendMeeting failed', err);
    res.status(500).json({ error: 'Failed to RSVP meeting' });
  }
};

// DELETE a meeting
exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findByIdAndDelete(id);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ message: 'Meeting deleted' });
  } catch (err) {
    console.error('[meeting] deleteMeeting failed', err);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
};

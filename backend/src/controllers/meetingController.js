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

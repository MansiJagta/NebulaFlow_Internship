const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Sprint = require('../models/Sprint');

// Helper to generate a unique issue key
function generateIssueKey() {
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `NEB-${randomNum}`;
}

// --- Users ---
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('fullName email role avatarUrl');
    res.json(users);
  } catch (err) {
    console.error('[pm] getUsers failed', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
};

// --- Sprints ---
exports.getSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find().sort({ startsOn: 1 }).lean();
    res.json(sprints);
  } catch (err) {
    console.error('[pm] getSprints failed', err);
    res.status(500).json({ error: 'Failed to load sprints' });
  }
};

// --- Issues ---
exports.getIssues = async (req, res) => {
  try {
    const { assigneeUserId, sprintId } = req.query;
    const filters = {};

    if (sprintId) {
      filters.sprintId = sprintId;
    }

    if (assigneeUserId) {
      filters.assigneeUserId = assigneeUserId;
    }

    const issues = await Issue.find(filters)
      .sort({ createdAt: -1 })
      .populate('assigneeUserId', 'fullName email avatarUrl')
      .populate('reporterUserId', 'fullName email avatarUrl');

    const result = issues.map(issue => {
      const assigneeUser = issue.assigneeUserId
        ? {
          _id: issue.assigneeUserId._id.toString(),
          fullName: issue.assigneeUserId.fullName,
          email: issue.assigneeUserId.email,
          avatarUrl: issue.assigneeUserId.avatarUrl,
        }
        : null;

      const reporterUser = issue.reporterUserId
        ? {
          _id: issue.reporterUserId._id.toString(),
          fullName: issue.reporterUserId.fullName,
          email: issue.reporterUserId.email,
          avatarUrl: issue.reporterUserId.avatarUrl,
        }
        : null;

      return {
        ...issue.toObject(),
        assigneeUser,
        reporterUser,
        assignee: assigneeUser ? assigneeUser.fullName : null,
        assigneeAvatar: assigneeUser ? assigneeUser.avatarUrl : null,
        reporter: reporterUser ? reporterUser.fullName : null,
        reporterAvatar: reporterUser ? reporterUser.avatarUrl : null,
        priority: issue.priority === 1 ? 'high' : issue.priority === 2 ? 'medium' : 'low',
        points: issue.storyPoints,
        status: issue.status,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('[pm] getIssues failed', err);
    res.status(500).json({ error: 'Failed to load issues' });
  }
};

exports.createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      assigneeUserId,
      priority,
      type,
      storyPoints,
      sprintId,
      status,
      dueDate,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const issueKey = generateIssueKey();
    const reporterUserId = req.user._id;

    const newIssue = await Issue.create({
      issueKey,
      title,
      description,
      assigneeUserId: assigneeUserId || null,
      reporterUserId,
      priority: priority === 'high' ? 1 : priority === 'low' ? 3 : 2,
      type: type || 'task',
      storyPoints: storyPoints || 0,
      sprintId: sprintId || null,
      status: status || 'backlog',
    });

    const populated = await Issue.findById(newIssue._id)
      .populate('assigneeUserId', 'fullName email avatarUrl')
      .populate('reporterUserId', 'fullName email avatarUrl');

    const assigneeUser = populated.assigneeUserId
      ? {
        _id: populated.assigneeUserId._id.toString(),
        fullName: populated.assigneeUserId.fullName,
        email: populated.assigneeUserId.email,
        avatarUrl: populated.assigneeUserId.avatarUrl,
      }
      : null;

    const reporterUser = populated.reporterUserId
      ? {
        _id: populated.reporterUserId._id.toString(),
        fullName: populated.reporterUserId.fullName,
        email: populated.reporterUserId.email,
        avatarUrl: populated.reporterUserId.avatarUrl,
      }
      : null;

    const response = {
      ...populated.toObject(),
      assigneeUser,
      reporterUser,
      assignee: assigneeUser ? assigneeUser.fullName : null,
      assigneeAvatar: assigneeUser ? assigneeUser.avatarUrl : null,
      reporter: reporterUser ? reporterUser.fullName : null,
      reporterAvatar: reporterUser ? reporterUser.avatarUrl : null,
      priority:
        populated.priority === 1
          ? 'high'
          : populated.priority === 3
            ? 'low'
            : 'medium',
      points: populated.storyPoints,
    };

    res.status(201).json(response);
  } catch (err) {
    console.error('[pm] createIssue failed', err);
    res.status(500).json({ error: 'Failed to create issue' });
  }
};

exports.updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Normalize priority if provided
    if (updates.priority) {
      updates.priority = updates.priority === 'high' ? 1 : updates.priority === 'low' ? 3 : 2;
    }

    const issue = await Issue.findByIdAndUpdate(id, updates, { new: true })
      .populate('assigneeUserId', 'fullName email avatarUrl')
      .populate('reporterUserId', 'fullName email avatarUrl');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const assigneeUser = issue.assigneeUserId
      ? {
        _id: issue.assigneeUserId._id.toString(),
        fullName: issue.assigneeUserId.fullName,
        email: issue.assigneeUserId.email,
        avatarUrl: issue.assigneeUserId.avatarUrl,
      }
      : null;

    const reporterUser = issue.reporterUserId
      ? {
        _id: issue.reporterUserId._id.toString(),
        fullName: issue.reporterUserId.fullName,
        email: issue.reporterUserId.email,
        avatarUrl: issue.reporterUserId.avatarUrl,
      }
      : null;

    res.json({
      ...issue.toObject(),
      assigneeUser,
      reporterUser,
      assignee: assigneeUser ? assigneeUser.fullName : null,
      assigneeAvatar: assigneeUser ? assigneeUser.avatarUrl : null,
      reporter: reporterUser ? reporterUser.fullName : null,
      reporterAvatar: reporterUser ? reporterUser.avatarUrl : null,
      priority:
        issue.priority === 1 ? 'high' : issue.priority === 3 ? 'low' : 'medium',
      points: issue.storyPoints,
    });
  } catch (err) {
    console.error('[pm] updateIssue failed', err);
    res.status(500).json({ error: 'Failed to update issue' });
  }
};

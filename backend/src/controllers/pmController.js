const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Sprint = require('../models/Sprint');
const Workspace = require('../models/Workspace');

// Helper to generate a unique issue key
function generateIssueKey() {
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `NEB-${randomNum}`;
}

async function getUserWorkspace(userId, workspaceId = null) {
  if (workspaceId) {
    const ws = await Workspace.findById(workspaceId).populate('members.userId', 'fullName email avatarUrl role');
    if (ws) return ws;
  }

  return await Workspace.findOne({ 'members.userId': userId }).populate('members.userId', 'fullName email avatarUrl role');
}

// --- Users ---
exports.getUsers = async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId || null;
    const workspace = await getUserWorkspace(req.user._id, workspaceId);

    if (!workspace) {
      // fallback to global active users when workspace is absent
      const users = await User.find({ isActive: true }).select('fullName email role avatarUrl');
      return res.json(users);
    }

    const members = workspace.members
      .filter(m => m.userId && m.userId.isActive !== false)
      .map(m => ({
        _id: m.userId._id,
        fullName: m.userId.fullName,
        email: m.userId.email,
        avatarUrl: m.userId.avatarUrl,
        role: m.role || m.userId.role || 'collaborator',
      }));

    res.json(members);
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
    const { assigneeUserId, sprintId, workspaceId } = req.query;
    const filters = {};

    const workspace = await getUserWorkspace(req.user._id, workspaceId);
    if (workspace) {
      filters.workspaceId = workspace._id;
    }

    if (sprintId) {
      filters.sprintId = sprintId;
    }

    if (assigneeUserId) {
      filters.assigneeUserId = assigneeUserId;
    }

    const issues = await Issue.find(filters)
      .sort({ createdAt: -1 })
      .populate('assigneeUserId', 'fullName email avatarUrl')
      .populate('reporterUserId', 'fullName email avatarUrl')
      .populate('sprintId', 'name');

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
        reporterAvatar: reporterUser ? reporterUser.avatarUrl : null, sprint: issue.sprintId ? issue.sprintId.name : 'Backlog',
        sprintId: issue.sprintId ? issue.sprintId._id : null, priority: issue.priority === 1 ? 'high' : issue.priority === 2 ? 'medium' : 'low',
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

    // determine workspace based on request or membership
    const workspace = await getUserWorkspace(req.user._id, req.body.workspaceId || null);
    let workspaceIdValue = workspace ? workspace._id : null;

    if (!workspaceIdValue) {
      return res.status(400).json({ error: 'Workspace context is required for issue creation' });
    }

    // validate assignee belongs to the workspace
    if (assigneeUserId) {
      const isMember = workspace.members.some(m => m.userId._id.toString() === assigneeUserId.toString());
      if (!isMember) {
        return res.status(400).json({ error: 'Assignee must be a member of the current workspace' });
      }
    }

    const newIssue = await Issue.create({
      issueKey,
      title,
      description,
      workspaceId: workspaceIdValue,
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
      .populate('reporterUserId', 'fullName email avatarUrl')
      .populate('sprintId', 'name');

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
      sprint: populated.sprintId ? populated.sprintId.name : 'Backlog',
      sprintId: populated.sprintId ? populated.sprintId._id : null,
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
      .populate('reporterUserId', 'fullName email avatarUrl')
      .populate('sprintId', 'name');

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
      sprint: issue.sprintId ? issue.sprintId.name : 'Backlog',
      sprintId: issue.sprintId ? issue.sprintId._id : null,
      priority:
        issue.priority === 1 ? 'high' : issue.priority === 3 ? 'low' : 'medium',
      points: issue.storyPoints,
    });
  } catch (err) {
    console.error('[pm] updateIssue failed', err);
    res.status(500).json({ error: 'Failed to update issue' });
  }
};

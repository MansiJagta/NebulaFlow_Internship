const Workspace = require('../models/Workspace');

// Fetch current authenticated user's workspace (first workspace they belong to)
exports.getMyWorkspace = async (req, res) => {
  try {
    const userId = req.user._id;

    const workspace = await Workspace.findOne({ 'members.userId': userId }).populate('members.userId', 'fullName email avatarUrl role');

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found for current user' });
    }

    const members = workspace.members.map(m => ({
      _id: m.userId._id,
      fullName: m.userId.fullName,
      email: m.userId.email,
      avatarUrl: m.userId.avatarUrl,
      role: m.role || m.userId.role || 'collaborator',
    }));

    res.json({
      _id: workspace._id,
      name: workspace.name,
      description: workspace.description,
      githubConfig: workspace.githubConfig || {},
      members,
    });
  } catch (err) {
    console.error('[workspace] getMyWorkspace failed', err);
    res.status(500).json({ error: 'Failed to load workspace' });
  }
};

// Create workspace (for initial project linking)
exports.createWorkspace = async (req, res) => {
  try {
    const { name, description, githubConfig = {} } = req.body;
    if (!name) return res.status(400).json({ error: 'Workspace name required' });

    const userId = req.user._id;

    // Check if user already has workspace with this name (per-user uniqueness)
    const existing = await Workspace.findOne({
      name,
      'members.userId': userId,
    });

    if (existing) {
      // If workspace exists for this user, return it
      const populated = await existing.populate('members.userId', 'fullName email avatarUrl role');
      return res.json(populated);
    }

    const workspace = await Workspace.create({
      name,
      description: description || '',
      githubConfig,
      members: [{ userId, role: 'pm' }],
    });

    const populated = await workspace.populate('members.userId', 'fullName email avatarUrl role');
    res.status(201).json(populated);
  } catch (err) {
    console.error('[workspace] createWorkspace failed', err);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
};

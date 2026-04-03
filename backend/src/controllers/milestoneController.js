const Milestone = require('../models/Milestone');
const Workspace = require('../models/Workspace');

// GET all milestones for a workspace
exports.getMilestones = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    const filter = {};
    if (workspaceId) filter.workspaceId = workspaceId;

    const milestones = await Milestone.find(filter)
      .sort({ expectedStartDate: 1 })
      .lean();

    res.json(milestones);
  } catch (err) {
    console.error('[milestone] getMilestones failed', err);
    res.status(500).json({ error: 'Failed to load milestones' });
  }
};

// CREATE a milestone (PM only)
exports.createMilestone = async (req, res) => {
  try {
    const {
      workspaceId,
      name,
      expectedStartDate,
      expectedEndDate,
      actualStartDate,
      actualEndDate,
      progress,
      color,
      dependencies,
    } = req.body;

    if (!workspaceId || !name || !expectedStartDate || !expectedEndDate) {
      return res.status(400).json({ error: 'workspaceId, name, expectedStartDate, and expectedEndDate are required' });
    }

    const milestone = await Milestone.create({
      workspaceId,
      name,
      expectedStartDate,
      expectedEndDate,
      actualStartDate: actualStartDate || null,
      actualEndDate: actualEndDate || null,
      progress: progress || 0,
      color: color || '',
      dependencies: dependencies || [],
    });

    res.status(201).json(milestone);
  } catch (err) {
    console.error('[milestone] createMilestone failed', err);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
};

// UPDATE a milestone
exports.updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const milestone = await Milestone.findByIdAndUpdate(id, updates, { new: true });

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json(milestone);
  } catch (err) {
    console.error('[milestone] updateMilestone failed', err);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
};

// DELETE a milestone
exports.deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const milestone = await Milestone.findByIdAndDelete(id);

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json({ message: 'Milestone deleted' });
  } catch (err) {
    console.error('[milestone] deleteMilestone failed', err);
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
};

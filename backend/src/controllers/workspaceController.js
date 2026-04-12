// const axios = require('axios');
// const Workspace = require('../models/Workspace');
// const User = require('../models/User');
// const UserIdentity = require('../models/UserIdentity');

// /**
//  * GET /api/workspace/me
//  * Fetch current authenticated user's workspace
//  */
// exports.getMyWorkspace = async (req, res) => {
//   try {
//     const userId = req.user?._id || req.user?.id;
//     if (!userId) return res.status(401).json({ error: 'Not authenticated' });

//     const workspace = await Workspace.findOne({ 'members.userId': userId })
//       .populate('members.userId', 'fullName email avatarUrl role')
//       .populate('ownerId', 'fullName email');

//     if (!workspace) {
//       return res.status(404).json({ error: 'Workspace not found' });
//     }

//     const members = workspace.members.map(m => ({
//       _id: m.userId?._id,
//       fullName: m.userId?.fullName,
//       email: m.userId?.email,
//       avatarUrl: m.userId?.avatarUrl,
//       role: m.role || 'collaborator',
//     }));

//     res.json({
//       _id: workspace._id,
//       name: workspace.name,
//       description: workspace.description,
//       owner: workspace.ownerId,
//       githubConfig: workspace.githubConfig || {},
//       members,
//     });
//   } catch (err) {
//     console.error('[workspace] getMyWorkspace failed', err);
//     res.status(500).json({ error: 'Failed to load workspace' });
//   }
// };

// /**
//  * POST /api/workspace
//  * Create or Update Workspace (Linking logic)
//  */
// exports.createWorkspace = async (req, res) => {
//   try {
//     const { name, description, githubConfig = {} } = req.body;

//     // Aggressive extraction of user ID from session/passport/user object
//     const rawId = req.user?._id || req.user?.id || req.session?.passport?.user;

//     if (!rawId) {
//       console.error('[workspace] Failed: No user ID found in request context');
//       return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
//     }

//     const userId = rawId.toString();

//     // 1. Check if this user is already a PM of a workspace
//     let workspace = await Workspace.findOne({
//       'members.userId': userId,
//       'members.role': 'pm'
//     });

//     if (workspace) {
//       console.log(`[workspace] Updating existing workspace: ${workspace._id}`);
//       workspace.name = name;
//       workspace.description = description || workspace.description;
//       workspace.githubConfig = {
//         ...githubConfig,
//         linkedBy: userId,
//         linkedAt: new Date(),
//       };

//       await workspace.save();
//       const populated = await workspace.populate('members.userId', 'fullName email avatarUrl role');
//       return res.json(populated);
//     }

//     // 2. Create a new Workspace instance
//     console.log(`[workspace] Creating new workspace for owner: ${userId}`);
//     const newWorkspace = new Workspace({
//       name,
//       description: description || '',
//       ownerId: userId,
//       githubConfig: {
//         ...githubConfig,
//         linkedBy: userId,
//         linkedAt: new Date(),
//       },
//       members: [{ userId: userId, role: 'pm' }]
//     });

//     await newWorkspace.save();

//     const populated = await newWorkspace.populate('members.userId', 'fullName email avatarUrl role');
//     res.status(201).json(populated);

//   } catch (err) {
//     console.error('[workspace] createWorkspace critical failure:', err.message);
//     res.status(500).json({ error: 'Failed to create workspace', details: err.message });
//   }
// };

// /**
//  * POST /api/workspace/:workspaceId/add-member
//  */
// exports.addMemberToWorkspace = async (req, res) => {
//   try {
//     const { workspaceId } = req.params;
//     const { githubUsername, userId: providedUserId } = req.body;
//     const currentUserId = req.user._id;

//     const workspace = await Workspace.findById(workspaceId);
//     if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

//     let targetUser = null;
//     if (providedUserId) {
//       targetUser = await User.findById(providedUserId);
//     } else if (githubUsername) {
//       const identity = await UserIdentity.findOne({ 
//         provider: 'github',
//         username: githubUsername.toLowerCase()
//       }).populate('userId');
//       targetUser = identity?.userId;
//     }

//     if (!targetUser) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const isAlreadyMember = workspace.members.some(m => 
//       m.userId.toString() === targetUser._id.toString()
//     );
//     if (isAlreadyMember) {
//       return res.status(400).json({ error: 'User already in workspace' });
//     }

//     workspace.members.push({
//       userId: targetUser._id,
//       role: 'collaborator',
//       joinedAt: new Date(),
//     });

//     await workspace.save();
//     res.json({ success: true, message: 'Member added' });
//   } catch (err) {
//     console.error('[workspace] addMemberToWorkspace failed', err);
//     res.status(500).json({ error: 'Failed to add member' });
//   }
// };

// /**
//  * PATCH /api/workspace/:workspaceId/members/:memberId/role
//  */
// exports.updateMemberRole = async (req, res) => {
//   try {
//     const { workspaceId, memberId } = req.params;
//     const { role } = req.body;

//     const workspace = await Workspace.findById(workspaceId);
//     if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

//     const memberIndex = workspace.members.findIndex(m => m.userId.toString() === memberId);
//     if (memberIndex === -1) return res.status(404).json({ error: 'Member not found' });

//     workspace.members[memberIndex].role = role;
//     await workspace.save();

//     res.json({ success: true, message: 'Role updated' });
//   } catch (err) {
//     console.error('[workspace] updateMemberRole failed', err);
//     res.status(500).json({ error: 'Failed to update role' });
//   }
// };

// /**
//  * DELETE /api/workspace/:workspaceId/members/:memberId
//  */
// exports.removeMember = async (req, res) => {
//   try {
//     const { workspaceId, memberId } = req.params;

//     const workspace = await Workspace.findById(workspaceId);
//     if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

//     const memberIndex = workspace.members.findIndex(m => m.userId.toString() === memberId);
//     if (memberIndex === -1) return res.status(404).json({ error: 'Member not found' });

//     workspace.members.splice(memberIndex, 1);
//     await workspace.save();

//     res.json({ success: true, message: 'Member removed' });
//   } catch (err) {
//     console.error('[workspace] removeMember failed', err);
//     res.status(500).json({ error: 'Failed to remove member' });
//   }
// };







const axios = require('axios');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const UserIdentity = require('../models/UserIdentity');

// --- ADDED: Scoped Members Fetch ---
exports.getWorkspaceMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findById(workspaceId).populate({
      path: 'members.userId',
      select: 'fullName email avatarUrl role lastSeenAt isActive'
    });

    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const scopedMembers = workspace.members
      .filter(m => m.userId && m.userId.lastSeenAt)
      .map(m => ({
        _id: m.userId._id,
        fullName: m.userId.fullName,
        email: m.userId.email,
        avatarUrl: m.userId.avatarUrl,
        role: m.role || 'collaborator',
        status: m.userId.isActive ? 'online' : 'offline'
      }));

    res.json(scopedMembers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load scoped collaborators' });
  }
};

// --- UPDATED: getMyWorkspace ---
exports.getMyWorkspace = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const workspace = await Workspace.findOne({ 'members.userId': userId })
      .populate('members.userId', 'fullName email avatarUrl role lastSeenAt')
      .populate('ownerId', 'fullName email');

    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const uniqueMembersMap = new Map();
    workspace.members.forEach(m => {
      if (m.userId && !uniqueMembersMap.has(m.userId._id.toString())) {
        uniqueMembersMap.set(m.userId._id.toString(), {
          _id: m.userId._id,
          fullName: m.userId.fullName,
          email: m.userId.email,
          avatarUrl: m.userId.avatarUrl,
          role: m.role || 'collaborator'
        });
      }
    });

    res.json({
      _id: workspace._id,
      name: workspace.name,
      description: workspace.description,
      owner: workspace.ownerId,
      githubConfig: workspace.githubConfig || {},
      members: Array.from(uniqueMembersMap.values()),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load workspace' });
  }
};

// --- createWorkspace ---
exports.createWorkspace = async (req, res) => {
  try {
    const { name, description, githubConfig = {} } = req.body;
    const rawId = req.user?._id || req.user?.id || req.session?.passport?.user;
    if (!rawId) return res.status(401).json({ error: 'Authentication failed' });
    const userId = rawId.toString();

    let workspace = await Workspace.findOne({ 'githubConfig.repoId': githubConfig.repoId });

    if (workspace) {
      workspace.name = name;
      workspace.githubConfig = { ...githubConfig, linkedBy: userId, linkedAt: new Date() };
      await workspace.save();
      return res.json(await workspace.populate('members.userId', 'fullName email avatarUrl role'));
    }

    const newWorkspace = new Workspace({
      name,
      description: description || '',
      ownerId: userId,
      githubConfig: { ...githubConfig, linkedBy: userId, linkedAt: new Date() },
      members: [{ userId: userId, role: 'pm' }]
    });

    await newWorkspace.save();
    res.status(201).json(await newWorkspace.populate('members.userId', 'fullName email avatarUrl role'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMemberToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { githubUsername, userId: providedUserId } = req.body;
    const currentUserId = req.user._id;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    let targetUser = null;
    let targetIdentity = null;

    if (providedUserId) {
      targetUser = await User.findById(providedUserId);
      targetIdentity = await UserIdentity.findOne({ userId: providedUserId, provider: 'github' });
    } else if (githubUsername) {
      const identity = await UserIdentity.findOne({ 
        provider: 'github',
        username: new RegExp(`^${githubUsername}$`, 'i')
      }).populate('userId');
      targetUser = identity?.userId;
      targetIdentity = identity;
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isAlreadyMember = workspace.members.some(m => 
      m.userId.toString() === targetUser._id.toString()
    );
    if (isAlreadyMember) {
      return res.status(400).json({ error: 'User already in workspace' });
    }

    let roleToAssign = 'collaborator';
    
    // Check if the target user is the repo owner by checking GitHub username OR repoOwnerId
    if (workspace.githubConfig && workspace.githubConfig.repoOwner) {
      // Check by username
      if (githubUsername && githubUsername.toLowerCase() === workspace.githubConfig.repoOwner.toLowerCase()) {
        roleToAssign = 'pm';
      } else if (targetIdentity && targetIdentity.username && targetIdentity.username.toLowerCase() === workspace.githubConfig.repoOwner.toLowerCase()) {
        // Check if target's GitHub username matches repo owner
        roleToAssign = 'pm';
      }
    }

    workspace.members.push({
      userId: targetUser._id,
      role: roleToAssign,
      joinedAt: new Date(),
    });

    await workspace.save();
    res.json({ success: true, message: 'Member added', role: roleToAssign });
  } catch (err) {
    console.error('[workspace] addMemberToWorkspace failed', err);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const memberIndex = workspace.members.findIndex(m => m.userId.toString() === memberId);
    if (memberIndex === -1) return res.status(404).json({ error: 'Member not found' });

    workspace.members[memberIndex].role = role;
    await workspace.save();

    res.json({ success: true, message: 'Role updated' });
  } catch (err) {
    console.error('[workspace] updateMemberRole failed', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const memberIndex = workspace.members.findIndex(m => m.userId.toString() === memberId);
    if (memberIndex === -1) return res.status(404).json({ error: 'Member not found' });

    workspace.members.splice(memberIndex, 1);
    await workspace.save();

    res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    console.error('[workspace] removeMember failed', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
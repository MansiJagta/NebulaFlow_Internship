const axios = require('axios');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const UserIdentity = require('../models/UserIdentity');

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

    // Check if user already has ANY workspace (they should only have one primary workspace)
    let workspace = await Workspace.findOne({
      'members.userId': userId,
      'members.role': 'pm'
    });

    if (workspace) {
      // Update existing workspace with new GitHub config and name/description
      workspace.name = name;
      workspace.description = description || workspace.description;
      workspace.githubConfig = githubConfig;
      await workspace.save();
      
      const populated = await workspace.populate('members.userId', 'fullName email avatarUrl role');
      console.log(`[workspace] Updated existing workspace: ${workspace._id} with repo: ${githubConfig.repoName}`);
      return res.json(populated);
    }

    // If no workspace exists, create a new one
    workspace = await Workspace.create({
      name,
      description: description || '',
      githubConfig,
      members: [{ userId, role: 'pm' }],
    });

    const populated = await workspace.populate('members.userId', 'fullName email avatarUrl role');
    console.log(`[workspace] Created new workspace: ${workspace._id} with repo: ${githubConfig.repoName}`);
    res.status(201).json(populated);
  } catch (err) {
    console.error('[workspace] createWorkspace failed', err);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
};

/**
 * POST /api/workspace/:workspaceId/add-member
 * Add an existing website user (already has GitHub account) to workspace
 * Body: { githubUsername } or { userId }
 */
exports.addMemberToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { githubUsername, userId: providedUserId } = req.body;
    const currentUserId = req.user._id;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    // Find workspace and verify current user is PM
    const workspace = await Workspace.findById(workspaceId).populate('members.userId', '_id fullName email');
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if current user is PM in this workspace
    const isPM = workspace.members.some(m => 
      m.userId._id.toString() === currentUserId.toString() && m.role === 'pm'
    );
    if (!isPM) {
      return res.status(403).json({ error: 'Only PMs can add members to workspace' });
    }

    // Find target user
    let targetUser = null;
    
    if (providedUserId) {
      targetUser = await User.findById(providedUserId);
    } else if (githubUsername) {
      // Strategy 1: Find user via GitHub identity by username (if they explicitly connected)
      const identity = await UserIdentity.findOne({ 
        provider: 'github',
        username: githubUsername.toLowerCase()
      }).populate('userId');
      targetUser = identity?.userId;

      // Strategy 2: If not found, fetch from GitHub API to get more info
      if (!targetUser) {
        try {
          console.log(`[addMemberToWorkspace] Fetching GitHub profile for: ${githubUsername}`);
          
          // Try to use current user's GitHub token for authenticated API call
          let githubHeaders = { 'Accept': 'application/vnd.github+json' };
          const currentUserIdentity = await UserIdentity.findOne({ 
            userId: currentUserId, 
            provider: 'github' 
          });
          if (currentUserIdentity?.accessTokenEncrypted) {
            githubHeaders['Authorization'] = `Bearer ${currentUserIdentity.accessTokenEncrypted}`;
          }

          const githubUserRes = await axios.get(`https://api.github.com/users/${githubUsername}`, {
            headers: githubHeaders
          });
          const githubUser = githubUserRes.data;
          console.log(`[addMemberToWorkspace] GitHub profile found: ${githubUser.login}, id: ${githubUser.id}, email: ${githubUser.email}`);
          
          // Try to find by GitHub ID (providerUserId) 
          if (githubUser.id) {
            const identityByGithubId = await UserIdentity.findOne({ 
              provider: 'github',
              providerUserId: githubUser.id.toString()
            }).populate('userId');
            if (identityByGithubId) {
              targetUser = identityByGithubId.userId;
              console.log(`[addMemberToWorkspace] ✅ Found user by GitHub ID: ${targetUser._id}`);
            }
          }
          
          // Try to find by email if GitHub profile has it
          if (!targetUser && githubUser.email) {
            targetUser = await User.findOne({ email: githubUser.email.toLowerCase() });
            console.log(`[addMemberToWorkspace] Email lookup result: ${targetUser ? 'FOUND' : 'NOT FOUND'}`);
          }
          
          // If still not found, show error with GitHub ID info
          if (!targetUser) {
            console.log(`[addMemberToWorkspace] ❌ Could not find user - GitHub ID: ${githubUser.id}, email: ${githubUser.email || 'NOT SET'}`);
          }
        } catch (githubErr) {
          console.error('[addMemberToWorkspace] GitHub API lookup failed:', {
            message: githubErr.message,
            status: githubErr.response?.status,
            data: githubErr.response?.data,
            username: githubUsername
          });
        }
      }
    }

    if (!targetUser) {
      return res.status(404).json({ 
        error: 'User not found. This GitHub collaborator may not have a platform account yet. They need to sign up first.' 
      });
    }

    // Check if already member
    const isAlreadyMember = workspace.members.some(m => 
      m.userId._id.toString() === targetUser._id.toString()
    );
    if (isAlreadyMember) {
      return res.status(400).json({ error: 'User is already a member of this workspace' });
    }

    // Add to workspace
    workspace.members.push({
      userId: targetUser._id,
      role: 'collaborator',
      joinedAt: new Date(),
    });

    await workspace.save();

    const populated = await Workspace.findById(workspace._id)
      .populate('members.userId', 'fullName email avatarUrl role');

    res.json({
      success: true,
      message: `${targetUser.fullName} has been added to the workspace`,
      workspace: {
        _id: populated._id,
        name: populated.name,
        members: populated.members.map(m => ({
          _id: m.userId._id,
          fullName: m.userId.fullName,
          email: m.userId.email,
          avatarUrl: m.userId.avatarUrl,
          role: m.role,
        })),
      },
    });
  } catch (err) {
    console.error('[workspace] addMemberToWorkspace failed', err);
    res.status(500).json({ error: 'Failed to add member to workspace' });
  }
};

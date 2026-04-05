const axios = require('axios');
const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const Issue = require('../models/Issue');
const Message = require('../models/Message');
const UserIdentity = require('../models/UserIdentity');
const { decrypt } = require('../utils/encryption');

/**
 * GET /api/performance/:workspaceId
 */
exports.getPerformanceData = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    // 1. Fetch Workspace & GitHub Config
    const workspace = await Workspace.findById(workspaceId).populate('members.userId', 'fullName email avatarUrl');
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    // 2. Aggregate Sprint Velocity (Done Issues)
    // We'll calculate a rolling 7-day velocity and bug ratio
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const velocityData = await Issue.aggregate([
      {
        $match: {
          workspaceId: new mongoose.Types.ObjectId(workspaceId),
          status: 'done',
          updatedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$assigneeUserId',
          totalPoints: { $sum: '$storyPoints' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Bug Ratio Calculation
    const bugStats = await Issue.aggregate([
      {
        $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId) }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          bugs: {
            $sum: { $cond: [{ $eq: ['$type', 'bug'] }, 1, 0] }
          }
        }
      }
    ]);

    const bugRatio = bugStats.length > 0 ? (bugStats[0].bugs / bugStats[0].total) * 100 : 0;

    // 4. Fetch GitHub Data (Real-time Proxy)
    let githubMetrics = { commits: [], prs: [], avgTurnaround: 0 };
    if (workspace.githubConfig && workspace.githubConfig.repoOwner && workspace.githubConfig.repoName) {
      const identity = await UserIdentity.findOne({ userId, provider: 'github' });
      if (identity && identity.accessTokenEncrypted) {
        try {
          const token = decrypt(identity.accessTokenEncrypted);
          const { repoOwner, repoName } = workspace.githubConfig;
          const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };

          // Fetch Commits (last 7 days)
          const commitsRes = await axios.get(
            `https://api.github.com/repos/${repoOwner}/${repoName}/commits?since=${sevenDaysAgo.toISOString()}`,
            { headers }
          ).catch(() => ({ data: [] }));

          // Fetch Closed PRs (to calculate turnaround)
          const prsRes = await axios.get(
            `https://api.github.com/repos/${repoOwner}/${repoName}/pulls?state=closed&per_page=50`,
            { headers }
          ).catch(() => ({ data: [] }));

          githubMetrics.commits = commitsRes.data;
          githubMetrics.prs = prsRes.data.filter(pr => new Date(pr.closed_at) >= sevenDaysAgo);

          // Calculate PR Turnaround Time
          const mergedPrs = githubMetrics.prs.filter(pr => pr.merged_at);
          if (mergedPrs.length > 0) {
            const totalTurnaround = mergedPrs.reduce((sum, pr) => {
              const created = new Date(pr.created_at);
              const merged = new Date(pr.merged_at);
              return sum + (merged - created);
            }, 0);
            githubMetrics.avgTurnaround = (totalTurnaround / mergedPrs.length / (1000 * 60 * 60)).toFixed(1); // hours
          }
        } catch (err) {
          console.warn('[PerformanceController] GitHub API failed:', err.message);
        }
      }
    }

    // 5. Team Collaboration (Mentions & Messages)
    // Since content is encrypted, we'll decrypt in memory to count mentions
    const messages = await Message.find({
      createdAt: { $gte: sevenDaysAgo }
    }).populate('sender', 'fullName');

    const collaborationMap = {};
    messages.forEach(msg => {
      const senderId = msg.sender?._id?.toString();
      if (!senderId) return;

      if (!collaborationMap[senderId]) collaborationMap[senderId] = { count: 0, mentions: 0 };
      collaborationMap[senderId].count++;

      // Count mentions in content
      if (msg.content) {
        try {
          const decrypted = decrypt(msg.content);
          if (decrypted) {
            const mentionCount = (decrypted.match(/@\w+/g) || []).length;
            collaborationMap[senderId].mentions += mentionCount;
          }
        } catch (e) {
          console.warn('[PerformanceController] Failed to decrypt message content:', e.message);
        }
      }
    });

    // 6. Build Final Response Object
    // Format weekly data for the stacked bar chart
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayCommits = githubMetrics.commits.filter(c => 
        new Date(c.commit.author.date).toLocaleDateString() === d.toLocaleDateString()
      ).length;

      const dayPrs = githubMetrics.prs.filter(pr => 
        new Date(pr.closed_at).toLocaleDateString() === d.toLocaleDateString()
      ).length;

      weeklyData.push({
        day: dayLabel,
        tasks: velocityData.reduce((sum, v) => sum + (v.count || 0), 0) / 7, // Placeholder for distributed task count
        commits: dayCommits,
        prs: dayPrs
      });
    }

    // Team Radar stats
    const teamPerf = workspace.members.map(m => {
      const u = m.userId;
      if (!u) return null;
      
      const vData = velocityData.find(v => v._id?.toString() === u._id.toString()) || { totalPoints: 0, count: 0 };
      const collab = collaborationMap[u._id.toString()] || { count: 0, mentions: 0 };

      return {
        member: u.fullName,
        avatar: u.fullName.charAt(0),
        role: m.role,
        velocity: vData.totalPoints,
        quality: 100 - (bugRatio / 2), // Rough heuristic
        collaboration: Math.min(100, collab.count + (collab.mentions * 2)),
        trend: '+5%' // Placeholder
      };
    }).filter(Boolean);

    res.json({
      weeklyData,
      teamPerf,
      bugRatio: bugRatio.toFixed(1),
      avgPrTurnaround: githubMetrics.avgTurnaround,
      totalSprintPoints: velocityData.reduce((sum, v) => sum + v.totalPoints, 0)
    });

  } catch (err) {
    console.error('[getPerformanceData Error]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

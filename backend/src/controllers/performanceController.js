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
    const now = new Date();
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

          // Fetch Active GitHub Collaborators to explicitly scope performance tracking
          const collabsRes = await axios.get(
            `https://api.github.com/repos/${repoOwner}/${repoName}/collaborators?per_page=100`,
            { headers }
          ).catch(() => ({ data: [] }));

          if (collabsRes.data && collabsRes.data.length > 0) {
            const logins = collabsRes.data.map(c => new RegExp(`^${c.login}$`, 'i'));
            const activeIdentities = await UserIdentity.find({ provider: 'github', username: { $in: logins } });
            githubMetrics.validUserIds = activeIdentities.map(id => id.userId.toString());
          }

        } catch (err) {
          console.warn('[PerformanceController] GitHub API failed:', err.message);
        }
      }
    }

    // 5. Fetch Slack Data (Real-time Proxy)
    let slackMetrics = { messageCount: 0 };
    if (workspace.slackConfig && workspace.slackConfig.channelId && workspace.slackConfig.accessToken) {
      try {
        const { channelId, accessToken } = workspace.slackConfig;
        const slackRes = await axios.get(
          `https://slack.com/api/conversations.history?channel=${channelId}&oldest=${sevenDaysAgo.getTime() / 1000}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        ).catch(() => ({ data: { ok: false, messages: [] } }));

        if (slackRes.data.ok) {
          slackMetrics.messageCount = slackRes.data.messages.length;
        }
      } catch (err) {
        console.warn('[PerformanceController] Slack API failed:', err.message);
      }
    }

    // 6. Fetch Jira Data (Real-time Proxy)
    let jiraMetrics = { total: 0, done: 0, inProgress: 0, todo: 0 };
    if (workspace.jiraConfig && workspace.jiraConfig.host && workspace.jiraConfig.projectKey) {
      try {
        const { host, projectKey, email, apiToken } = workspace.jiraConfig;
        const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
        const jiraRes = await axios.get(
          `https://${host}/rest/api/3/search?jql=project=${projectKey}`,
          { headers: { Authorization: `Basic ${auth}` } }
        ).catch(() => ({ data: { issues: [] } }));

        if (jiraRes.data && jiraRes.data.issues) {
          const issues = jiraRes.data.issues;
          jiraMetrics.total = issues.length;
          jiraMetrics.done = issues.filter(i => i.fields.status.name.toLowerCase() === 'done').length;
          jiraMetrics.inProgress = issues.filter(i => i.fields.status.name.toLowerCase() === 'in progress').length;
          jiraMetrics.todo = issues.filter(i => i.fields.status.name.toLowerCase() === 'to do').length;
        }
      } catch (err) {
        console.warn('[PerformanceController] Jira API failed:', err.message);
      }
    }

    // Check role from workspace members
    const userMember = workspace.members.find(m => m.userId?._id?.toString() === userId.toString());
    const isPM = userMember?.role === 'pm';

    // 7. Calculate weeklyData for charts
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = dayNames[d.getDay()];
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      // Real tasks from DB for this day
      const dailyTasksCount = await Issue.countDocuments({
        workspaceId,
        status: 'done',
        updatedAt: { $gte: dayStart, $lte: dayEnd }
      });

      // Real commits from GitHub metrics for this day
      const dailyCommits = githubMetrics.commits.filter(c => {
        const cDate = new Date(c.commit.author.date);
        return cDate >= dayStart && cDate <= dayEnd;
      }).length;

      // Real PRs from GitHub metrics for this day
      const dailyPrs = githubMetrics.prs.filter(pr => {
        const pDate = new Date(pr.closed_at);
        return pDate >= dayStart && pDate <= dayEnd;
      }).length;

      weeklyData.push({
        day: dayName,
        tasks: dailyTasksCount,
        commits: dailyCommits,
        prs: dailyPrs
      });
    }

    // 8. Calculate teamPerf and personal myPerf
    let myPerf = null;
    let validMembers = workspace.members;
    if (githubMetrics.validUserIds && githubMetrics.validUserIds.length > 0) {
        validMembers = workspace.members.filter(m => {
            const uidStr = (m.userId?._id || m.userId)?.toString();
            return uidStr && githubMetrics.validUserIds.includes(uidStr);
        });
    }

    const teamPerf = validMembers.map(member => {
      const uId = member.userId?._id || member.userId;
      const isMe = uId?.toString() === userId.toString();
      const uPerf = velocityData.find(v => v._id?.toString() === uId?.toString());
      
      const perfObj = {
        member: member.userId?.fullName || 'Anonymous',
        avatar: member.userId?.fullName?.split(' ').map(n => n[0]).join('') || '?',
        role: member.role || 'Collaborator',
        velocity: uPerf ? uPerf.totalPoints : 0,
        quality: 100 - (bugRatio / (validMembers.length || 1)), // Simplified per-member quality
        collaboration: Math.floor(Math.random() * 20) + 80 // Placeholder for real collab metric
      };

      if (isMe) myPerf = perfObj;
      return perfObj;
    });

    // Build Response based on role
    const response = {
      weeklyData,
      teamPerf,
      myPerf,
      bugRatio: bugRatio.toFixed(1),
      avgPrTurnaround: githubMetrics.avgTurnaround,
      totalSprintPoints: velocityData.reduce((sum, v) => sum + v.totalPoints, 0),
      slackActivity: slackMetrics.messageCount,
      jiraStats: jiraMetrics
    };

    // Data Isolation: Collaborators cannot see deep audit/velocity trends of others
    if (!isPM) {
        // Redact or simplify for collaborators
        response.teamPerf = teamPerf.map(m => {
            const isMe = m.member === (myPerf?.member);
            if (isMe) return m; // Allow user to see their own detail in the list
            return {
                member: m.member,
                avatar: m.avatar,
                role: m.role,
                velocity: 0,
                quality: 0,
                collaboration: 0
            };
        });
    }

    res.json(response);

  } catch (err) {
    console.error('[getPerformanceData Error]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

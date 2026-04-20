const axios = require('axios');
const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const Issue = require('../models/Issue');
const Message = require('../models/Message');
const UserIdentity = require('../models/UserIdentity');
const { decrypt } = require('../utils/encryption');

/**
 * GET /api/performance/:workspaceId
 * Returns workspace-wide performance data.
 */
exports.getPerformanceData = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { repoOwner, repoName } = req.query; 
    const userId = req.user.id;

    const workspace = await Workspace.findOne({ _id: workspaceId, 'members.userId': req.user._id })
      .populate('members.userId', 'fullName email avatarUrl');
    if (!workspace) return res.status(404).json({ message: 'Workspace not found or access denied' });

    const effectiveRepoOwner = repoOwner || workspace.githubConfig?.repoOwner;
    const effectiveRepoName = repoName || workspace.githubConfig?.repoName;

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

    let githubMetrics = { commits: [], prs: [], avgTurnaround: 0 };
    if (effectiveRepoOwner && effectiveRepoName) {
      const identity = await UserIdentity.findOne({ userId, provider: 'github' });
      if (identity && identity.accessTokenEncrypted) {
        try {
          const token = decrypt(identity.accessTokenEncrypted);
          const headers = { 
            Authorization: `Bearer ${token}`, 
            Accept: 'application/vnd.github+json',
            'User-Agent': 'NebulaFlow-App'
          };

          const commitsRes = await axios.get(
            `https://api.github.com/repos/${effectiveRepoOwner}/${effectiveRepoName}/commits?since=${sevenDaysAgo.toISOString()}`,
            { headers }
          ).catch(() => ({ data: [] }));

          const prsRes = await axios.get(
            `https://api.github.com/repos/${effectiveRepoOwner}/${effectiveRepoName}/pulls?state=closed&per_page=50`,
            { headers }
          ).catch(() => ({ data: [] }));

          githubMetrics.commits = commitsRes.data;
          githubMetrics.prs = prsRes.data.filter(pr => new Date(pr.closed_at) >= sevenDaysAgo);

          const mergedPrs = githubMetrics.prs.filter(pr => pr.merged_at);
          if (mergedPrs.length > 0) {
            const totalTurnaround = mergedPrs.reduce((sum, pr) => {
              const created = new Date(pr.created_at);
              const merged = new Date(pr.merged_at);
              return sum + (merged - created);
            }, 0);
            githubMetrics.avgTurnaround = (totalTurnaround / mergedPrs.length / (1000 * 60 * 60)).toFixed(1);
          }

          const collabsRes = await axios.get(
            `https://api.github.com/repos/${effectiveRepoOwner}/${effectiveRepoName}/collaborators?per_page=100`,
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

    const userMember = workspace.members.find(m => m.userId?._id?.toString() === userId.toString());
    const isPM = userMember?.role === 'pm';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = dayNames[d.getDay()];
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const dailyTasksCount = await Issue.countDocuments({
        workspaceId,
        status: 'done',
        updatedAt: { $gte: dayStart, $lte: dayEnd }
      });

      const dailyCommits = githubMetrics.commits.filter(c => {
        const cDate = new Date(c.commit.author.date);
        return cDate >= dayStart && cDate <= dayEnd;
      }).length;

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
        quality: 100 - (bugRatio / (validMembers.length || 1)), 
        collaboration: Math.floor(Math.random() * 20) + 80 
      };

      if (isMe) myPerf = perfObj;
      return perfObj;
    });

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

    if (!isPM) {
        response.teamPerf = teamPerf.map(m => {
            const isMe = m.member === (myPerf?.member);
            if (isMe) return m;
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

/**
 * GET /api/performance/user/:userId?workspaceId=ID
 * Returns deep per-collaborator performance analytics.
 */
exports.getCollaboratorPerformance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { workspaceId, repoOwner, repoName } = req.query;

    const workspace = await Workspace.findOne({ _id: workspaceId, 'members.userId': req.user._id })
      .populate('members.userId', 'fullName email avatarUrl');
    if (!workspace) return res.status(404).json({ message: 'Workspace not found or access denied' });

    const effectiveOwner = repoOwner || workspace.githubConfig?.repoOwner;
    const effectiveRepo = repoName || workspace.githubConfig?.repoName;

    const identity = await UserIdentity.findOne({ userId, provider: 'github' });
    const githubUsername = identity?.username || null;

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let githubAnalysis = {
      codeImpactScore: 0, linesAdded: 0, linesDeleted: 0,
      totalCommits: 0, prLeadTime: '0h', prLeadTimeHours: 0,
      openPRs: 0, mergedPRs: 0, languageDistribution: [],
      commitHeatmap: [], recentCommits: [], commitFrequency: [],
    };

    if (effectiveOwner && effectiveRepo && identity?.accessTokenEncrypted) {
      try {
        const token = decrypt(identity.accessTokenEncrypted);
        const headers = { 
          Authorization: `Bearer ${token}`, 
          Accept: 'application/vnd.github+json',
          'User-Agent': 'NebulaFlow-App'
        };
        const base = `https://api.github.com/repos/${effectiveOwner}/${effectiveRepo}`;

        const [commitsRes, prsOpenRes, prsClosedRes, languagesRes, statsRes] = await Promise.all([
          axios.get(`${base}/commits?author=${githubUsername}&per_page=100&since=${thirtyDaysAgo.toISOString()}`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${base}/pulls?state=open&per_page=100`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${base}/pulls?state=closed&per_page=100`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${base}/languages`, { headers }).catch(() => ({ data: {} })),
          axios.get(`${base}/stats/contributors`, { headers }).catch(() => ({ data: [] })),
        ]);

        const myCommits = commitsRes.data || [];
        githubAnalysis.totalCommits = myCommits.length;

        const statsData = Array.isArray(statsRes.data) ? statsRes.data : [];
        const myStats = statsData.find(s => s.author?.login?.toLowerCase() === githubUsername?.toLowerCase());
        if (myStats && myStats.weeks) {
          const recentWeeks = myStats.weeks.slice(-4);
          let totalAdded = 0, totalDeleted = 0;
          recentWeeks.forEach(w => { totalAdded += w.a || 0; totalDeleted += w.d || 0; });
          githubAnalysis.linesAdded = totalAdded;
          githubAnalysis.linesDeleted = totalDeleted;
          githubAnalysis.codeImpactScore = Math.round((totalAdded * 1.0 + totalDeleted * 0.5 + myCommits.length * 10) / Math.max(1, myCommits.length));
        } else {
          githubAnalysis.codeImpactScore = myCommits.length * 15;
        }

        const myMergedPRs = (prsClosedRes.data || []).filter(pr => pr.merged_at && pr.user?.login?.toLowerCase() === githubUsername?.toLowerCase());
        githubAnalysis.mergedPRs = myMergedPRs.length;
        const myOpenPRs = (prsOpenRes.data || []).filter(pr => pr.user?.login?.toLowerCase() === githubUsername?.toLowerCase());
        githubAnalysis.openPRs = myOpenPRs.length;

        if (myMergedPRs.length > 0) {
          const totalHours = myMergedPRs.reduce((sum, pr) => sum + (new Date(pr.merged_at) - new Date(pr.created_at)) / (1000 * 60 * 60), 0);
          const avgHours = totalHours / myMergedPRs.length;
          githubAnalysis.prLeadTimeHours = parseFloat(avgHours.toFixed(1));
          githubAnalysis.prLeadTime = avgHours < 24 ? `${avgHours.toFixed(1)}h` : `${(avgHours / 24).toFixed(1)}d`;
        }

        const langData = languagesRes.data || {};
        const totalBytes = Object.values(langData).reduce((s, v) => s + v, 0);
        const LANG_COLORS = { JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5', CSS: '#563d7c', HTML: '#e34c26' };
        githubAnalysis.languageDistribution = Object.entries(langData).map(([name, bytes]) => ({
            name, value: totalBytes ? Math.round((bytes / totalBytes) * 100) : 0, color: LANG_COLORS[name] || '#8884d8',
        })).sort((a, b) => b.value - a.value);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const heatmap = [0, 0, 0, 0, 0, 0, 0];
        myCommits.forEach(c => { const d = new Date(c.commit?.author?.date); if (!isNaN(d.getTime())) heatmap[d.getDay()]++; });
        githubAnalysis.commitHeatmap = dayNames.map((day, i) => ({ day, commits: heatmap[i] }));

        const dayBuckets = {};
        for (let i = 14; i >= 0; i--) {
          const d = new Date(now); d.setDate(d.getDate() - i);
          const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dayBuckets[label] = 0;
        }
        myCommits.forEach(c => {
          const d = new Date(c.commit?.author?.date);
          const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (dayBuckets[label] !== undefined) dayBuckets[label]++;
        });
        githubAnalysis.commitFrequency = Object.entries(dayBuckets).map(([date, count]) => ({ date, count }));
      } catch (err) { console.warn('[CollaboratorPerformance] GitHub API failed:', err.message); }
    }

    const allIssues = await Issue.find({ workspaceId: new mongoose.Types.ObjectId(workspaceId) })
      .populate('assigneeUserId reporterUserId');
    const myIssues = allIssues.filter(i => (i.assigneeUserId?._id || i.assigneeUserId)?.toString() === userId.toString());

    const myDone7d = myIssues.filter(i => i.status === 'done' && i.updatedAt && new Date(i.updatedAt) >= sevenDaysAgo);
    const myVelocity = myDone7d.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
    const teamDone7d = allIssues.filter(i => i.status === 'done' && i.updatedAt && new Date(i.updatedAt) >= sevenDaysAgo);
    const uniqueAssignees = new Set(teamDone7d.map(i => (i.assigneeUserId?._id || i.assigneeUserId)?.toString()).filter(Boolean));
    const teamAvgVelocity = uniqueAssignees.size > 0 ? Math.round(teamDone7d.reduce((sum, i) => sum + (i.storyPoints || 0), 0) / uniqueAssignees.size) : 0;

    const myCompletedTasks = myIssues.filter(i => i.status === 'done' && i.createdAt && i.updatedAt);
    let avgCycleTimeHours = 0;
    if (myCompletedTasks.length > 0) {
      avgCycleTimeHours = parseFloat((myCompletedTasks.reduce((s, i) => s + (new Date(i.updatedAt) - new Date(i.createdAt)), 0) / myCompletedTasks.length / (1000 * 60 * 60)).toFixed(1));
    }

    const stuckTasks = myIssues.filter(i => ['in-progress', 'review'].includes(i.status) && (now - new Date(i.updatedAt)) / (1000 * 60 * 60 * 24) > 3);

    const jiraAnalysis = {
      sprintVelocity: myVelocity, teamAvgVelocity, velocityDelta: myVelocity - teamAvgVelocity,
      cycleTime: avgCycleTimeHours,
      bugCount: myIssues.filter(i => i.type === 'bug').length,
      featureCount: myIssues.filter(i => i.type !== 'bug').length,
      stuckTasks: stuckTasks.length,
      stuckTasksList: stuckTasks.slice(0, 5).map(t => ({ issueKey: t.issueKey, title: t.title, daysStuck: Math.round((now - new Date(t.updatedAt)) / (1000 * 60 * 60 * 24)) })),
      completedStoryPoints: myIssues.filter(i => i.status === 'done').reduce((s, i) => s + (i.storyPoints || 0), 0)
    };

    let slackAnalysis = { totalMessages: 0, technicalAssistanceScore: 0 };
    try {
      const msgCount = await Message.countDocuments({ workspaceId: new mongoose.Types.ObjectId(workspaceId), sender: userId, createdAt: { $gte: thirtyDaysAgo } });
      const recentMessages = await Message.find({ workspaceId: new mongoose.Types.ObjectId(workspaceId), sender: userId, createdAt: { $gte: sevenDaysAgo } }).limit(100);
      slackAnalysis.totalMessages = msgCount;
      const techKeywords = ['fix', 'bug', 'error', 'deploy', 'api', 'code', 'pr', 'fix'];
      const techCount = recentMessages.filter(m => techKeywords.some(kw => (m.content || '').toLowerCase().includes(kw))).length;
      slackAnalysis.technicalAssistanceScore = recentMessages.length > 0 ? Math.round((techCount / recentMessages.length) * 100) : 0;
    } catch (e) {}

    const userMember = workspace.members.find(m => (m.userId?._id || m.userId)?.toString() === userId.toString());
    const userName = userMember?.userId?.fullName || 'Collaborator';
    
    const persona = {
      summary: `${userName} is a ${githubAnalysis.totalCommits > 20 ? 'High-Impact' : 'Steady'} contributor. They maintain a ${githubAnalysis.prLeadTimeHours < 24 ? 'fast' : 'moderate'} PR turnaround and focus on ${githubAnalysis.languageDistribution[0]?.name || 'development'}.`,
      tags: [githubAnalysis.totalCommits > 15 ? 'High Impact' : 'Steady', 'Fast Reviewer'],
    };

    return res.json({ github: githubAnalysis, jira: jiraAnalysis, slack: slackAnalysis, persona, userName });
  } catch (err) {
    console.error('[getCollaboratorPerformance Error]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

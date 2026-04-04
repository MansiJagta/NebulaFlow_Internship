const User = require('./models/User');
const Sprint = require('./models/Sprint');
const Issue = require('./models/Issue');
const Workspace = require('./models/Workspace');
const Milestone = require('./models/Milestone');
const Meeting = require('./models/Meeting');

async function seedDefaultData() {
  try {
    // DO NOT SEED USERS according to user instructions.
    // Fetch the first workspace available (created by user post-signup).
    const workspace = await Workspace.findOne().populate('members.userId');
    
    if (!workspace) {
      console.log('[seed] No workspace found. Please create a workspace in the UI before seeding.');
      return;
    }

    const members = workspace.members.map(m => m.userId);
    const pmUser = workspace.members.find(m => m.role === 'pm')?.userId || members[0];

    if (members.length === 0) {
      console.log('[seed] Workspace has no members to assign data to.');
      return;
    }

    // 1. CLEAR EXISTING DEMO DATA for this workspace
    console.log(`[seed] Clearing existing Issues, Milestones, and Meetings for Workspace: ${workspace.name}`);
    await Issue.deleteMany({ workspaceId: workspace._id });
    await Milestone.deleteMany({ workspaceId: workspace._id });
    await Meeting.deleteMany({ workspaceId: workspace._id });

    // 2. SEED SPRINT
    let sprint = await Sprint.findOne({ isActive: true });
    if (!sprint) {
      const sprintStart = new Date();
      sprintStart.setHours(0, 0, 0, 0);
      const sprintEnd = new Date(sprintStart);
      sprintEnd.setDate(sprintEnd.getDate() + 14);

      sprint = await Sprint.create({
        name: 'Sprint 14',
        startsOn: sprintStart,
        endsOn: sprintEnd,
        goal: 'Deliver MVP features based on user testing',
        isActive: true,
      });
      console.log('[seed] Created active Sprint 14.');
    }

    // Helpers
    const randMember = () => members[Math.floor(Math.random() * members.length)];
    const now = new Date();
    const day = (offset) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offset);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    // 3. SEED MILESTONES
    const milestones = await Milestone.insertMany([
      { workspaceId: workspace._id, name: 'Core Architecture', expectedStartDate: day(-10), expectedEndDate: day(10) },
      { workspaceId: workspace._id, name: 'API Integrations', expectedStartDate: day(-2), expectedEndDate: day(12) },
      { workspaceId: workspace._id, name: 'Testing & QA', expectedStartDate: day(5), expectedEndDate: day(20) },
    ]);
    console.log('[seed] Seeded Milestones.');

    // 4. SEED MEETINGS
    await Meeting.insertMany([
      {
        workspaceId: workspace._id,
        title: 'Weekly Sync',
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        organizerId: pmUser._id,
        attendees: members.map(m => m._id),
      },
      {
        workspaceId: workspace._id,
        title: 'Architecture Review',
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
        endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000),
        organizerId: randMember()._id,
        attendees: members.map(m => m._id),
      },
      {
        workspaceId: workspace._id,
        title: 'Client Demo prep',
        startTime: day(3),
        endTime: new Date(day(3).getTime() + 2 * 60 * 60 * 1000),
        organizerId: pmUser._id,
        attendees: members.slice(0, 2).map(m => m._id),
      }
    ]);
    console.log('[seed] Seeded Meetings.');

    // Get the next issue number from existing issues
    const maxIssue = await Issue.findOne({}, {}, { sort: { 'issueKey': -1 } });
    let nextIssueNum = 101;
    if (maxIssue && maxIssue.issueKey) {
      const match = maxIssue.issueKey.match(/NEB-(\d+)/);
      if (match) {
        nextIssueNum = parseInt(match[1]) + 1;
      }
    }

    const issuesData = [
      {
        workspaceId: workspace._id,
        sprintId: sprint._id,
        issueKey: `NEB-${nextIssueNum++}`,
        title: 'Setup GitHub Actions CI/CD',
        status: 'done',
        priority: 1,
        type: 'task',
        storyPoints: 5,
        dueDate: day(-1),
      },
      {
        workspaceId: workspace._id,
        sprintId: sprint._id,
        issueKey: `NEB-${nextIssueNum++}`,
        title: 'Design database schema for chat module',
        status: 'in-progress',
        priority: 1,
        type: 'story',
        storyPoints: 8,
        dueDate: day(2),
      },
      {
        workspaceId: workspace._id,
        sprintId: sprint._id,
        issueKey: `NEB-${nextIssueNum++}`,
        title: 'Fix responsive layout on PM dashboard',
        status: 'todo',
        priority: 2,
        type: 'bug',
        storyPoints: 3,
        dueDate: day(4),
      },
      {
        workspaceId: workspace._id,
        sprintId: sprint._id,
        issueKey: `NEB-${nextIssueNum++}`,
        title: 'Implement Calendar View replacing Gantt',
        status: 'review',
        priority: 1,
        type: 'story',
        storyPoints: 13,
        dueDate: day(1),
        githubPrUrl: 'https://github.com/Nebula/Flow/pull/42'
      },
      {
        workspaceId: workspace._id,
        sprintId: null, // Backlog
        issueKey: `NEB-${nextIssueNum++}`,
        title: 'Write API Documentation',
        status: 'backlog',
        priority: 3,
        type: 'task',
        storyPoints: 5,
        dueDate: day(15),
      },
    ];

    for (const data of issuesData) {
      await Issue.create({
        ...data,
        assigneeUserId: randMember()._id,
        reporterUserId: pmUser._id,
      });
    }
    console.log('[seed] Seeded Issues.');
    console.log('✅ Seed complete. Prototype ready.');

  } catch (err) {
    console.error('[seed] Failed to seed default data', err);
  }
}

module.exports = {
  seedDefaultData,
};

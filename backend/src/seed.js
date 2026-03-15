const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Sprint = require('./models/Sprint');
const Issue = require('./models/Issue');

async function seedDefaultData() {
  try {
    const defaultPasswordHash = await bcrypt.hash('password', 10);

    const findOrCreateUser = async ({ email, fullName, role }) => {
      let user = await User.findOne({ email });
      if (user) {
        // Ensure users can login via email/password for demo purposes.
        if (!user.passwordHash) {
          user.passwordHash = defaultPasswordHash;
          await user.save();
        }
        return user;
      }

      return User.create({
        email,
        fullName,
        role,
        isActive: true,
        lastSeenAt: new Date(),
        passwordHash: defaultPasswordHash,
      });
    };

    const pm = await findOrCreateUser({
      email: 'pm@example.com',
      fullName: 'Project Manager',
      role: 'pm',
    });

    const alice = await findOrCreateUser({
      email: 'alice@example.com',
      fullName: 'Alice Chen',
      role: 'collaborator',
    });

    const bob = await findOrCreateUser({
      email: 'bob@example.com',
      fullName: 'Bob Kumar',
      role: 'collaborator',
    });

    const carol = await findOrCreateUser({
      email: 'carol@example.com',
      fullName: 'Carol Davis',
      role: 'collaborator',
    });

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
        goal: 'Deliver early MVP features and stabilize core workflows',
        isActive: true,
      });
    }

    const createIssue = async ({ key, title, status, priority, assignee, type, points, sprintId, reporter, description }) => {
      const existing = await Issue.findOne({ issueKey: key });
      if (existing) return existing;
      return Issue.create({
        issueKey: key,
        title,
        description,
        status,
        priority,
        type,
        storyPoints: points,
        assigneeUserId: assignee?._id ?? null,
        reporterUserId: reporter?._id ?? pm._id,
        sprintId,
      });
    };

    const issuesToEnsure = [
      {
        key: 'NEB-101',
        title: 'Implement user authentication flow',
        status: 'done',
        priority: 1,
        assignee: alice,
        type: 'story',
        points: 8,
        sprintId: sprint._id,
        reporter: pm,
        description: 'Implement signup/login flow including email verification and password reset.',
      },
      {
        key: 'NEB-102',
        title: 'Design dashboard KPI components',
        status: 'in-progress',
        priority: 1,
        assignee: bob,
        type: 'task',
        points: 5,
        sprintId: sprint._id,
        reporter: pm,
        description: 'Create reusable KPI cards for key metrics like velocity, open issues, and PRs.',
      },
      {
        key: 'NEB-103',
        title: 'Fix responsive sidebar collapse',
        status: 'in-progress',
        priority: 2,
        assignee: carol,
        type: 'bug',
        points: 3,
        sprintId: sprint._id,
        reporter: pm,
        description: 'Fix layout issues where the sidebar overlaps content on smaller screens.',
      },
      {
        key: 'NEB-104',
        title: 'Add real-time notifications',
        status: 'todo',
        priority: 2,
        assignee: bob,
        type: 'story',
        points: 13,
        sprintId: sprint._id,
        reporter: pm,
        description: 'Add a notification center for mentions, assignments, and sprint updates.',
      },
      {
        key: 'NEB-105',
        title: 'Performance optimization audit',
        status: 'backlog',
        priority: 3,
        assignee: alice,
        type: 'task',
        points: 8,
        sprintId: null,
        reporter: pm,
        description: 'Audit front-end performance and recommend improvements for faster load times.',
      },
      {
        key: 'NEB-106',
        title: 'Write API documentation',
        status: 'backlog',
        priority: 3,
        assignee: alice,
        type: 'task',
        points: 5,
        sprintId: null,
        reporter: pm,
        description: 'Document public API endpoints and request/response models for external developers.',
      },
      {
        key: 'NEB-107',
        title: 'Implement drag-and-drop kanban',
        status: 'review',
        priority: 1,
        assignee: bob,
        type: 'story',
        points: 8,
        sprintId: sprint._id,
        reporter: pm,
        description: 'Add drag and drop support to the kanban board with persistence in the backend.',
      },
      {
        key: 'NEB-108',
        title: 'Fix dark mode color contrast',
        status: 'done',
        priority: 2,
        assignee: carol,
        type: 'bug',
        points: 2,
        sprintId: null,
        reporter: pm,
        description: 'Improve accessibility by correcting contrast issues in dark theme.',
      },
      {
        key: 'NEB-109',
        title: 'Set up CI/CD pipeline',
        status: 'done',
        priority: 1,
        assignee: bob,
        type: 'task',
        points: 5,
        sprintId: null,
        reporter: pm,
        description: 'Configure GitHub Actions for CI and automated deployments to staging.',
      },
      {
        key: 'NEB-110',
        title: 'Create onboarding tutorial',
        status: 'review',
        priority: 2,
        assignee: alice,
        type: 'story',
        points: 8,
        sprintId: sprint._id,
        reporter: pm,
        description: 'Build an in-app interactive onboarding tutorial for new users.',
      },
    ];

    for (const issue of issuesToEnsure) {
      await createIssue(issue);
    }

    console.log('[seed] Default users and issues ensured.');
  } catch (err) {
    console.error('[seed] Failed to seed default data', err);
  }
}

module.exports = {
  seedDefaultData,
};

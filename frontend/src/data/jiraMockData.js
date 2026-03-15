const LOCAL_STORAGE_KEY = 'nebula-jira-tickets';

const defaultTickets = [
    {
        id: 'NEB-101',
        title: 'Implement user authentication flow',
        status: 'done',
        priority: 'high',
        assignee: 'Alice Chen',
        type: 'story',
        points: 8,
        sprint: 'Sprint 14',
        reporter: 'Product Team',
        createdAt: '2025-10-01',
        dueDate: '2025-10-10',
        description: 'Implement signup/login flow including email verification and password reset.',
    },
    {
        id: 'NEB-102',
        title: 'Design dashboard KPI components',
        status: 'in-progress',
        priority: 'high',
        assignee: 'Bob Kumar',
        type: 'task',
        points: 5,
        sprint: 'Sprint 14',
        reporter: 'Product Team',
        createdAt: '2025-10-03',
        dueDate: '2025-10-12',
        description: 'Create reusable KPI cards for key metrics like velocity, open issues, and PRs.',
    },
    {
        id: 'NEB-103',
        title: 'Fix responsive sidebar collapse',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'Carol Davis',
        type: 'bug',
        points: 3,
        sprint: 'Sprint 14',
        reporter: 'QA Team',
        createdAt: '2025-10-04',
        dueDate: '2025-10-13',
        description: 'Fix layout issues where the sidebar overlaps content on smaller screens.',
    },
    {
        id: 'NEB-104',
        title: 'Add real-time notifications',
        status: 'todo',
        priority: 'medium',
        assignee: 'Dave Wilson',
        type: 'story',
        points: 13,
        sprint: 'Sprint 14',
        reporter: 'Product Team',
        createdAt: '2025-10-05',
        dueDate: '2025-10-15',
        description: 'Add a notification center for mentions, assignments, and sprint updates.',
    },
    {
        id: 'NEB-105',
        title: 'Performance optimization audit',
        status: 'backlog',
        priority: 'low',
        assignee: 'Eve Martinez',
        type: 'task',
        points: 8,
        sprint: 'Backlog',
        reporter: 'Engineering Lead',
        createdAt: '2025-10-06',
        dueDate: '2025-10-25',
        description: 'Audit front-end performance and recommend improvements for faster load times.',
    },
    {
        id: 'NEB-106',
        title: 'Write API documentation',
        status: 'backlog',
        priority: 'low',
        assignee: 'Alice Chen',
        type: 'task',
        points: 5,
        sprint: 'Backlog',
        reporter: 'Documentation Team',
        createdAt: '2025-10-07',
        dueDate: '2025-10-22',
        description: 'Document public API endpoints and request/response models for external developers.',
    },
    {
        id: 'NEB-107',
        title: 'Implement drag-and-drop kanban',
        status: 'review',
        priority: 'high',
        assignee: 'Bob Kumar',
        type: 'story',
        points: 8,
        sprint: 'Sprint 14',
        reporter: 'Product Team',
        createdAt: '2025-10-02',
        dueDate: '2025-10-11',
        description: 'Add drag and drop support to the kanban board with persistence in the backend.',
    },
    {
        id: 'NEB-108',
        title: 'Fix dark mode color contrast',
        status: 'done',
        priority: 'medium',
        assignee: 'Carol Davis',
        type: 'bug',
        points: 2,
        sprint: 'Sprint 13',
        reporter: 'UX Team',
        createdAt: '2025-09-22',
        dueDate: '2025-10-01',
        description: 'Improve accessibility by correcting contrast issues in dark theme.',
    },
    {
        id: 'NEB-109',
        title: 'Set up CI/CD pipeline',
        status: 'done',
        priority: 'high',
        assignee: 'Dave Wilson',
        type: 'task',
        points: 5,
        sprint: 'Sprint 13',
        reporter: 'DevOps Team',
        createdAt: '2025-09-20',
        dueDate: '2025-09-30',
        description: 'Configure GitHub Actions for CI and automated deployments to staging.',
    },
    {
        id: 'NEB-110',
        title: 'Create onboarding tutorial',
        status: 'review',
        priority: 'medium',
        assignee: 'Eve Martinez',
        type: 'story',
        points: 8,
        sprint: 'Sprint 14',
        reporter: 'Product Team',
        createdAt: '2025-10-01',
        dueDate: '2025-10-14',
        description: 'Build an in-app interactive onboarding tutorial for new users.',
    },
];

export const SPRINT_DURATION_DAYS = 15;

export const getJiraTickets = () => {
    if (typeof window === 'undefined') return defaultTickets;
    try {
        const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!stored) return defaultTickets;
        return JSON.parse(stored);
    } catch {
        return defaultTickets;
    }
};

export const setJiraTickets = (tickets) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tickets));
    } catch {
        // ignore
    }
};

export const resetJiraTickets = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
};

export const sprintStats = {
    totalPoints: 65,
    completedPoints: 35,
    velocity: 28,
    burndown: [
        { day: 'Mon', remaining: 65, ideal: 65 },
        { day: 'Tue', remaining: 58, ideal: 52 },
        { day: 'Wed', remaining: 50, ideal: 39 },
        { day: 'Thu', remaining: 42, ideal: 26 },
        { day: 'Fri', remaining: 35, ideal: 13 },
    ],
};

export const statusColumns = ['backlog', 'todo', 'in-progress', 'review', 'done'];

export const statusLabels = {
    'backlog': 'Backlog',
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'review': 'In Review',
    'done': 'Done',
};

export const priorityColors = {
    high: 'bg-accent/20 text-accent',
    medium: 'bg-primary/20 text-primary',
    low: 'bg-muted text-muted-foreground',
};

export const typeIcons = {
    story: '📖',
    task: '✅',
    bug: '🐛',
};

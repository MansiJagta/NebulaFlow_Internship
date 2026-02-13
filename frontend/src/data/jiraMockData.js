export const jiraTickets = [
    { id: 'NEB-101', title: 'Implement user authentication flow', status: 'done', priority: 'high', assignee: 'Alice Chen', type: 'story', points: 8, sprint: 'Sprint 14' },
    { id: 'NEB-102', title: 'Design dashboard KPI components', status: 'in-progress', priority: 'high', assignee: 'Bob Kumar', type: 'task', points: 5, sprint: 'Sprint 14' },
    { id: 'NEB-103', title: 'Fix responsive sidebar collapse', status: 'in-progress', priority: 'medium', assignee: 'Carol Davis', type: 'bug', points: 3, sprint: 'Sprint 14' },
    { id: 'NEB-104', title: 'Add real-time notifications', status: 'todo', priority: 'medium', assignee: 'Dave Wilson', type: 'story', points: 13, sprint: 'Sprint 14' },
    { id: 'NEB-105', title: 'Performance optimization audit', status: 'todo', priority: 'low', assignee: 'Eve Martinez', type: 'task', points: 8, sprint: 'Sprint 15' },
    { id: 'NEB-106', title: 'Write API documentation', status: 'todo', priority: 'low', assignee: 'Alice Chen', type: 'task', points: 5, sprint: 'Sprint 15' },
    { id: 'NEB-107', title: 'Implement drag-and-drop kanban', status: 'review', priority: 'high', assignee: 'Bob Kumar', type: 'story', points: 8, sprint: 'Sprint 14' },
    { id: 'NEB-108', title: 'Fix dark mode color contrast', status: 'done', priority: 'medium', assignee: 'Carol Davis', type: 'bug', points: 2, sprint: 'Sprint 13' },
    { id: 'NEB-109', title: 'Set up CI/CD pipeline', status: 'done', priority: 'high', assignee: 'Dave Wilson', type: 'task', points: 5, sprint: 'Sprint 13' },
    { id: 'NEB-110', title: 'Create onboarding tutorial', status: 'review', priority: 'medium', assignee: 'Eve Martinez', type: 'story', points: 8, sprint: 'Sprint 14' },
];

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

export const statusColumns = ['todo', 'in-progress', 'review', 'done'];

export const statusLabels = {
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

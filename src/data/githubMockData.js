export const githubRepos = [
    { name: 'nebula-frontend', language: 'TypeScript', stars: 128, forks: 34, issues: 12, prs: 5, lastCommit: '2h ago' },
    { name: 'nebula-api', language: 'Python', stars: 89, forks: 21, issues: 8, prs: 3, lastCommit: '5h ago' },
    { name: 'nebula-shared', language: 'TypeScript', stars: 45, forks: 12, issues: 3, prs: 1, lastCommit: '1d ago' },
];

export const recentCommits = [
    { hash: 'a1b2c3d', message: 'feat: implement real-time notifications', author: 'Alice Chen', time: '2h ago', branch: 'feature/notifications', additions: 120, deletions: 5 },
    { hash: 'e4f5g6h', message: 'fix: resolve sidebar z-index issue', author: 'Carol Davis', time: '3h ago', branch: 'fix/sidebar', additions: 12, deletions: 4 },
    { hash: 'i7j8k9l', message: 'refactor: optimize chart rendering', author: 'Bob Kumar', time: '5h ago', branch: 'perf/charts', additions: 45, deletions: 30 },
    { hash: 'm0n1o2p', message: 'docs: update API documentation', author: 'Dave Wilson', time: '8h ago', branch: 'docs/api', additions: 89, deletions: 0 },
    { hash: 'q3r4s5t', message: 'feat: add drag-and-drop kanban board', author: 'Eve Martinez', time: '1d ago', branch: 'feature/kanban', additions: 230, deletions: 15 },
];

export const pullRequests = [
    { id: 234, title: 'feat: Dashboard KPI components', author: 'Bob Kumar', status: 'open', reviews: 1, additions: 342, deletions: 28, created: '2h ago' },
    { id: 233, title: 'fix: Mobile responsive sidebar', author: 'Carol Davis', status: 'open', reviews: 2, additions: 156, deletions: 89, created: '5h ago' },
    { id: 232, title: 'feat: CI/CD pipeline setup', author: 'Dave Wilson', status: 'merged', reviews: 3, additions: 567, deletions: 12, created: '1d ago' },
    { id: 231, title: 'feat: Onboarding tutorial flow', author: 'Eve Martinez', status: 'open', reviews: 0, additions: 890, deletions: 45, created: '2d ago' },
];

export const commitFrequency = [
    { date: 'Jan 1', count: 12 }, { date: 'Jan 2', count: 18 }, { date: 'Jan 3', count: 5 }, { date: 'Jan 4', count: 24 }, { date: 'Jan 5', count: 18 },
    { date: 'Jan 6', count: 8 }, { date: 'Jan 7', count: 12 }, { date: 'Jan 8', count: 22 }, { date: 'Jan 9', count: 15 }, { date: 'Jan 10', count: 28 },
    { date: 'Jan 11', count: 14 }, { date: 'Jan 12', count: 10 }, { date: 'Jan 13', count: 6 }, { date: 'Jan 14', count: 19 }, { date: 'Jan 15', count: 25 },
];

export const languageBreakdown = [
    { name: 'TypeScript', value: 65, color: '#3178c6' },
    { name: 'Python', value: 25, color: '#3572A5' },
    { name: 'CSS', value: 8, color: '#563d7c' },
    { name: 'HTML', value: 2, color: '#e34c26' },
];

export const contributors = [
    { name: 'Alice Chen', commits: 145, additions: 12500, deletions: 4500, role: 'Lead Frontend' },
    { name: 'Bob Kumar', commits: 112, additions: 8900, deletions: 3200, role: 'Backend' },
    { name: 'Carol Davis', commits: 98, additions: 7200, deletions: 1800, role: 'UI/UX' },
    { name: 'Dave Wilson', commits: 85, additions: 6500, deletions: 1200, role: 'DevOps' },
    { name: 'Eve Martinez', commits: 76, additions: 5800, deletions: 2100, role: 'Frontend' },
];

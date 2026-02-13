export const slackChannels = [
    { id: 'general', name: 'general', unread: 3 },
    { id: 'dev', name: 'dev-team', unread: 7 },
    { id: 'design', name: 'design', unread: 0 },
    { id: 'standup', name: 'daily-standup', unread: 1 },
    { id: 'random', name: 'random', unread: 5 },
];

export const slackMessages = [
    { id: '1', user: 'Alice Chen', avatar: 'AC', message: 'Hey team! Sprint 14 planning starts in 10 minutes. Please review the backlog items.', time: '9:00 AM', channel: 'general', reactions: [{ emoji: '👍', count: 4 }] },
    { id: '2', user: 'Bob Kumar', avatar: 'BK', message: 'I pushed the new dashboard components. Can someone review PR #234?', time: '9:15 AM', channel: 'dev', reactions: [{ emoji: '👀', count: 2 }] },
    { id: '3', user: 'Carol Davis', avatar: 'CD', message: 'The sidebar collapse animation is looking smooth now. Fixed the jitter on mobile.', time: '9:30 AM', channel: 'dev' },
    { id: '4', user: 'Dave Wilson', avatar: 'DW', message: 'Standup update: Yesterday I finished the CI/CD pipeline setup. Today working on notification system.', time: '9:45 AM', channel: 'standup' },
    { id: '5', user: 'Eve Martinez', avatar: 'EM', message: 'New design mockups are ready for the onboarding flow! Check them in Figma.', time: '10:00 AM', channel: 'design', reactions: [{ emoji: '🎨', count: 3 }, { emoji: '🔥', count: 5 }] },
    { id: '6', user: 'Alice Chen', avatar: 'AC', message: 'Great work everyone! Sprint velocity is looking good this week.', time: '10:15 AM', channel: 'general', reactions: [{ emoji: '🚀', count: 6 }] },
    { id: '7', user: 'Bob Kumar', avatar: 'BK', message: 'Anyone else having issues with the test runner? Getting timeout errors.', time: '10:30 AM', channel: 'dev' },
    { id: '8', user: 'Carol Davis', avatar: 'CD', message: 'Check out this meme I found about our deployment process 😂', time: '11:00 AM', channel: 'random', reactions: [{ emoji: '😂', count: 8 }] },
];

export const directMessages = [
    { id: 'dm1', user: 'Alice Chen', avatar: 'AC', lastMessage: 'Can we discuss the sprint goals?', time: '2m ago', online: true },
    { id: 'dm2', user: 'Bob Kumar', avatar: 'BK', lastMessage: 'PR is ready for review', time: '15m ago', online: true },
    { id: 'dm3', user: 'Carol Davis', avatar: 'CD', lastMessage: 'Fixed the bug you mentioned', time: '1h ago', online: false },
    { id: 'dm4', user: 'Dave Wilson', avatar: 'DW', lastMessage: 'Let me know about the deployment', time: '3h ago', online: false },
];

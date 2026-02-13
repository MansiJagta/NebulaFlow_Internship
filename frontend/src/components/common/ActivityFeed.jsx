import { motion } from 'framer-motion';

const activities = [
    { id: '1', user: 'Alice', action: 'completed', target: 'NEB-101: Auth flow', time: '5m ago', type: 'task' },
    { id: '2', user: 'Bob', action: 'pushed to', target: 'feature/dashboard', time: '12m ago', type: 'commit' },
    { id: '3', user: 'Carol', action: 'fixed', target: 'NEB-103: Sidebar bug', time: '30m ago', type: 'task' },
    { id: '4', user: 'Dave', action: 'reviewed', target: 'PR #234', time: '1h ago', type: 'review' },
    { id: '5', user: 'Eve', action: 'sent message in', target: '#design', time: '2h ago', type: 'message' },
];

const typeColors = {
    commit: 'bg-primary/20 text-primary',
    task: 'bg-secondary/20 text-secondary',
    message: 'bg-accent/20 text-accent',
    review: 'bg-primary/20 text-primary',
};

const ActivityFeed = () => (
    <div className="nebula-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
            {activities.map((item, i) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3"
                >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${typeColors[item.type]}`}>
                        {item.user[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                            <span className="font-medium">{item.user}</span>{' '}
                            <span className="text-muted-foreground">{item.action}</span>{' '}
                            <span className="font-medium">{item.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

export default ActivityFeed;

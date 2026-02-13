import { motion } from 'framer-motion';

const COLORS = ['hsl(187 100% 50%)', 'hsl(257 100% 68%)', 'hsl(340 100% 65%)', 'hsl(160 80% 50%)'];

const GanttChart = ({ tasks, title, columns = ['Week 1', 'Week 2', 'Week 3', 'Week 4'] }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {title && <h4 className="text-sm font-medium text-foreground mb-4">{title}</h4>}
        <div className="space-y-1">
            {/* Header */}
            <div className="flex">
                <div className="w-32 shrink-0" />
                <div className="flex-1 flex">
                    {columns.map(col => (
                        <div key={col} className="flex-1 text-xs text-muted-foreground text-center pb-2 border-b border-border/20">
                            {col}
                        </div>
                    ))}
                </div>
            </div>
            {/* Tasks */}
            {tasks.map((task, i) => (
                <div key={task.id} className="flex items-center h-10">
                    <div className="w-32 shrink-0 text-xs text-muted-foreground truncate pr-3">{task.name}</div>
                    <div className="flex-1 relative h-7 bg-muted/10 rounded">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${task.duration}%` }}
                            transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                            className="absolute h-full rounded"
                            style={{
                                left: `${task.start}%`,
                                background: task.color || COLORS[i % COLORS.length],
                                opacity: 0.8,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);

export default GanttChart;

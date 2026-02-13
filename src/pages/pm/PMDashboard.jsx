import KpiCard from '@/components/common/KpiCard';
import ActivityFeed from '@/components/common/ActivityFeed';
import NebulaBarChart from '@/components/common/NebulaBarChart';
import MiniKanban from '@/components/pm/MiniKanban';
import QuickMessage from '@/components/pm/QuickMessage';
import { motion } from 'framer-motion';
import { ListChecks, GitBranch, Zap, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { sprintStats } from '@/data/jiraMockData';

// Mock data for commit activity
const commitData = [
    { day: 'Mon', commits: 12 },
    { day: 'Tue', commits: 18 },
    { day: 'Wed', commits: 8 },
    { day: 'Thu', commits: 24 },
    { day: 'Fri', commits: 16 },
    { day: 'Sat', commits: 4 },
    { day: 'Sun', commits: 2 },
];

const PMDashboard = () => {

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold nebula-gradient-text mb-1">Project Manager Dashboard</h1>
                <p className="text-muted-foreground text-sm">Overview of your team's progress & performance</p>
            </motion.div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Active Tasks" value={24} icon={<ListChecks className="w-5 h-5" />} trend={{ value: 12, positive: true }} delay={0} />
                <KpiCard title="Team Velocity" value={42} suffix="pts" icon={<Zap className="w-5 h-5" />} trend={{ value: 8, positive: true }} delay={0.1} />
                <KpiCard title="Open PRs" value={5} icon={<GitBranch className="w-5 h-5" />} trend={{ value: 3, positive: false }} delay={0.2} />
                <KpiCard title="Sprint Time" value={8} suffix="days" icon={<Clock className="w-5 h-5" />} delay={0.3} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Chart Area */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Burndown Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="nebula-card p-5"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Sprint Burndown</h3>
                                <p className="text-xs text-muted-foreground">Remaining effort vs ideal</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="w-2 h-2 rounded-full bg-nebula-cyan"></span>Remaining</span>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="w-2 h-2 rounded-full bg-nebula-purple/50"></span>Ideal</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={sprintStats.burndown}>
                                <defs>
                                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--nebula-cyan))" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="hsl(var(--nebula-cyan))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: 'hsl(234, 55%, 18%)', border: '1px solid hsl(257, 60%, 30%)', borderRadius: '8px', color: 'hsl(233, 60%, 92%)' }}
                                />
                                <Area type="monotone" dataKey="ideal" stroke="hsl(var(--nebula-purple))" strokeDasharray="5 5" fill="none" strokeWidth={2} />
                                <Area type="monotone" dataKey="remaining" stroke="hsl(var(--nebula-cyan))" fill="url(#burnGrad)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Active Sprint Board (Mini Kanban) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="nebula-card p-5 min-h-[400px]"
                    >
                        <h3 className="text-sm font-semibold text-foreground mb-4">Active Sprint Snapshot</h3>
                        <MiniKanban />
                    </motion.div>
                </div>

                {/* Sidebar/Feed Area */}
                <div className="space-y-6">
                    <NebulaBarChart
                        data={commitData}
                        dataKey="commits"
                        xKey="day"
                        title="Commit Activity"
                        height={200}
                        color="hsl(var(--nebula-pink))"
                    />

                    <ActivityFeed />

                    <QuickMessage />
                </div>
            </div>
        </div>
    );
};

export default PMDashboard;

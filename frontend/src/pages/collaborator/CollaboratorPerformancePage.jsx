import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Target } from 'lucide-react';

const prodData = [
    { date: 'Mon', score: 75 }, { date: 'Tue', score: 82 }, { date: 'Wed', score: 60 }, { date: 'Thu', score: 90 }, { date: 'Fri', score: 85 },
];

const weeklyComparison = [
    { name: 'Tasks', thisWeek: 12, lastWeek: 10 },
    { name: 'Commits', thisWeek: 15, lastWeek: 18 },
    { name: 'PRs', thisWeek: 3, lastWeek: 2 },
];

const effortData = [
    { name: 'Feature Dev', value: 60, color: 'hsl(187, 100%, 50%)' },
    { name: 'Bug Fixes', value: 25, color: 'hsl(340, 75%, 55%)' },
    { name: 'Refactoring', value: 15, color: 'hsl(257, 100%, 68%)' },
];

const CollaboratorPerformancePage = () => {
    const chartTooltipStyle = { background: 'hsl(234, 55%, 18%)', border: '1px solid hsl(257, 60%, 30%)', borderRadius: '8px', color: 'hsl(233, 60%, 92%)' };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold nebula-gradient-text">My Performance</h1>
                <p className="text-muted-foreground text-sm">Self-reflection & productivity insights</p>
            </motion.div>

            {/* Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="nebula-card p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Velocity Trend</p>
                        <p className="text-xl font-bold text-foreground">+15% <span className="text-xs font-normal text-muted-foreground">vs last week</span></p>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="nebula-card p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Goals Met</p>
                        <p className="text-xl font-bold text-foreground">5 <span className="text-xs font-normal text-muted-foreground">/ 6 assigned</span></p>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="nebula-card p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Top Skill</p>
                        <p className="text-xl font-bold text-foreground">React <span className="text-xs font-normal text-muted-foreground">High quality</span></p>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Productivity Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Daily Productivity Score</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={prodData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Area type="monotone" dataKey="score" stroke="hsl(187, 100%, 50%)" fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Weekly Comparison */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Week over Week</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={weeklyComparison}>
                            <XAxis dataKey="name" stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Bar name="This Week" dataKey="thisWeek" fill="hsl(187, 100%, 50%)" radius={[4, 4, 0, 0]} />
                            <Bar name="Last Week" dataKey="lastWeek" fill="hsl(233, 20%, 35%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Effort Distribution */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="nebula-card p-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-2">Code Effort Distribution</h3>
                        <p className="text-sm text-muted-foreground mb-4">Breakdown of where your coding time went this week.</p>
                        <div className="space-y-3">
                            {effortData.map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-foreground flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} /> {item.name}
                                        </span>
                                        <span className="font-mono">{item.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.value}%` }}
                                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-[200px] h-[200px] flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={effortData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                                    {effortData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CollaboratorPerformancePage;

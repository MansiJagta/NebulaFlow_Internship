import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const weeklyData = [
    { day: 'Mon', tasks: 12, commits: 15, prs: 3 },
    { day: 'Tue', tasks: 18, commits: 22, prs: 5 },
    { day: 'Wed', tasks: 15, commits: 10, prs: 2 },
    { day: 'Thu', tasks: 22, commits: 28, prs: 6 },
    { day: 'Fri', tasks: 16, commits: 18, prs: 4 },
];

const teamPerf = [
    { member: 'Alice', velocity: 32, quality: 95, collaboration: 88, role: 'Lead Frontend', avatar: 'A', trend: '+12%' },
    { member: 'Bob', velocity: 28, quality: 90, collaboration: 92, role: 'Backend Dev', avatar: 'B', trend: '+5%' },
    { member: 'Carol', velocity: 25, quality: 98, collaboration: 85, role: 'UI/UX Designer', avatar: 'C', trend: '+8%' },
    { member: 'Dave', velocity: 30, quality: 88, collaboration: 90, role: 'DevOps', avatar: 'D', trend: '-2%' },
    { member: 'Eve', velocity: 22, quality: 92, collaboration: 95, role: 'Frontend Dev', avatar: 'E', trend: '+15%' },
];

const ticketStatus = [
    { name: 'To Do', value: 15, color: 'hsl(var(--muted-foreground))' },
    { name: 'In Progress', value: 25, color: 'hsl(187, 100%, 50%)' },
    { name: 'Review', value: 10, color: 'hsl(257, 100%, 68%)' },
    { name: 'Done', value: 35, color: 'hsl(142, 71%, 45%)' },
];

const codeContribution = [
    { name: 'New Features', value: 55, color: 'hsl(187, 100%, 50%)' },
    { name: 'Refactoring', value: 25, color: 'hsl(257, 100%, 68%)' },
    { name: 'Bug Fixes', value: 20, color: 'hsl(340, 75%, 55%)' },
];

const radarData = [
    { skill: 'Speed', value: 85 },
    { skill: 'Quality', value: 92 },
    { skill: 'Collab', value: 88 },
    { skill: 'Innovation', value: 78 },
    { skill: 'Delivery', value: 90 },
];

const chartTooltipStyle = { background: 'hsl(234, 55%, 18%)', border: '1px solid hsl(257, 60%, 30%)', borderRadius: '8px', color: 'hsl(233, 60%, 92%)' };

const PerformancePage = () => (
    <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-2xl font-bold nebula-gradient-text">Team Performance</h1>
            <p className="text-muted-foreground text-sm">Productivity analytics & developer insights</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Productivity Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 nebula-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Productivity</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyData}>
                        <XAxis dataKey="day" stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        <Bar name="Tasks Completed" dataKey="tasks" fill="hsl(187, 100%, 50%)" radius={[4, 4, 0, 0]} />
                        <Bar name="Commits Pushed" dataKey="commits" fill="hsl(257, 100%, 68%)" radius={[4, 4, 0, 0]} />
                        <Bar name="PRs Merged" dataKey="prs" fill="hsl(340, 75%, 55%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Team Radar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="nebula-card p-5 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-foreground mb-2 w-full">Team Skills Radar</h3>
                <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="hsl(257, 40%, 25%)" />
                            <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(233, 30%, 55%)', fontSize: 11 }} />
                            <Radar dataKey="value" stroke="hsl(187, 100%, 50%)" fill="hsl(187, 100%, 50%)" fillOpacity={0.2} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ticket Status Donut */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="nebula-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Ticket Distribution</h3>
                <div className="flex items-center">
                    <ResponsiveContainer width={150} height={150}>
                        <PieChart>
                            <Pie data={ticketStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                                {ticketStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={chartTooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                        {ticketStatus.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    <span className="text-muted-foreground">{item.name}</span>
                                </div>
                                <span className="font-bold text-foreground">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Code Contribution Donut */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="nebula-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Code Effort Distribution</h3>
                <div className="flex items-center">
                    <ResponsiveContainer width={150} height={150}>
                        <PieChart>
                            <Pie data={codeContribution} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                                {codeContribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={chartTooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                        {codeContribution.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    <span className="text-muted-foreground">{item.name}</span>
                                </div>
                                <span className="font-bold text-foreground">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Top Performers Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="text-lg font-bold text-foreground mb-4">Top Performers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {teamPerf.map((member, i) => (
                    <Card key={i} className="bg-card border-border/30 hover:border-primary/50 transition-all cursor-pointer group">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                            <div className="relative">
                                <Avatar className="w-16 h-16 border-2 border-background mb-3 group-hover:scale-105 transition-transform">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{member.avatar}</AvatarFallback>
                                </Avatar>
                                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0 bg-secondary text-secondary-foreground border-none">
                                    {member.velocity} pts
                                </Badge>
                            </div>
                            <h4 className="font-semibold text-foreground">{member.member}</h4>
                            <p className="text-xs text-muted-foreground mb-3">{member.role}</p>

                            <div className="w-full grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-muted/20 p-1.5 rounded">
                                    <span className="block text-muted-foreground/70 text-[9px]">Quality</span>
                                    <span className="font-bold text-accent">{member.quality}%</span>
                                </div>
                                <div className="bg-muted/20 p-1.5 rounded">
                                    <span className="block text-muted-foreground/70 text-[9px]">Collab</span>
                                    <span className="font-bold text-primary">{member.collaboration}%</span>
                                </div>
                            </div>

                            <div className={`mt-3 text-xs font-bold flex items-center gap-1 ${member.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                <TrendingUp className="w-3 h-3" /> {member.trend} <span className="text-muted-foreground font-normal">vs last week</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </motion.div>
    </div>
);

export default PerformancePage;

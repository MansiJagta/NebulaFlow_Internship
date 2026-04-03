import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import KpiCard from '@/components/common/KpiCard';
import ActivityFeed from '@/components/common/ActivityFeed';
import { ListChecks, Clock, GitBranch, Zap, Calendar, ArrowRight, Play } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const taskBreakdown = [
    { name: 'Completed', value: 12, color: 'hsl(187, 100%, 50%)' },
    { name: 'In Progress', value: 5, color: 'hsl(257, 100%, 68%)' },
    { name: 'To Do', value: 7, color: 'hsl(340, 100%, 65%)' },
];

const projects = [
    { name: 'Nebula Dashboard v2', role: 'Frontend Lead', status: 'In Progress', progress: 75, deadline: '2 days left' },
    { name: 'API Migration', role: 'Contributor', status: 'Review', progress: 90, deadline: 'Today' },
    { name: 'Mobile App MVP', role: 'Reviewer', status: 'Planning', progress: 15, deadline: 'Start next week' },
];

const schedule = [
    { time: '10:00 AM', title: 'Daily Standup', type: 'Zoom', duration: '15m' },
    { time: '02:00 PM', title: 'Design Review: Dashboard', type: 'Huddle', duration: '45m' },
    { time: '04:30 PM', title: 'Pair Programming w/ Bob', type: 'Code', duration: '1h' },
];

const now = new Date();

const CollaboratorDashboard = () => {
    const { token } = useAuth();
    const [meetings, setMeetings] = useState([]);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const res = await axios.get(`${process.env.VITE_API_URL || 'http://localhost:5000'}/api/meetings`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                });
                setMeetings(res.data || []);
            } catch (err) {
                console.error('[CollaboratorDashboard] fetchMeetings failed', err);
            }
        };

        fetchMeetings();
    }, [token]);

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold nebula-gradient-text mb-1">My Workspace</h1>
                <p className="text-muted-foreground text-sm">Welcome back, Alice!</p>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="My Tasks" value={7} icon={<ListChecks className="w-5 h-5" />} delay={0} />
                <KpiCard title="Hours Logged" value={32} suffix="h" icon={<Clock className="w-5 h-5" />} trend={{ value: 5, positive: true }} delay={0.1} />
                <KpiCard title="My PRs" value={3} icon={<GitBranch className="w-5 h-5" />} delay={0.2} />
                <KpiCard title="Story Points" value={21} suffix="pts" icon={<Zap className="w-5 h-5" />} trend={{ value: 15, positive: true }} delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Projects */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="nebula-card p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-foreground">Active Projects</h3>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary">View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
                        </div>
                        <div className="space-y-5">
                            {projects.map((p, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{p.name}</h4>
                                            <p className="text-xs text-muted-foreground">{p.role} • <span className={p.deadline === 'Today' ? 'text-yellow-500 font-bold' : ''}>{p.deadline}</span></p>
                                        </div>
                                        <span className="text-xs font-mono text-primary">{p.progress}%</span>
                                    </div>
                                    <Progress value={p.progress} className="h-2" indicatorClassName={
                                        p.progress >= 90 ? 'bg-green-500' : p.progress >= 50 ? 'bg-primary' : 'bg-muted-foreground'
                                    } />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Task Breadown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="nebula-card p-5"
                    >
                        <h3 className="text-sm font-semibold text-foreground mb-4">My Task Breakdown</h3>
                        <div className="flex items-center gap-8 justify-center sm:justify-start">
                            <ResponsiveContainer width={180} height={180}>
                                <PieChart>
                                    <Pie data={taskBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                        {taskBreakdown.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'hsl(234, 55%, 18%)', border: '1px solid hsl(257, 60%, 30%)', borderRadius: '8px', color: 'hsl(233, 60%, 92%)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3">
                                {taskBreakdown.map(item => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                                        <span className="text-sm text-foreground">{item.name}</span>
                                        <span className="text-sm font-bold text-foreground ml-auto">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-6">
                    {/* Schedule Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="nebula-card p-5 bg-gradient-to-b from-card to-background"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" /> Today's Schedule
                            </h3>
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Nov 14</Badge>
                        </div>
                        <div className="relative border-l-2 border-border/30 ml-2 space-y-6 pl-4 py-2">
                            {(meetings.length > 0 ? meetings : schedule).map((s, i) => (
                                <div key={s._id || i} className="relative">
                                    <span className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-background ${i === 0 ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`}></span>
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-mono mb-0.5 ${i === 0 ? 'text-green-500 font-bold' : 'text-muted-foreground'}`}>
                                            {s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : s.time}
                                        </span>
                                        <h4 className="text-sm font-medium text-foreground">{s.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="text-[9px] py-0 px-1.5 h-4">{s.type || 'Meeting'}</Badge>
                                            <span className="text-[10px] text-muted-foreground">
                                                {s.startTime && s.endTime ? `${new Date(s.startTime).toLocaleDateString()} • ${Math.round((new Date(s.endTime) - new Date(s.startTime)) / 60000)} min` : s.duration}
                                            </span>
                                        </div>
                                    </div>
                                    <Button size="sm" className="w-full mt-3 h-7 text-xs" variant="gradient" onClick={() => window.alert(`Joining meeting: ${s.title}`)}>
                                        <Play className="w-3 h-3 mr-1.5" /> Join Meeting
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
};

export default CollaboratorDashboard;

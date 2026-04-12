import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, 
    RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, 
    Cell, Legend 
} from 'recharts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle, Zap, Users, Loader2, Slack, Trello } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const chartTooltipStyle = { 
    background: 'hsl(234, 55%, 18%)', 
    border: '1px solid hsl(257, 60%, 30%)', 
    borderRadius: '8px', 
    color: 'hsl(233, 60%, 92%)' 
};

const PerformancePage = () => {
    const { API_BASE_URL } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [workspace, setWorkspace] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // 1. Get Workspace
                const wsRes = await axios.get(`${API_BASE_URL}/workspace/me`, { withCredentials: true });
                setWorkspace(wsRes.data);

                // 2. Get Performance Data
                const perfRes = await axios.get(`${API_BASE_URL}/performance/${wsRes.data._id}`, { withCredentials: true });
                setData(perfRes.data);
            } catch (err) {
                console.error('[Performance] Fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
        const interval = setInterval(fetchAll, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [API_BASE_URL]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">Correlating workspace and GitHub metrics...</p>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center bg-card rounded-xl border border-border/50">Failed to load performance metrics. Please ensure GitHub is connected.</div>;

    const ticketStatus = [
        { name: 'Bugs', value: parseFloat(data.bugRatio), color: 'hsl(340, 75%, 55%)' },
        { name: 'Other', value: 100 - parseFloat(data.bugRatio), color: 'hsl(187, 100%, 50%)' },
    ];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold nebula-gradient-text">Nebula Flow Analytics</h1>
                        <p className="text-muted-foreground text-sm">Deep insights for {workspace?.name || 'Project Manager'}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1">
                        Live Sync: Active
                    </Badge>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Productivity Chart (Stacked) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 nebula-card p-5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-semibold text-foreground">Weekly Correlation</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Tasks vs Code Activity</p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data.weeklyData}>
                            <XAxis dataKey="day" stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            <Bar name="Tasks Completed" dataKey="tasks" stackId="a" fill="hsl(187, 100%, 50%)" radius={[0, 0, 0, 0]} />
                            <Bar name="Commits Pushed" dataKey="commits" stackId="a" fill="hsl(257, 100%, 68%)" radius={[0, 0, 0, 0]} />
                            <Bar name="PRs Merged" dataKey="prs" stackId="a" fill="hsl(340, 75%, 55%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Bug Ratio / Quality Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="nebula-card p-5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">Risk & Quality</h3>
                        <div className="flex flex-col items-center justify-center p-4">
                            <ResponsiveContainer width="100%" height={120}>
                                <PieChart>
                                    <Pie data={ticketStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={4} dataKey="value">
                                        {ticketStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={chartTooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="text-center mt-2">
                                <span className="text-2xl font-black text-foreground">{data.bugRatio}%</span>
                                <p className="text-[10px] text-muted-foreground uppercase">Bug Ratio</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4">
                        <div className="flex items-center gap-2 text-red-500 text-xs font-bold mb-1">
                            <AlertCircle className="w-3 h-3" /> QA Insight
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                            {parseFloat(data.bugRatio) > 20 
                                ? "Critical: Bug frequency is high. Consider prioritising stability over speed." 
                                : "Healthy: Low bug ratio indicates high code quality."}
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team Skills Radar */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="nebula-card p-5 flex flex-col items-center">
                    <div className="flex justify-between w-full mb-4">
                        <h3 className="text-sm font-semibold text-foreground">Team Aggregate Radar</h3>
                        <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={[
                                { skill: 'Velocity', value: data.totalSprintPoints > 0 ? 85 : 40 },
                                { skill: 'Quality', value: 100 - parseFloat(data.bugRatio) },
                                { skill: 'PR Speed', value: data.avgPrTurnaround > 0 ? 92 : 30 },
                                { skill: 'Collab', value: data.teamPerf.length > 0 ? 80 : 0 },
                                { skill: 'Delivery', value: 90 },
                            ]}>
                                <PolarGrid stroke="hsl(257, 40%, 25%)" />
                                <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(233, 30%, 55%)', fontSize: 11 }} />
                                <Radar dataKey="value" stroke="hsl(187, 100%, 50%)" fill="hsl(187, 100%, 50%)" fillOpacity={0.2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Efficiency Insights */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4 font-mono uppercase tracking-tighter">Velocity Metrics</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/10 border border-border/20">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-2 rounded-md"><Zap className="w-4 h-4 text-primary" /></div>
                                <div>
                                    <p className="text-xs font-bold text-foreground">Sprint Velocity</p>
                                    <p className="text-[10px] text-muted-foreground">Rolling 7-day story points</p>
                                </div>
                            </div>
                            <span className="text-xl font-black text-primary">{data.totalSprintPoints} <span className="text-[10px] font-normal text-muted-foreground uppercase ml-1">pts</span></span>
                        </div>

                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/10 border border-border/20">
                            <div className="flex items-center gap-3">
                                <div className="bg-accent/20 p-2 rounded-md"><Users className="w-4 h-4 text-accent" /></div>
                                <div>
                                    <p className="text-xs font-bold text-foreground">PR Turnaround</p>
                                    <p className="text-[10px] text-muted-foreground">Average merge time</p>
                                </div>
                            </div>
                            <span className="text-xl font-black text-accent">{data.avgPrTurnaround} <span className="text-[10px] font-normal text-muted-foreground uppercase ml-1">hrs</span></span>
                        </div>

                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/10 border border-border/20">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-500/20 p-2 rounded-md"><Slack className="w-4 h-4 text-purple-400" /></div>
                                <div>
                                    <p className="text-xs font-bold text-foreground">Slack Activity</p>
                                    <p className="text-[10px] text-muted-foreground">Messages in 7 days</p>
                                </div>
                            </div>
                            <span className="text-xl font-black text-purple-400">{data.slackActivity || 0} <span className="text-[10px] font-normal text-muted-foreground uppercase ml-1">msgs</span></span>
                        </div>

                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/10 border border-border/20">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500/20 p-2 rounded-md"><Trello className="w-4 h-4 text-blue-500" /></div>
                                <div>
                                    <p className="text-xs font-bold text-foreground">Jira Progress</p>
                                    <p className="text-[10px] text-muted-foreground">Done / Total Issues</p>
                                </div>
                            </div>
                            <span className="text-xl font-black text-blue-500">{data.jiraStats?.done || 0}/{data.jiraStats?.total || 0}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                             <div className="p-3 rounded-lg border border-border/20 bg-card">
                                <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Top Strength</p>
                                <p className="text-xs font-bold text-green-400 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> PR Turnaround
                                </p>
                             </div>
                             <div className="p-3 rounded-lg border border-border/20 bg-card">
                                <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Main Blocker</p>
                                <p className="text-xs font-bold text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Bug Overflow
                                </p>
                             </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Team Performance Grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 className="text-lg font-bold text-foreground mb-4">Team Contributions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {data.teamPerf.map((member, i) => (
                        <Card key={i} className="bg-card border-border/30 hover:border-primary/50 transition-all cursor-pointer group">
                            <CardContent className="p-4 flex flex-col items-center text-center">
                                <div className="relative">
                                    <Avatar className="w-16 h-16 border-2 border-background mb-3 group-hover:scale-105 transition-transform shadow-xl">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{member.avatar}</AvatarFallback>
                                    </Avatar>
                                    <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0 bg-secondary text-secondary-foreground border-none">
                                        {member.velocity} pts
                                    </Badge>
                                </div>
                                <h4 className="font-semibold text-foreground text-sm">{member.member}</h4>
                                <p className="text-[10px] text-muted-foreground mb-3 uppercase tracking-wider">{member.role}</p>

                                <div className="w-full grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="bg-muted/10 p-1.5 rounded flex flex-col border border-border/30">
                                        <span className="text-muted-foreground/70 text-[8px] uppercase">Quality</span>
                                        <span className="font-bold text-accent">{member.quality.toFixed(0)}%</span>
                                    </div>
                                    <div className="bg-muted/10 p-1.5 rounded flex flex-col border border-border/30">
                                        <span className="text-muted-foreground/70 text-[8px] uppercase">Collab</span>
                                        <span className="font-bold text-primary">{member.collaboration.toFixed(0)}%</span>
                                    </div>
                                </div>

                                <div className="mt-3 text-[10px] font-bold flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                                    <TrendingUp className="w-2.5 h-2.5" /> High Pace
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default PerformancePage;

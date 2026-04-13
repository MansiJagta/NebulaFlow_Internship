import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Target, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const CollaboratorPerformancePage = () => {
    const { API_BASE_URL, selectedRepo } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [workspace, setWorkspace] = useState(null);

    const chartTooltipStyle = { 
        background: 'hsl(234, 55%, 18%)', 
        border: '1px solid hsl(257, 60%, 30%)', 
        borderRadius: '8px', 
        color: 'hsl(233, 60%, 92%)' 
    };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const wsRes = await axios.get(`${API_BASE_URL}/workspace/me`, { withCredentials: true });
                const nextWorkspace = wsRes.data;
                const workspaceId = selectedRepo?.workspaceId || nextWorkspace?._id;
                setWorkspace(nextWorkspace);

                if (!workspaceId) {
                    setData(null);
                    return;
                }

                const perfRes = await axios.get(`${API_BASE_URL}/performance/${workspaceId}`, { withCredentials: true });
                setData(perfRes.data);
            } catch (err) {
                console.error('[Performance] Fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
        const interval = setInterval(fetchAll, 30000);
        return () => clearInterval(interval);
    }, [API_BASE_URL, selectedRepo?.workspaceId]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">Gathering your productivity insights...</p>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center bg-card rounded-xl border border-border/50">Performance metrics unavailable.</div>;

    const myPerf = data.myPerf || { velocity: 0, quality: 0, collaboration: 0 };

    const effortData = [
        { name: 'Feature Dev', value: 60, color: 'hsl(187, 100%, 50%)' },
        { name: 'Bug Fixes', value: data.bugRatio, color: 'hsl(340, 75%, 55%)' },
        { name: 'Other', value: 40 - data.bugRatio, color: 'hsl(257, 100%, 68%)' },
    ];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold nebula-gradient-text">My Performance</h1>
                <p className="text-muted-foreground text-sm">Self-reflection & productivity insights for {workspace?.name}</p>
            </motion.div>

            {/* Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="nebula-card p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Points Delivered</p>
                        <p className="text-xl font-bold text-foreground">{myPerf.velocity} <span className="text-xs font-normal text-muted-foreground">pts total</span></p>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="nebula-card p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Peer Quality</p>
                        <p className="text-xl font-bold text-foreground">{myPerf.quality.toFixed(0)}% <span className="text-xs font-normal text-muted-foreground">reliability</span></p>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="nebula-card p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Collab Score</p>
                        <p className="text-xl font-bold text-foreground">{myPerf.collaboration.toFixed(0)}% <span className="text-xs font-normal text-muted-foreground">activity</span></p>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Productivity Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Daily Contribution Volume</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={data.weeklyData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Area type="monotone" dataKey="tasks" stroke="hsl(187, 100%, 50%)" fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Growth Metrics */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Output Correlation</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data.weeklyData}>
                            <XAxis dataKey="day" stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Bar name="Tasks" dataKey="tasks" fill="hsl(187, 100%, 50%)" radius={[4, 4, 0, 0]} />
                            <Bar name="Commits" dataKey="commits" fill="hsl(257, 100%, 68%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Effort Distribution */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="nebula-card p-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-2">Code Effort Distribution</h3>
                        <p className="text-sm text-muted-foreground mb-4">Breakdown derived from workspace activity types.</p>
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

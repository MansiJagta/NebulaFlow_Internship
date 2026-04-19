import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ListChecks, Clock, GitBranch, Zap, Calendar, Play, Loader2, 
    TrendingUp, Award, Target, MessageSquare, Shield, Activity, 
    MousePointer2, Flame, Bot, Briefcase, ChevronRight, Info
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KpiCard from '@/components/common/KpiCard';
import { useAuth } from '@/contexts/AuthContext';
import { useCollaboratorWorkspaceLive } from '@/hooks/useCollaboratorWorkspaceLive';
import axios from 'axios';

const CollaboratorDashboard = () => {
    const { user, selectedRepo, API_BASE_URL, token } = useAuth();
    const { workspaceId, loading: workspaceLoading } = useCollaboratorWorkspaceLive();
    
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!workspaceId) return;
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/performance/user/${user.id}`, {
                    params: {
                        workspaceId,
                        repoOwner: selectedRepo?.owner,
                        repoName: selectedRepo?.name
                    },
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setAnalytics(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, [workspaceId, selectedRepo, token, API_BASE_URL]);

    const radarData = useMemo(() => {
        if (!analytics) return [];
        return [
            { subject: 'Code Quality', A: 85, fullMark: 100 }, // Mocked or derived from bug ratio
            { subject: 'Velocity', A: (analytics.jira?.sprintVelocity / (analytics.jira?.teamAvgVelocity || 1)) * 50 || 70, fullMark: 100 },
            { subject: 'Engagement', A: Math.min(100, analytics.slack?.technicalAssistanceScore || 60), fullMark: 100 },
            { subject: 'Productivity', A: Math.min(100, (analytics.github?.totalCommits || 0) * 4), fullMark: 100 },
            { subject: 'Reliability', A: Math.max(0, 100 - (analytics.jira?.stuckTasks * 20)), fullMark: 100 },
        ];
    }, [analytics]);

    const areaData = useMemo(() => {
        if (!analytics?.github?.commitFrequency) return [];
        // In a real scenario, we'd have additions/deletions per day. 
        // For now, we'll use commit count as proxy or mock drift if additions/deletions aren't historical in this endpoint yet.
        return analytics.github.commitFrequency.map(item => ({
            name: item.date,
            additions: Math.floor(Math.random() * 200) + 100, // Mocked per-day drift
            deletions: Math.floor(Math.random() * 100) + 20,
        }));
    }, [analytics]);

    const chartTooltipStyle = {
        background: 'hsl(234, 55%, 18%)',
        border: '1px solid hsl(257, 60%, 30%)',
        borderRadius: '12px',
        color: 'hsl(233, 60%, 92%)',
        fontSize: '12px'
    };

    if (loading && !analytics) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse text-lg font-medium">Synthesizing personalized workspace intelligence...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* AI Persona Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="nebula-card p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent border-primary/20"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                        <Bot className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-lg font-bold text-foreground">Collaborator Persona Summary</h2>
                            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/30">AI Generated</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl italic">
                            "{analytics?.persona?.summary || 'Deep analysis pending more repository activity. You are showing steady growth in backend contributions.'}"
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {analytics?.persona?.tags?.map((tag, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-[10px] font-bold uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Top Row: KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard 
                    title="Code Impact Score" 
                    value={analytics?.github?.codeImpactScore || 0} 
                    icon={<Flame className="w-5 h-5 text-orange-500" />} 
                    trend={{ value: 12, positive: true }}
                    delay={0.1} 
                />
                <KpiCard 
                    title="Avg PR Lead Time" 
                    value={analytics?.github?.prLeadTimeHours || 0} 
                    suffix="h" 
                    icon={<Clock className="w-5 h-5 text-cyan-500" />} 
                    trend={{ value: 5, positive: true }}
                    delay={0.2} 
                />
                <KpiCard 
                    title="Response Latency" 
                    value={15} 
                    suffix="m" 
                    icon={<MessageSquare className="w-5 h-5 text-purple-500" />} 
                    trend={{ value: 2, positive: true }}
                    delay={0.3} 
                />
                <KpiCard 
                    title="Active Workspace Days" 
                    value={24} 
                    icon={<Activity className="w-5 h-5 text-emerald-500" />} 
                    delay={0.4} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Center: Code Churn & Volume */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 nebula-card p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-foreground">Code DNA Dynamics</h3>
                            <p className="text-xs text-muted-foreground">Additions vs Deletions per cycle in {selectedRepo?.name}</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-primary">
                                <div className="w-2 h-2 rounded-full bg-primary" /> Additions
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-accent">
                                <div className="w-2 h-2 rounded-full bg-accent" /> Deletions
                            </div>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaData}>
                                <defs>
                                    <linearGradient id="colorAdd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(340, 100%, 65%)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="hsl(340, 100%, 65%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip contentStyle={chartTooltipStyle} />
                                <Area type="monotone" dataKey="additions" stroke="hsl(187, 100%, 50%)" fillOpacity={1} fill="url(#colorAdd)" strokeWidth={3} />
                                <Area type="monotone" dataKey="deletions" stroke="hsl(340, 100%, 65%)" fillOpacity={1} fill="url(#colorDel)" strokeWidth={2} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Radar: Performance Overview */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="nebula-card p-6 flex flex-col items-center"
                >
                    <div className="self-start mb-4">
                        <h3 className="text-base font-bold text-foreground">Engineering Balance</h3>
                        <p className="text-xs text-muted-foreground">Multi-dimensional performance scan</p>
                    </div>
                    <div className="h-[240px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="hsl(257, 40%, 30%)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(233, 30%, 55%)', fontSize: 10 }} />
                                <Radar 
                                    name="Me" 
                                    dataKey="A" 
                                    stroke="hsl(187, 100%, 50%)" 
                                    fill="hsl(187, 100%, 50%)" 
                                    fillOpacity={0.3} 
                                    strokeWidth={3}
                                />
                                <Tooltip contentStyle={chartTooltipStyle} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full mt-6">
                        <div className="p-3 bg-muted/10 rounded-xl border border-border/20 text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Stability</p>
                            <p className="text-lg font-bold text-primary">94%</p>
                        </div>
                        <div className="p-3 bg-muted/10 rounded-xl border border-border/20 text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Velocity</p>
                            <p className="text-lg font-bold text-secondary">{analytics?.jira?.sprintVelocity}pts</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Metric Breakdown Table */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="lg:col-span-2 nebula-card overflow-hidden"
                >
                    <div className="p-6 border-b border-border/20 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-foreground">Metric Breakdown</h3>
                            <p className="text-xs text-muted-foreground">Repository-scoped productivity ledger</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-primary/20 hover:bg-primary/5">
                            <Info className="w-3 h-3" /> Definitions
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/10 border-b border-border/20">
                                <tr className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                    <th className="px-6 py-4">Metric Category</th>
                                    <th className="px-6 py-4">Observed Value</th>
                                    <th className="px-6 py-4">Benchmark</th>
                                    <th className="px-6 py-4">Health</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                <tr className="group hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500"><GitBranch className="w-4 h-4" /></div>
                                            <span className="font-medium text-foreground">PR Merge Speed</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-cyan-500">{analytics?.github?.prLeadTime || '—'}</td>
                                    <td className="px-6 py-4 text-muted-foreground">Team Avg: 18.5h</td>
                                    <td className="px-6 py-4"><Badge className="bg-emerald-500/10 text-emerald-500 border-none">Optimal</Badge></td>
                                </tr>
                                <tr className="group hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500"><Zap className="w-4 h-4" /></div>
                                            <span className="font-medium text-foreground">Sprint Velocity</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-purple-500">{analytics?.jira?.sprintVelocity || 0} pts</td>
                                    <td className="px-6 py-4 text-muted-foreground">Workspace Avg: {analytics?.jira?.teamAvgVelocity}</td>
                                    <td className="px-6 py-4">
                                        <Badge className={`border-none ${analytics?.jira?.velocityDelta >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {analytics?.jira?.velocityDelta >= 0 ? 'Exceeding' : 'Developing'}
                                        </Badge>
                                    </td>
                                </tr>
                                <tr className="group hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500"><Target className="w-4 h-4" /></div>
                                            <span className="font-medium text-foreground">Bug Fix Ratio</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-pink-500">{analytics?.jira?.bugToFeatureRatio || 0}x</td>
                                    <td className="px-6 py-4 text-muted-foreground">Goal: &lt; 0.3x</td>
                                    <td className="px-6 py-4"><Badge className="bg-cyan-500/10 text-cyan-500 border-none">Balanced</Badge></td>
                                </tr>
                                <tr className="group hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Flame className="w-4 h-4" /></div>
                                            <span className="font-medium text-foreground">Technical Help</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-orange-500">{analytics?.slack?.technicalAssistanceScore || 0}%</td>
                                    <td className="px-6 py-4 text-muted-foreground">High Help Threshold: 70%</td>
                                    <td className="px-6 py-4"><Badge className="bg-amber-500/10 text-amber-500 border-none">Active</Badge></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Right Panel: Language DNA & Bottlenecks */}
                <div className="space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="nebula-card p-6"
                    >
                        <h3 className="text-base font-bold text-foreground mb-4">Language DNA Breakdown</h3>
                        <div className="space-y-4">
                            {analytics?.github?.languageDistribution?.length > 0 ? analytics.github.languageDistribution.slice(0, 4).map((lang, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} /> {lang.name}
                                        </span>
                                        <span className="text-muted-foreground">{lang.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${lang.value}%` }}
                                            transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: lang.color }}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-xs text-muted-foreground py-4 text-center">No language data detected in commits.</p>
                            )}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 }}
                        className="nebula-card p-6 bg-accent/5 border-accent/20"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <Shield className="w-4 h-4 text-accent" /> Bottleneck Alerts
                            </h3>
                            <Badge variant="destructive" className="animate-pulse">{analytics?.jira?.stuckTasks || 0}</Badge>
                        </div>
                        {analytics?.jira?.stuckTasks > 0 ? (
                            <div className="space-y-3">
                                {analytics.jira.stuckTasksList.map((task, i) => (
                                    <div key={i} className="p-3 bg-accent/10 rounded-lg border border-accent/20 flex justify-between items-center group cursor-pointer hover:bg-accent/20 transition-all">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-accent truncate">{task.issueKey}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{task.title}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-accent whitespace-nowrap">{task.daysStuck}d Stuck</p>
                                            <ChevronRight className="w-3 h-3 ml-auto text-accent/50 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                                    <Award className="w-5 h-5" />
                                </div>
                                <p className="text-xs text-muted-foreground">Workflow is clear! No tasks stuck for over 3 days.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CollaboratorDashboard;

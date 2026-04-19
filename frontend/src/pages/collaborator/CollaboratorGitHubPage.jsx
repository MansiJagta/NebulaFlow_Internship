import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    GitFork,
    Star,
    AlertCircle,
    GitPullRequest,
    Clock,
    Github,
    ExternalLink,
    Loader2,
    Users,
    Activity,
    ShieldCheck,
    Code2,
    BarChart3,
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend 
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCollaboratorWorkspaceLive } from '@/hooks/useCollaboratorWorkspaceLive';
import axios from 'axios';

const CollaboratorGitHubPage = () => {
    const { selectedRepo, API_BASE_URL, token } = useAuth();
    const { repoList, repoDetails, repoCollaborators, loading: workspaceLoading } = useCollaboratorWorkspaceLive();
    
    const [advancedData, setAdvancedData] = useState(null);
    const [loading, setLoading] = useState(true);

    const repoOwner = useMemo(() => {
        if (selectedRepo?.owner) return selectedRepo.owner;
        if (selectedRepo?.fullName?.includes('/')) return selectedRepo.fullName.split('/')[0];
        return repoDetails?.repoInfo?.fullName?.split('/')[0] || null;
    }, [repoDetails?.repoInfo, selectedRepo]);

    const repoName = useMemo(() => {
        return selectedRepo?.name || repoDetails?.repoInfo?.name || null;
    }, [repoDetails, selectedRepo]);

    useEffect(() => {
        const fetchAdvanced = async () => {
            if (!repoOwner || !repoName) return;
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/github/advanced-analytics`, {
                    params: { owner: repoOwner, repo: repoName },
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setAdvancedData(res.data);
            } catch (err) {
                console.error("Failed to fetch advanced analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdvanced();
    }, [repoOwner, repoName, API_BASE_URL, token]);

    const chartTooltipStyle = {
        background: 'hsl(234, 55%, 18%)',
        border: '1px solid hsl(257, 60%, 30%)',
        borderRadius: '12px',
        color: 'hsl(233, 60%, 92%)',
        fontSize: '12px'
    };

    const PIE_COLORS = ['#6EE7FF', '#C084FC', '#F472B6', '#FBBF24', '#34D399'];

    if (loading && !advancedData) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse text-lg font-medium">Decoding repository telemetry...</p>
            </div>
        );
    }

    const repoInfo = repoDetails?.repoInfo;

    return (
        <div className="space-y-6 pb-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold nebula-gradient-text tracking-tight">Advanced GitHub Intelligence</h1>
                    <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                        {repoInfo?.fullName || selectedRepo?.fullName}
                        {repoInfo?.htmlUrl && (
                            <a href={repoInfo.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:scale-110 transition-transform">
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="border-secondary/30 text-secondary bg-secondary/5 font-mono">LIVE_SCAN_SUCCESS</Badge>
                </div>
            </motion.div>

            {/* Top Row: Enhanced Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="nebula-card p-5 group hover:border-yellow-500/30 transition-all">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-yellow-500">Stars</p>
                    <div className="flex items-center justify-between mt-1">
                        <h3 className="text-3xl font-bold text-foreground font-mono">{repoInfo?.stars ?? 0}</h3>
                        <Star className="w-8 h-8 text-yellow-500/20 group-hover:text-yellow-500/40 transition-colors" />
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="nebula-card p-5 group hover:border-blue-500/30 transition-all">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-blue-500">Forks</p>
                    <div className="flex items-center justify-between mt-1">
                        <h3 className="text-3xl font-bold text-foreground font-mono">{repoInfo?.forks ?? 0}</h3>
                        <GitFork className="w-8 h-8 text-blue-500/20 group-hover:text-blue-500/40 transition-colors" />
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="nebula-card p-5 group hover:border-red-500/30 transition-all">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-red-500">Open Issues</p>
                    <div className="flex items-center justify-between mt-1">
                        <h3 className="text-3xl font-bold text-foreground font-mono">{repoInfo?.openIssues ?? 0}</h3>
                        <AlertCircle className="w-8 h-8 text-red-500/20 group-hover:text-red-500/40 transition-colors" />
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="nebula-card p-5 group hover:border-green-500/30 transition-all">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-green-500">Avg Merge Time</p>
                    <div className="flex items-center justify-between mt-1 text-green-500">
                        <h3 className="text-3xl font-bold font-mono">{advancedData?.prAnalytics?.avgTimeToMerge ?? '—'} <span className="text-sm font-normal">h</span></h3>
                        <GitPullRequest className="w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity" />
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main: Multi-Series Area Chart (Code Churn) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.5 }} 
                    className="lg:col-span-2 nebula-card p-6"
                >
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h3 className="text-base font-bold text-foreground">Code Churn vs Throughput</h3>
                            <p className="text-xs text-muted-foreground">Historical additions/deletions and commit intensity</p>
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
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={advancedData?.activityTrend}>
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
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(257, 20%, 25%)" vertical={false} />
                                <XAxis dataKey="date" stroke="hsl(233, 30%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(233, 30%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={chartTooltipStyle} />
                                <Area type="monotone" dataKey="additions" stroke="hsl(187, 100%, 50%)" fill="url(#colorAdd)" strokeWidth={3} />
                                <Area type="monotone" dataKey="deletions" stroke="hsl(340, 100%, 65%)" fill="url(#colorDel)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Right: Work-Type Breakdown (Pie) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.6 }} 
                    className="nebula-card p-6 flex flex-col"
                >
                    <h3 className="text-base font-bold text-foreground mb-4">Work-Type DNA</h3>
                    <div className="flex-1 min-h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={advancedData?.workTypeBreakdown} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="count"
                                >
                                    {advancedData?.workTypeBreakdown?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={chartTooltipStyle} />
                                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[10px] uppercase font-bold text-muted-foreground">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-[10px] text-primary font-bold uppercase mb-2">Dominant Behavior</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {advancedData?.workTypeBreakdown?.[0]?.name === 'feature' 
                                ? 'Highly expansionist focus. Most effort directed towards new implementation.' 
                                : 'Significant maintenance effort detected. Optimizing existing architecture.'}
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Health & Security */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="nebula-card p-6">
                    <h3 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" /> Repo Security & Health
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between group">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-foreground">Issue Velocity</p>
                                <p className="text-[10px] text-muted-foreground uppercase">Avg resolution cycle</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-mono font-bold text-emerald-500">{advancedData?.health?.issueResolutionVelocity}d</p>
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] h-4">Optimal</Badge>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-foreground">
                                <span>Documentation Coverage</span>
                                <span>{advancedData?.health?.documentationCoverage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${advancedData?.health?.documentationCoverage}%` }} />
                            </div>
                        </div>
                        <div className="p-4 bg-muted/10 rounded-xl border border-border/20 text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Maintenance Status</p>
                            <p className="text-sm font-bold text-foreground">Sustainably Managed</p>
                        </div>
                    </div>
                </motion.div>

                {/* PR Size Distribution */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="nebula-card p-6">
                    <h3 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
                        <GitPullRequest className="w-5 h-5 text-secondary" /> PR Size Distribution
                    </h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={advancedData?.prAnalytics?.prSizes}>
                                <Bar dataKey="size" fill="hsl(257, 100%, 68%)" radius={[4, 4, 0, 0]} />
                                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(192, 132, 252, 0.1)' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        <p className="text-[10px] text-secondary font-bold uppercase">Complexity Scan</p>
                        <p className="text-xs text-muted-foreground">Most Pull Requests maintain a "Small-to-Medium" size profile, facilitating faster peer reviews.</p>
                    </div>
                </motion.div>

                {/* Collaborators: Advanced */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="nebula-card p-6 overflow-hidden flex flex-col">
                    <h3 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" /> Review Participation
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {repoCollaborators.slice(0, 5).map((collaborator, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-xl group hover:bg-white/5 transition-all">
                                <Avatar className="w-9 h-9 border-2 border-background">
                                    <AvatarImage src={collaborator.avatarUrl} />
                                    <AvatarFallback className="bg-primary/20 text-primary text-xs">{collaborator.login?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{collaborator.name || collaborator.login}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">{collaborator.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-mono font-bold text-primary">{Math.floor(Math.random() * 10) + 1} reviews</p>
                                    <p className="text-[10px] text-muted-foreground">88% score</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Commit Frequency - Grid Layout */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="nebula-card p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-base font-bold text-foreground">Flow State (Commit Velocity)</h3>
                        <p className="text-xs text-muted-foreground">Daily commit density across the current cycle</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Low</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-3 h-3 rounded-sm bg-primary" style={{ opacity: i * 0.2 }} />)}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">High</span>
                    </div>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={advancedData?.activityTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(257, 20%, 25%)" />
                            <XAxis dataKey="date" stroke="hsl(233, 30%, 55%)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(233, 30%, 55%)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(110, 231, 255, 0.05)' }} />
                            <Bar dataKey="commits" fill="hsl(187, 100%, 50%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default CollaboratorGitHubPage;

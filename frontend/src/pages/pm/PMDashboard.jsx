import { useState, useEffect } from 'react';
import KpiCard from '@/components/common/KpiCard';
import ActivityFeed from '@/components/common/ActivityFeed';
import NebulaBarChart from '@/components/common/NebulaBarChart';
import MiniKanban from '@/components/pm/MiniKanban';
import QuickMessage from '@/components/pm/QuickMessage';
import { motion } from 'framer-motion';
import { ListChecks, GitBranch, Star, Clock, GitMerge, User, Loader2, Github, Slack, Trello } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { sprintStats } from '@/data/jiraMockData';
import { commitFrequency as mockCommitFrequency } from '@/data/githubMockData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const TOOLTIP_STYLE = {
    background: 'hsl(234, 55%, 18%)',
    border: '1px solid hsl(257, 60%, 30%)',
    borderRadius: '8px',
    color: 'hsl(233, 60%, 92%)',
};

const PMDashboard = () => {
    const navigate = useNavigate();
    const { selectedRepo, API_BASE_URL } = useAuth();

    const [ghData, setGhData] = useState(null);
    const [ghLoading, setGhLoading] = useState(false);

    const [perfData, setPerfData] = useState(null);
    const [issues, setIssues] = useState([]);
    const [sprints, setSprints] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setGhLoading(true);
            try {
                // 1. Get Workspace
                const wsRes = await axios.get(`${API_BASE_URL}/workspace/me`, { withCredentials: true });
                const workspaceId = wsRes.data?._id;

                // 2. Fetch Performance, GitHub, Issues, and Sprints data in parallel
                const [perfRes, githubRes, issuesRes, sprintsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/performance/${workspaceId}`, { withCredentials: true }),
                    selectedRepo ? axios.get(
                        `${API_BASE_URL}/github/repo?owner=${encodeURIComponent(
                            selectedRepo.owner || (selectedRepo.fullName?.includes('/') ? selectedRepo.fullName.split('/')[0] : '')
                        )}&repo=${encodeURIComponent(selectedRepo.name)}`,
                        { withCredentials: true }
                    ) : Promise.resolve({ data: null }),
                    axios.get(`${API_BASE_URL}/pm/issues${workspaceId ? `?workspaceId=${workspaceId}` : ''}`, { withCredentials: true }),
                    axios.get(`${API_BASE_URL}/pm/sprints`, { withCredentials: true })
                ]);

                setPerfData(perfRes.data);
                if (githubRes.data) setGhData(githubRes.data);
                if (issuesRes.data) setIssues(issuesRes.data);
                if (sprintsRes.data) setSprints(sprintsRes.data);
            } catch (err) {
                console.error('[PMDashboard] Data fetch failed:', err);
            } finally {
                setGhLoading(false);
            }
        };

        fetchData();
    }, [selectedRepo, API_BASE_URL]);

    // Derived values – prefer real data, fall back to sensible defaults
    const openPRs = ghData?.openPRsCount ?? 0;

    // Commit chart data: last 7 days from GitHub
    const rawFrequency = ghData?.commitFrequency ?? [];
    const commitChartData = rawFrequency.slice(-7).map(d => ({
        day: d.date,
        commits: d.count,
    }));

    // Real Active Tasks & Jira Completion
    const activeTasks = issues.filter(i => i.status !== 'done').length;
    const jiraDoneCount = issues.filter(i => i.status === 'done').length;
    const jiraTotalCount = issues.length;

    // Local Sprint Burndown Calculation
    const activeSprint = sprints.find(s => s.isActive) || sprints[0];
    let sprintBurndownData = [];
    if (activeSprint && issues.length > 0) {
        const start = new Date(activeSprint.startsOn);
        const end = new Date(activeSprint.endsOn);
        let durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (durationDays <= 0) durationDays = 14; // fallback duration

        const sprintIssues = issues.filter(i => i.sprintId === activeSprint._id);
        const totalPoints = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0) || 10;

        for (let i = 0; i <= durationDays; i++) {
            const currentDay = new Date(start);
            currentDay.setDate(start.getDate() + i);
            currentDay.setHours(23, 59, 59, 999);

            const completedOnDay = sprintIssues.filter(issue => issue.status === 'done' && new Date(issue.updatedAt) <= currentDay);
            const pointsDone = completedOnDay.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);

            sprintBurndownData.push({
                day: `Day ${i + 1}`,
                ideal: Math.max(0, totalPoints - (totalPoints / durationDays) * i),
                remaining: Math.max(0, totalPoints - pointsDone)
            });
        }
    } else {
        sprintBurndownData = sprintStats.burndown; // Fallback to mock if no concrete active data
    }

    // Dynamic Activity Feed Setup
    const recentCommits = (ghData?.recentCommits ?? []).slice(0, 4);
    const feedActivities = [];
    
    recentCommits.forEach((c, i) => {
        feedActivities.push({
            id: `commit-${c.sha || i}`,
            user: c.author,
            action: 'pushed',
            target: c.message.substring(0, 40),
            time: 'Recently',
            type: 'commit',
            rawDate: new Date(c.date || Date.now())
        });
    });

    const recentIssues = [...issues].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
    recentIssues.forEach(iss => {
        feedActivities.push({
            id: `issue-${iss._id}`,
            user: iss.assigneeUser?.fullName || iss.reporterUser?.fullName || 'Someone',
            action: iss.status === 'done' ? 'completed' : 'updated',
            target: `${iss.issueKey}: ${iss.title.substring(0, 30)}`,
            time: 'Recently',
            type: 'task',
            rawDate: new Date(iss.updatedAt || iss.createdAt)
        });
    });

    feedActivities.sort((a, b) => b.rawDate - a.rawDate);
    const topActivities = feedActivities.slice(0, 5);

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold nebula-gradient-text mb-1">Project Manager Dashboard</h1>
                    <p className="text-muted-foreground text-sm">
                        {selectedRepo
                            ? <span className="flex items-center gap-1.5"><Github className="w-3 h-3" />{selectedRepo.fullName || selectedRepo.name}</span>
                            : "Overview of your team's progress & performance"}
                    </p>
                </div>
                {ghLoading && (
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" /> Syncing GitHub…
                    </span>
                )}
                {!selectedRepo && (
                    <button
                        onClick={() => navigate('/repository-selection')}
                        className="text-xs text-primary border border-primary/30 rounded-md px-3 py-1.5 hover:bg-primary/10 flex items-center gap-1.5 transition-colors"
                    >
                        <Github className="w-3 h-3" /> Connect GitHub
                    </button>
                )}
            </motion.div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <KpiCard title="Active Tasks" value={activeTasks} icon={<ListChecks className="w-5 h-5" />} trend={{ value: activeTasks > 5 ? 5 : 0, positive: false }} delay={0} />
                <KpiCard title="Team Velocity" value={perfData?.totalSprintPoints || 0} suffix="pts" icon={<Star className="w-5 h-5" />} trend={{ value: 8, positive: true }} delay={0.1} />
                <KpiCard
                    title="Open PRs"
                    value={openPRs}
                    icon={<GitBranch className="w-5 h-5" />}
                    trend={{ value: openPRs > 5 ? openPRs - 5 : 0, positive: false }}
                    delay={0.2}
                />
                <KpiCard 
                    title="Slack Activity" 
                    value={perfData?.slackActivity || 0} 
                    suffix="msg" 
                    icon={<Slack className="w-5 h-5 text-purple-400" />} 
                    delay={0.3} 
                />
                <KpiCard 
                    title="Jira Done" 
                    value={jiraDoneCount} 
                    suffix={`/${jiraTotalCount}`} 
                    icon={<Trello className="w-5 h-5 text-blue-500" />} 
                    delay={0.4} 
                />
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
                            <AreaChart data={sprintBurndownData}>
                                <defs>
                                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--nebula-cyan))" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="hsl(var(--nebula-cyan))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
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

                {/* Sidebar / Feed Area */}
                <div className="space-y-6">
                    {/* Commit Activity Chart – now live */}
                    <NebulaBarChart
                        data={commitChartData}
                        dataKey="commits"
                        xKey="day"
                        title={selectedRepo ? `Commits · ${selectedRepo.name}` : 'Commit Activity'}
                        height={200}
                        color="hsl(var(--nebula-pink))"
                    />

                    {/* Recent GitHub Commits strip (only when connected) */}
                    {recentCommits.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="nebula-card p-4 space-y-3"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Recent Commits</h3>
                                <button
                                    onClick={() => navigate('/pm/github')}
                                    className="text-[10px] text-primary hover:underline"
                                >
                                    See all →
                                </button>
                            </div>
                            {recentCommits.map((c, i) => (
                                <div key={c.sha || i} className="flex items-start gap-2 group">
                                    <div className="w-6 h-6 mt-0.5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <GitBranch className="w-3 h-3" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-foreground truncate">{c.message}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <User className="w-2.5 h-2.5" />{c.author}
                                            </span>
                                            <Badge variant="outline" className="text-[9px] h-4 font-mono border-primary/20 text-primary px-1 py-0">
                                                {String(c.sha).substring(0, 7)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    <ActivityFeed activities={topActivities} />

                    <QuickMessage />
                </div>
            </div>
        </div>
    );
};

export default PMDashboard;

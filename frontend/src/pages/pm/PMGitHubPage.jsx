import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Star, GitFork, AlertCircle, GitPullRequest, Clock, User, Github, ExternalLink, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// ---- Fallback (mock) data so the UI is never empty ----
import {
    githubRepos as mockRepos,
    recentCommits as mockCommits,
    commitFrequency as mockFrequency,
    languageBreakdown as mockLanguages,
    contributors as mockContributors,
} from '@/data/githubMockData';

function StatCard({ label, value, icon, color }) {
    return (
        <Card className="bg-card border-border/40">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">{label}</p>
                    <h3 className="text-2xl font-bold text-foreground">{value ?? '—'}</h3>
                </div>
                <div className={`p-2 ${color} rounded-lg`}>{icon}</div>
            </CardContent>
        </Card>
    );
}

const GitHubPage = () => {
    const navigate = useNavigate();
    const { selectedRepo, API_BASE_URL } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const chartTooltipStyle = {
        background: 'hsl(234, 55%, 18%)',
        border: '1px solid hsl(257, 60%, 30%)',
        borderRadius: '8px',
        color: 'hsl(233, 60%, 92%)',
    };

    useEffect(() => {
        if (!selectedRepo) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Resolve owner: stored either as 'owner' string or derived from fullName
                const owner = selectedRepo.owner
                    || (selectedRepo.fullName && selectedRepo.fullName.includes('/')
                        ? selectedRepo.fullName.split('/')[0]
                        : null);
                const repo = selectedRepo.name;

                if (!owner) {
                    setError('Could not determine repository owner. Please re-connect GitHub.');
                    return;
                }

                const res = await axios.get(
                    `${API_BASE_URL}/github/repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
                    { withCredentials: true }
                );
                setData(res.data);
            } catch (err) {
                console.error('[PMGitHubPage] fetch error:', err);
                setError(err.response?.data?.error || 'Failed to load GitHub data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedRepo, API_BASE_URL]);

    // Derived display values ─ fall back to mock data when not connected
    const repoInfo = data?.repoInfo;
    const stars = repoInfo?.stars ?? mockRepos.reduce((s, r) => s + r.stars, 0);
    const forks = repoInfo?.forks ?? mockRepos.reduce((s, r) => s + r.forks, 0);
    const openIssues = repoInfo?.openIssues ?? 23;
    const openPRs = data?.openPRsCount ?? 9;
    const commitFrequency = data?.commitFrequency ?? mockFrequency;
    const languageBreakdown = data?.languageBreakdown?.length ? data.languageBreakdown : mockLanguages;
    const contributors = data?.contributors?.length
        ? data.contributors.map(c => ({ name: c.login, role: 'Contributor', commits: c.commits, avatarUrl: c.avatarUrl }))
        : mockContributors;
    const recentCommits = data?.recentCommits?.length
        ? data.recentCommits.map(c => ({ hash: c.sha, message: c.message, author: c.author, time: c.time, branch: c.branch, additions: 0, deletions: 0 }))
        : mockCommits;
    const repos = repoInfo
        ? [{ name: repoInfo.name, language: repoInfo.language || 'Unknown', stars: repoInfo.stars, forks: repoInfo.forks, prs: openPRs, lastCommit: repoInfo.updatedAt ? new Date(repoInfo.updatedAt).toLocaleDateString() : '—' }]
        : mockRepos;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold nebula-gradient-text">GitHub Integration</h1>
                    <p className="text-muted-foreground text-sm">
                        {repoInfo ? (
                            <span className="flex items-center gap-1">
                                {repoInfo.fullName}
                                <a href={repoInfo.htmlUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline ml-1">
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </span>
                        ) : 'Repository analytics & code insights'}
                    </p>
                </div>
                {!selectedRepo && (
                    <Button size="sm" variant="outline" className="border-primary/30 text-primary" onClick={() => navigate('/repository-selection')}>
                        <Github className="w-4 h-4 mr-2" /> Connect GitHub
                    </Button>
                )}
            </motion.div>

            {/* Error / no-repo banner */}
            {!selectedRepo && (
                <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-center text-sm text-muted-foreground">
                    No repository linked. Go to{' '}
                    <button onClick={() => navigate('/repository-selection')} className="text-primary underline">
                        Repository Selection
                    </button>{' '}
                    to connect GitHub and pick a repo.
                    <p className="text-xs mt-1 opacity-60">Showing demo data below.</p>
                </div>
            )}

            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching live data from GitHub…
                </div>
            )}

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total Stars" value={stars} icon={<Star className="w-5 h-5 text-yellow-500" />} color="bg-yellow-500/10" />
                <StatCard label="Forks" value={forks} icon={<GitFork className="w-5 h-5 text-blue-500" />} color="bg-blue-500/10" />
                <StatCard label="Open Issues" value={openIssues} icon={<AlertCircle className="w-5 h-5 text-red-500" />} color="bg-red-500/10" />
                <StatCard label="Open PRs" value={openPRs} icon={<GitPullRequest className="w-5 h-5 text-green-500" />} color="bg-green-500/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Commit Frequency Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Commit Frequency (Last 15 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={commitFrequency}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="hsl(233, 30%, 55%)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(233, 30%, 55%)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Area type="monotone" dataKey="count" stroke="hsl(187, 100%, 50%)" fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Language Breakdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Languages</h3>
                    <div className="relative h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={languageBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                                    {languageBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={chartTooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <span className="text-2xl font-bold text-foreground">Code</span>
                            <span className="text-xs text-muted-foreground">Distribution</span>
                        </div>
                    </div>
                    <div className="mt-4 px-2 space-y-2">
                        {languageBreakdown.map((l, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }}></span>
                                    <span className="text-foreground">{l.name}</span>
                                </div>
                                <span className="text-muted-foreground">{l.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contributors */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Top Contributors</h3>
                    <div className="space-y-4">
                        {contributors.map((c, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Avatar className="w-8 h-8 rounded-full border-2 border-background">
                                    {c.avatarUrl && <AvatarImage src={c.avatarUrl} alt={c.name} />}
                                    <AvatarFallback className="text-[10px] bg-primary/20 text-primary">{c.name?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                                    <p className="text-xs text-muted-foreground">{c.role}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-mono text-primary">{c.commits} commits</div>
                                    {(c.additions !== undefined) && (
                                        <div className="text-[10px] text-green-400">+{c.additions} / -{c.deletions}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Repositories List */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Repositories</h3>
                    <div className="space-y-3">
                        {repos.map((repo) => (
                            <div key={repo.name} className="p-3 bg-muted/10 rounded-lg border border-border/20 hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                        {repo.name}
                                        {repo.language && (
                                            <Badge variant="secondary" className="text-[10px] py-0 h-5 bg-secondary/10 text-secondary border-none">{repo.language}</Badge>
                                        )}
                                    </h4>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {repo.lastCommit}</span>
                                </div>
                                <div className="flex gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {repo.stars}</span>
                                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-blue-500" /> {repo.forks}</span>
                                    <span className="flex items-center gap-1"><GitPullRequest className="w-3 h-3 text-green-500" /> {repo.prs}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Commits */}
            <div className="grid grid-cols-1 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {recentCommits.map((c, idx) => (
                            <motion.div key={c.hash || idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/10 transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <GitBranch className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-foreground truncate">{c.message}</p>
                                        <Badge variant="outline" className="text-[10px] h-5 font-mono border-primary/20 text-primary shrink-0">
                                            {String(c.hash).substring(0, 7)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {c.author}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.time}</span>
                                        <span className="flex items-center gap-1 bg-muted/30 px-1.5 rounded text-[10px]">{c.branch}</span>
                                    </div>
                                </div>
                                {(c.additions !== undefined && c.additions > 0) && (
                                    <div className="text-right text-xs font-mono hidden sm:block">
                                        <span className="text-green-400">+{c.additions}</span>
                                        <span className="mx-1 text-muted-foreground">/</span>
                                        <span className="text-red-400">-{c.deletions}</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default GitHubPage;

import { useMemo } from 'react';
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
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCollaboratorWorkspaceLive } from '@/hooks/useCollaboratorWorkspaceLive';
import {
    githubRepos as mockRepos,
    recentCommits as mockCommits,
    commitFrequency as mockFrequency,
    languageBreakdown as mockLanguages,
    contributors as mockContributors,
} from '@/data/githubMockData';

const CollaboratorGitHubPage = () => {
    const { selectedRepo } = useAuth();
    const { repoList, repoDetails, repoCollaborators, loading, error } = useCollaboratorWorkspaceLive();

    const chartTooltipStyle = {
        background: 'hsl(234, 55%, 18%)',
        border: '1px solid hsl(257, 60%, 30%)',
        borderRadius: '8px',
        color: 'hsl(233, 60%, 92%)',
    };

    const repoInfo = repoDetails?.repoInfo;
    const commitFrequency = repoDetails?.commitFrequency?.length ? repoDetails.commitFrequency : mockFrequency;
    const languageBreakdown = repoDetails?.languageBreakdown?.length ? repoDetails.languageBreakdown : mockLanguages;
    const contributors = repoCollaborators.length > 0
        ? repoCollaborators.map((collaborator) => ({
            name: collaborator.name || collaborator.login,
            role: collaborator.role || 'Collaborator',
            commits: collaborator.status === 'active' ? 1 : 0,
            avatarUrl: collaborator.avatarUrl,
        }))
        : mockContributors;
    const recentCommits = repoDetails?.recentCommits?.length
        ? repoDetails.recentCommits.map((commit) => ({
            hash: commit.sha,
            message: commit.message,
            author: commit.author,
            time: commit.time,
            additions: 0,
            deletions: 0,
        }))
        : mockCommits;

    const repositories = repoList.length > 0 ? repoList : mockRepos;
    const openPRs = repoDetails?.openPRsCount ?? 0;
    const stars = repoInfo?.stars ?? repositories.reduce((total, repo) => total + (repo.stars || 0), 0);
    const forks = repoInfo?.forks ?? repositories.reduce((total, repo) => total + (repo.forks || 0), 0);
    const openIssues = repoInfo?.openIssues ?? 0;

    const repoOwner = useMemo(() => {
        if (selectedRepo?.owner) return selectedRepo.owner;
        if (selectedRepo?.fullName?.includes('/')) return selectedRepo.fullName.split('/')[0];
        return repoInfo?.fullName?.includes('/') ? repoInfo.fullName.split('/')[0] : null;
    }, [repoInfo?.fullName, selectedRepo?.fullName, selectedRepo?.owner]);

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold nebula-gradient-text">GitHub Activity</h1>
                    <p className="text-muted-foreground text-sm">
                        {repoInfo ? (
                            <span className="inline-flex items-center gap-1.5 flex-wrap">
                                {repoInfo.fullName}
                                {repoInfo.htmlUrl && (
                                    <a href={repoInfo.htmlUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline">
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </span>
                        ) : (
                            'Repository analytics for your linked workspaces'
                        )}
                    </p>
                </div>
                {loading && (
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" /> Refreshing live data…
                    </span>
                )}
                {error && (
                    <span className="text-xs text-red-400">
                        Live fetch failed. Showing cached demo data.
                    </span>
                )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="nebula-card p-5">
                    <p className="text-xs text-muted-foreground uppercase font-bold text-yellow-500">Stars</p>
                    <h3 className="text-3xl font-bold text-foreground flex items-center gap-2 mt-1"><Star className="w-5 h-5 text-yellow-500" />{stars}</h3>
                </div>
                <div className="nebula-card p-5">
                    <p className="text-xs text-muted-foreground uppercase font-bold text-blue-500">Forks</p>
                    <h3 className="text-3xl font-bold text-foreground flex items-center gap-2 mt-1"><GitFork className="w-5 h-5 text-blue-500" />{forks}</h3>
                </div>
                <div className="nebula-card p-5">
                    <p className="text-xs text-muted-foreground uppercase font-bold text-red-500">Open Issues</p>
                    <h3 className="text-3xl font-bold text-foreground flex items-center gap-2 mt-1"><AlertCircle className="w-5 h-5 text-red-500" />{openIssues}</h3>
                </div>
                <div className="nebula-card p-5">
                    <p className="text-xs text-muted-foreground uppercase font-bold text-green-500">Open PRs</p>
                    <h3 className="text-3xl font-bold text-foreground flex items-center gap-2 mt-1"><GitPullRequest className="w-5 h-5 text-green-500" />{openPRs}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 nebula-card p-5">
                    <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Commit Frequency (Last 15 Days)</h3>
                            <p className="text-xs text-muted-foreground">Live activity for {repoInfo?.name || selectedRepo?.name || 'your current repository'}</p>
                        </div>
                        {repoOwner && (
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                                {repoOwner}
                            </Badge>
                        )}
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={commitFrequency}>
                            <XAxis dataKey="date" stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Line type="monotone" dataKey="count" stroke="hsl(187, 100%, 50%)" strokeWidth={3} dot={{ fill: 'hsl(187, 100%, 50%)', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Languages</h3>
                    <div className="relative h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={languageBreakdown}>
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip contentStyle={chartTooltipStyle} />
                                <Line type="monotone" dataKey="value" stroke="hsl(257, 100%, 68%)" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <span className="text-2xl font-bold text-foreground">Code</span>
                            <span className="text-xs text-muted-foreground">Distribution</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" /> Collaborators
                    </h3>
                    <div className="space-y-4">
                        {contributors.slice(0, 5).map((collaborator, index) => (
                            <div key={`${collaborator.name}-${index}`} className="flex items-center gap-3">
                                <Avatar className="w-8 h-8 rounded-full border-2 border-background">
                                    {collaborator.avatarUrl && <AvatarImage src={collaborator.avatarUrl} alt={collaborator.name} />}
                                    <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                                        {collaborator.name?.[0]?.toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{collaborator.name}</p>
                                    <p className="text-xs text-muted-foreground">{collaborator.role}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-mono text-primary">{collaborator.commits} commits</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Repositories</h3>
                    <div className="space-y-3">
                        {repositories.map((repo) => (
                            <div key={repo.id || repo.fullName || repo.name} className="p-3 bg-muted/10 rounded-lg border border-border/20 hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-2 gap-2">
                                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Github className="w-3.5 h-3.5 text-muted-foreground" />
                                        {repo.name}
                                        {repo.language && (
                                            <Badge variant="secondary" className="text-[10px] py-0 h-5 bg-secondary/10 text-secondary border-none">{repo.language}</Badge>
                                        )}
                                    </h4>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : 'Live'}</span>
                                </div>
                                <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {repo.stars ?? 0}</span>
                                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-blue-500" /> {repo.forks ?? 0}</span>
                                    <span className="flex items-center gap-1"><GitPullRequest className="w-3 h-3 text-green-500" /> {repo.prs ?? 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="nebula-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Recent Commits</h3>
                <div className="space-y-3">
                    {recentCommits.slice(0, 4).map((commit, index) => (
                        <div key={commit.hash || index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/10 transition-colors group">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground">{commit.message}</p>
                                <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                    <span className="font-mono text-primary">{commit.hash}</span>
                                    <span>{commit.time}</span>
                                    <span>{commit.author}</span>
                                </div>
                            </div>
                            <div className="text-right text-xs font-mono hidden sm:block">
                                <span className="text-green-400">+{commit.additions ?? 0}</span>
                                <span className="mx-1 text-muted-foreground">/</span>
                                <span className="text-red-400">-{commit.deletions ?? 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default CollaboratorGitHubPage;

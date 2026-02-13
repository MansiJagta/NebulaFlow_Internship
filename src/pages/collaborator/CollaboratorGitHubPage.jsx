import { motion } from 'framer-motion';
import { githubRepos, recentCommits, pullRequests } from '@/data/githubMockData';
import { GitBranch, Star, GitFork, AlertCircle, GitPullRequest, Clock, Plus, Minus, User, MessageCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const myCommitsData = [
    { date: 'Mon', count: 3 }, { date: 'Tue', count: 5 }, { date: 'Wed', count: 2 }, { date: 'Thu', count: 8 }, { date: 'Fri', count: 4 },
];

const teamAvgData = [
    { date: 'Mon', count: 4 }, { date: 'Tue', count: 4 }, { date: 'Wed', count: 4 }, { date: 'Thu', count: 5 }, { date: 'Fri', count: 3 },
];

const chartData = myCommitsData.map((d, i) => ({
    date: d.date,
    myCommits: d.count,
    teamAvg: teamAvgData[i].count
}));

const CollaboratorGitHubPage = () => {
    const chartTooltipStyle = { background: 'hsl(234, 55%, 18%)', border: '1px solid hsl(257, 60%, 30%)', borderRadius: '8px', color: 'hsl(233, 60%, 92%)' };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold nebula-gradient-text">GitHub Activity</h1>
                <p className="text-muted-foreground text-sm">Your code contributions & reviews</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Commit History */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">My Commits vs Team Average</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <XAxis dataKey="date" stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(233, 30%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Line type="monotone" dataKey="myCommits" stroke="hsl(187, 100%, 50%)" strokeWidth={3} dot={{ fill: 'hsl(187, 100%, 50%)', r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="teamAvg" stroke="hsl(257, 40%, 40%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* PR Stats Cards */}
                <div className="space-y-4">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="nebula-card p-5 border-green-500/20 bg-green-500/5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold text-green-500">Merged PRs</p>
                                <h3 className="text-3xl font-bold text-foreground">12</h3>
                                <p className="text-xs text-muted-foreground mt-1">This month</p>
                            </div>
                            <GitPullRequest className="w-8 h-8 text-green-500/50" />
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="nebula-card p-5 border-yellow-500/20 bg-yellow-500/5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold text-yellow-500">Pending Review</p>
                                <h3 className="text-3xl font-bold text-foreground">2</h3>
                                <p className="text-xs text-muted-foreground mt-1">Requiring your attention</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-yellow-500/50" />
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Review Requests */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-primary" /> Review Requests
                    </h3>
                    <div className="space-y-3">
                        {pullRequests.slice(0, 3).map((pr, i) => (
                            <div key={pr.id} className="p-3 rounded-lg border border-border/20 bg-card hover:border-primary/30 transition-colors flex items-start gap-3">
                                <Avatar className="w-8 h-8 border border-border">
                                    <AvatarFallback className="text-[10px]">{pr.author.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{pr.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-muted-foreground">#{pr.id} by {pr.author}</span>
                                        <Badge variant="secondary" className="text-[9px] py-0 h-4 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">Review Required</Badge>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" className="h-7 text-xs">Review</Button>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Commits */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">My Recent Commits</h3>
                    <div className="space-y-3">
                        {recentCommits.slice(0, 4).map((c, i) => (
                            <div key={c.hash} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/10 transition-colors group">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground">{c.message}</p>
                                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                                        <span className="font-mono text-primary">{c.hash}</span>
                                        <span>{c.time}</span>
                                    </div>
                                </div>
                                <div className="text-right text-xs font-mono hidden sm:block">
                                    <span className="text-green-400">+{c.additions}</span>
                                    <span className="mx-1 text-muted-foreground">/</span>
                                    <span className="text-red-400">-{c.deletions}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CollaboratorGitHubPage;

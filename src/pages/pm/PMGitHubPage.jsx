import { motion } from 'framer-motion';
import { githubRepos, recentCommits, commitFrequency, languageBreakdown, contributors } from '@/data/githubMockData';
import { GitBranch, Star, GitFork, AlertCircle, GitPullRequest, Clock, User } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const GitHubPage = () => {
    const chartTooltipStyle = { background: 'hsl(234, 55%, 18%)', border: '1px solid hsl(257, 60%, 30%)', borderRadius: '8px', color: 'hsl(233, 60%, 92%)' };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold nebula-gradient-text">GitHub Integration</h1>
                <p className="text-muted-foreground text-sm">Repository analytics & code insights</p>
            </motion.div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border/40">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Total Stars</p>
                            <h3 className="text-2xl font-bold text-foreground">262</h3>
                        </div>
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Star className="w-5 h-5" /></div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border/40">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Forks</p>
                            <h3 className="text-2xl font-bold text-foreground">67</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><GitFork className="w-5 h-5" /></div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border/40">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Open Issues</p>
                            <h3 className="text-2xl font-bold text-foreground">23</h3>
                        </div>
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><AlertCircle className="w-5 h-5" /></div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border/40">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Open PRs</p>
                            <h3 className="text-2xl font-bold text-foreground">9</h3>
                        </div>
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><GitPullRequest className="w-5 h-5" /></div>
                    </CardContent>
                </Card>
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
                        {/* Center text overlay */}
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
                                    <AvatarFallback className="text-[10px] bg-primary/20 text-primary">{c.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                                    <p className="text-xs text-muted-foreground">{c.role}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-mono text-primary">{c.commits} commits</div>
                                    <div className="text-[10px] text-green-400">+{c.additions} / -{c.deletions}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Repositories List */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Repositories</h3>
                    <div className="space-y-3">
                        {githubRepos.map((repo) => (
                            <div key={repo.name} className="p-3 bg-muted/10 rounded-lg border border-border/20 hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                        {repo.name}
                                        <Badge variant="secondary" className="text-[10px] py-0 h-5 bg-secondary/10 text-secondary border-none">{repo.language}</Badge>
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

            <div className="grid grid-cols-1 gap-6">
                {/* Recent Commits */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="nebula-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {recentCommits.map((c) => (
                            <motion.div key={c.hash} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/10 transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <GitBranch className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-foreground">{c.message}</p>
                                        <Badge variant="outline" className="text-[10px] h-5 font-mono border-primary/20 text-primary">{c.hash.substring(0, 7)}</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {c.author}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.time}</span>
                                        <span className="flex items-center gap-1 bg-muted/30 px-1.5 rounded text-[10px]">{c.branch}</span>
                                    </div>
                                </div>
                                <div className="text-right text-xs font-mono hidden sm:block">
                                    <span className="text-green-400">+{c.additions}</span>
                                    <span className="mx-1 text-muted-foreground">/</span>
                                    <span className="text-red-400">-{c.deletions}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default GitHubPage;

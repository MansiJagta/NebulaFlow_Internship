import { motion } from 'framer-motion';
import { githubRepos, recentCommits, pullRequests } from '@/data/githubMockData';
import { GitBranch, Star, GitFork, AlertCircle, GitPullRequest, Clock, Plus, Minus } from 'lucide-react';

const GitHubPage = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold nebula-gradient-text">GitHub</h1>
      <p className="text-muted-foreground text-sm">Repository overview & activity</p>
    </motion.div>

    {/* Repos */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {githubRepos.map((repo, i) => (
        <motion.div
          key={repo.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px hsl(187 100% 50% / 0.2)' }}
          className="nebula-card p-5 cursor-pointer"
        >
          <h3 className="font-semibold text-foreground mb-2">{repo.name}</h3>
          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{repo.language}</span>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {repo.stars}</span>
            <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> {repo.forks}</span>
            <span className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {repo.issues}</span>
            <span className="flex items-center gap-1"><GitPullRequest className="w-3.5 h-3.5" /> {repo.prs}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><Clock className="w-3 h-3" /> Last commit: {repo.lastCommit}</p>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Commits */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="nebula-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Commits</h3>
        <div className="space-y-3">
          {recentCommits.map((c, i) => (
            <motion.div key={c.hash} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/10 transition-colors">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{c.message}</p>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="font-mono text-primary">{c.hash}</span>
                  <span>{c.author}</span>
                  <span>{c.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pull Requests */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="nebula-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Pull Requests</h3>
        <div className="space-y-3">
          {pullRequests.map((pr, i) => (
            <motion.div key={pr.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
              className="p-3 rounded-lg border border-border/20 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{pr.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">#{pr.id} by {pr.author} · {pr.created}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${pr.status === 'merged' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                  {pr.status}
                </span>
              </div>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-primary flex items-center gap-0.5"><Plus className="w-3 h-3" />{pr.additions}</span>
                <span className="text-accent flex items-center gap-0.5"><Minus className="w-3 h-3" />{pr.deletions}</span>
                <span className="text-muted-foreground">{pr.reviews} reviews</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

export default GitHubPage;

import KpiCard from '@/components/common/KpiCard';
import ActivityFeed from '@/components/common/ActivityFeed';
import { motion } from 'framer-motion';
import { ListChecks, Users, GitBranch, BarChart3, MessageSquare, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { sprintStats } from '@/data/jiraMockData';

const PMDashboard = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold nebula-gradient-text mb-1">Project Manager Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your team's progress</p>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Active Tasks" value={24} icon={<ListChecks className="w-5 h-5" />} trend={{ value: 12, positive: true }} delay={0} />
        <KpiCard title="Team Members" value={8} icon={<Users className="w-5 h-5" />} delay={0.1} />
        <KpiCard title="Open PRs" value={5} icon={<GitBranch className="w-5 h-5" />} trend={{ value: 3, positive: false }} delay={0.2} />
        <KpiCard title="Sprint Velocity" value={28} suffix="pts" icon={<Zap className="w-5 h-5" />} trend={{ value: 8, positive: true }} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Burndown Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="nebula-card p-5 lg:col-span-2"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Sprint Burndown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={sprintStats.burndown}>
              <defs>
                <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="hsl(233, 30%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(233, 30%, 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'hsl(234, 55%, 18%)', border: '1px solid hsl(257, 60%, 30%)', borderRadius: '8px', color: 'hsl(233, 60%, 92%)' }}
              />
              <Area type="monotone" dataKey="ideal" stroke="hsl(257, 100%, 68%)" strokeDasharray="5 5" fill="none" strokeWidth={2} />
              <Area type="monotone" dataKey="remaining" stroke="hsl(187, 100%, 50%)" fill="url(#burnGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <ActivityFeed />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="nebula-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">16</p>
            <p className="text-xs text-muted-foreground">Unread Messages</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="nebula-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">94%</p>
            <p className="text-xs text-muted-foreground">Sprint Progress</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="nebula-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Commits Today</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PMDashboard;

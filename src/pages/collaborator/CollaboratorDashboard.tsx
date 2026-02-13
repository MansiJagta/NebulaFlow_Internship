import KpiCard from '@/components/common/KpiCard';
import ActivityFeed from '@/components/common/ActivityFeed';
import { motion } from 'framer-motion';
import { ListChecks, Clock, GitBranch, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const taskBreakdown = [
  { name: 'Completed', value: 12, color: 'hsl(187, 100%, 50%)' },
  { name: 'In Progress', value: 5, color: 'hsl(257, 100%, 68%)' },
  { name: 'To Do', value: 7, color: 'hsl(340, 100%, 65%)' },
];

const CollaboratorDashboard = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold nebula-gradient-text mb-1">My Dashboard</h1>
        <p className="text-muted-foreground text-sm">Your personal workspace overview</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="My Tasks" value={7} icon={<ListChecks className="w-5 h-5" />} delay={0} />
        <KpiCard title="Hours Logged" value={32} suffix="h" icon={<Clock className="w-5 h-5" />} trend={{ value: 5, positive: true }} delay={0.1} />
        <KpiCard title="My PRs" value={3} icon={<GitBranch className="w-5 h-5" />} delay={0.2} />
        <KpiCard title="Story Points" value={21} suffix="pts" icon={<Zap className="w-5 h-5" />} trend={{ value: 15, positive: true }} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="nebula-card p-5 lg:col-span-2"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Task Breakdown</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={taskBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {taskBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(234, 55%, 18%)', border: '1px solid hsl(257, 60%, 30%)', borderRadius: '8px', color: 'hsl(233, 60%, 92%)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {taskBreakdown.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm text-foreground">{item.name}</span>
                  <span className="text-sm font-bold text-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        <ActivityFeed />
      </div>
    </div>
  );
};

export default CollaboratorDashboard;

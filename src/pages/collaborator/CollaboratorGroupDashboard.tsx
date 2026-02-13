import { motion } from 'framer-motion';
import KpiCard from '@/components/common/KpiCard';
import { Users, ListChecks, MessageSquare, Zap } from 'lucide-react';

const CollaboratorGroupDashboard = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold nebula-gradient-text">Group Dashboard</h1>
      <p className="text-muted-foreground text-sm">Team-wide overview</p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard title="Team Size" value={8} icon={<Users className="w-5 h-5" />} delay={0} />
      <KpiCard title="Total Tasks" value={42} icon={<ListChecks className="w-5 h-5" />} delay={0.1} />
      <KpiCard title="Messages Today" value={156} icon={<MessageSquare className="w-5 h-5" />} trend={{ value: 23, positive: true }} delay={0.2} />
      <KpiCard title="Sprint Points" value={65} suffix="pts" icon={<Zap className="w-5 h-5" />} delay={0.3} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {['Alice Chen', 'Bob Kumar', 'Carol Davis', 'Dave Wilson', 'Eve Martinez'].map((name, i) => (
        <motion.div
          key={name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.08 }}
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px hsl(257 100% 68% / 0.2)' }}
          className="nebula-card p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full nebula-gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">3 tasks in progress</p>
            <div className="flex gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary">Online</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default CollaboratorGroupDashboard;

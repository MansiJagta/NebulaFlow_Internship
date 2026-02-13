import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const weeklyData = [
  { day: 'Mon', tasks: 5, commits: 8 },
  { day: 'Tue', tasks: 7, commits: 12 },
  { day: 'Wed', tasks: 4, commits: 6 },
  { day: 'Thu', tasks: 9, commits: 15 },
  { day: 'Fri', tasks: 6, commits: 10 },
];

const teamPerf = [
  { member: 'Alice', velocity: 32, quality: 95, collaboration: 88 },
  { member: 'Bob', velocity: 28, quality: 90, collaboration: 92 },
  { member: 'Carol', velocity: 25, quality: 98, collaboration: 85 },
  { member: 'Dave', velocity: 30, quality: 88, collaboration: 90 },
  { member: 'Eve', velocity: 22, quality: 92, collaboration: 95 },
];

const radarData = [
  { skill: 'Speed', value: 85 },
  { skill: 'Quality', value: 92 },
  { skill: 'Collab', value: 88 },
  { skill: 'Innovation', value: 78 },
  { skill: 'Delivery', value: 90 },
];

const chartTooltipStyle = { background: 'hsl(234, 55%, 18%)', border: '1px solid hsl(257, 60%, 30%)', borderRadius: '8px', color: 'hsl(233, 60%, 92%)' };

const PerformancePage = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold nebula-gradient-text">Performance</h1>
      <p className="text-muted-foreground text-sm">Team analytics & insights</p>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="nebula-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="day" stroke="hsl(233, 30%, 55%)" fontSize={12} />
            <YAxis stroke="hsl(233, 30%, 55%)" fontSize={12} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="tasks" fill="hsl(187, 100%, 50%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="commits" fill="hsl(257, 100%, 68%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="nebula-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Team Radar</h3>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(257, 40%, 25%)" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(233, 30%, 55%)', fontSize: 12 }} />
            <Radar dataKey="value" stroke="hsl(187, 100%, 50%)" fill="hsl(187, 100%, 50%)" fillOpacity={0.2} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>

    {/* Team Table */}
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="nebula-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30">
            <th className="text-left p-4 text-muted-foreground font-medium">Member</th>
            <th className="text-left p-4 text-muted-foreground font-medium">Velocity</th>
            <th className="text-left p-4 text-muted-foreground font-medium">Quality</th>
            <th className="text-left p-4 text-muted-foreground font-medium">Collaboration</th>
          </tr>
        </thead>
        <tbody>
          {teamPerf.map((m, i) => (
            <motion.tr key={m.member} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }}
              className="border-b border-border/10 hover:bg-muted/10 transition-colors">
              <td className="p-4 font-medium text-foreground">{m.member}</td>
              <td className="p-4"><span className="text-primary font-mono">{m.velocity} pts</span></td>
              <td className="p-4"><span className="text-secondary font-mono">{m.quality}%</span></td>
              <td className="p-4"><span className="text-accent font-mono">{m.collaboration}%</span></td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  </div>
);

export default PerformancePage;

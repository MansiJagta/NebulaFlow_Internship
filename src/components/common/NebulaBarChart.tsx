import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface NebulaBarChartProps {
  data: Record<string, unknown>[];
  dataKey: string;
  xKey: string;
  title?: string;
  color?: string;
  height?: number;
}

const NebulaBarChart = ({ data, dataKey, xKey, title, color = 'hsl(187 100% 50%)', height = 300 }: NebulaBarChartProps) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    {title && <h4 className="text-sm font-medium text-foreground mb-3">{title}</h4>}
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(257 60% 30% / 0.2)" />
        <XAxis dataKey={xKey} stroke="hsl(233 30% 55%)" fontSize={12} />
        <YAxis stroke="hsl(233 30% 55%)" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: 'hsl(234 55% 18%)',
            border: '1px solid hsl(257 60% 30% / 0.5)',
            borderRadius: '8px',
            color: 'hsl(233 60% 92%)',
            fontSize: '12px',
          }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} animationDuration={800} />
      </BarChart>
    </ResponsiveContainer>
  </motion.div>
);

export default NebulaBarChart;

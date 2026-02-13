import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  title?: string;
  size?: number;
}

const NEBULA_COLORS = [
  'hsl(187 100% 50%)',
  'hsl(257 100% 68%)',
  'hsl(340 100% 65%)',
  'hsl(160 80% 50%)',
  'hsl(45 100% 60%)',
];

const DonutChart = ({ data, title, size = 200 }: DonutChartProps) => {
  const coloredData = data.map((d, i) => ({
    ...d,
    color: d.color || NEBULA_COLORS[i % NEBULA_COLORS.length],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      {title && <h4 className="text-sm font-medium text-foreground mb-3">{title}</h4>}
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={coloredData}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.3}
            outerRadius={size * 0.42}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {coloredData.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'hsl(234 55% 18%)',
              border: '1px solid hsl(257 60% 30% / 0.5)',
              borderRadius: '8px',
              color: 'hsl(233 60% 92%)',
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {coloredData.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            {d.name}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default DonutChart;

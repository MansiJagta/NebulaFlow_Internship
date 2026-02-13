import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['hsl(187 100% 50%)', 'hsl(257 100% 68%)', 'hsl(340 100% 65%)'];

const NebulaLineChart = ({ data, lines, xKey, title, height = 300 }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {title && <h4 className="text-sm font-medium text-foreground mb-3">{title}</h4>}
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
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
                {lines.map((line, i) => (
                    <Line
                        key={line.dataKey}
                        type="monotone"
                        dataKey={line.dataKey}
                        stroke={line.color || COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={{ fill: line.color || COLORS[i % COLORS.length], r: 3 }}
                        activeDot={{ r: 5 }}
                        name={line.name || line.dataKey}
                        animationDuration={800}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    </motion.div>
);

export default NebulaLineChart;

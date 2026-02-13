import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['hsl(187 100% 50%)', 'hsl(257 100% 68%)', 'hsl(340 100% 65%)', 'hsl(160 80% 50%)', 'hsl(45 100% 60%)'];

const NebulaPieChart = ({ data, title, size = 250 }) => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
        {title && <h4 className="text-sm font-medium text-foreground mb-3">{title}</h4>}
        <ResponsiveContainer width={size} height={size}>
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" outerRadius={size * 0.38} dataKey="value" animationDuration={800}>
                    {data.map((d, i) => (
                        <Cell key={i} fill={d.color || COLORS[i % COLORS.length]} stroke="transparent" />
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
    </motion.div>
);

export default NebulaPieChart;

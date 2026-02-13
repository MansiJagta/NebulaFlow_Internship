import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const KpiCard = ({ title, value, suffix = '', icon, trend, delay = 0 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [value]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, type: 'spring', stiffness: 100, damping: 15 }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 25px hsl(257 100% 68% / 0.3)' }}
            className="nebula-card p-5 cursor-default"
        >
            <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">{title}</span>
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {icon}
                </div>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-foreground">{count}{suffix}</span>
                {trend && (
                    <span className={`text-xs font-medium mb-1 ${trend.positive ? 'text-primary' : 'text-accent'}`}>
                        {trend.positive ? '↑' : '↓'} {trend.value}%
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export default KpiCard;

import React from 'react';
import {
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart as RechartsLineChart,
    Line,
} from 'recharts';
import { motion } from 'framer-motion';

// Cosmic Theme Colors
const COLORS = [
    'hsl(var(--nebula-cyan))',
    'hsl(var(--nebula-purple))',
    'hsl(var(--nebula-pink))',
    'hsl(var(--nebula-deep))', // Assuming this exists or falls back
    '#4ade80', // Green for success
    '#fbbf24', // Amber for warning
];

// --- Mock Data ---
const piedata = [
    { name: 'Completed', value: 400 },
    { name: 'In Progress', value: 300 },
    { name: 'To Do', value: 300 },
    { name: 'Blocked', value: 200 },
];

const bardata = [
    { name: 'Jan', tasks: 40, bugs: 24, amt: 2400 },
    { name: 'Feb', tasks: 30, bugs: 13, amt: 2210 },
    { name: 'Mar', tasks: 20, bugs: 58, amt: 2290 },
    { name: 'Apr', tasks: 27, bugs: 39, amt: 2000 },
    { name: 'May', tasks: 18, bugs: 48, amt: 2181 },
    { name: 'Jun', tasks: 23, bugs: 38, amt: 2500 },
    { name: 'Jul', tasks: 34, bugs: 43, amt: 2100 },
];

const linedata = [
    { name: 'Mon', speed: 4000, efficiency: 2400 },
    { name: 'Tue', speed: 3000, efficiency: 1398 },
    { name: 'Wed', speed: 2000, efficiency: 5800 },
    { name: 'Thu', speed: 2780, efficiency: 3908 },
    { name: 'Fri', speed: 1890, efficiency: 4800 },
    { name: 'Sat', speed: 2390, efficiency: 3800 },
    { name: 'Sun', speed: 3490, efficiency: 4300 },
];

const ganttData = [
    { id: 1, name: 'Project Planning', start: 1, end: 3, type: 'planning' },
    { id: 2, name: 'Design Phase', start: 3, end: 6, type: 'design' },
    { id: 3, name: 'Development', start: 5, end: 10, type: 'dev' },
    { id: 4, name: 'Testing', start: 9, end: 12, type: 'test' },
    { id: 5, name: 'Deployment', start: 12, end: 14, type: 'deploy' },
];

// --- Components ---

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/80 backdrop-blur-md border border-border/50 p-3 rounded-lg shadow-xl">
                <p className="font-semibold text-foreground mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const DonutChart = () => {
    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie
                        data={piedata}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {piedata.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const PieChart = () => {
    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie
                        data={piedata}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                        stroke="none"
                    >
                        {piedata.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const BarChart = () => {
    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={bardata} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.2)' }} />
                    <Legend />
                    <Bar dataKey="tasks" fill="hsl(var(--nebula-cyan))" radius={[4, 4, 0, 0]} animationDuration={1500} />
                    <Bar dataKey="bugs" fill="hsl(var(--nebula-pink))" radius={[4, 4, 0, 0]} animationDuration={1500} />
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const LineChart = () => {
    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={linedata} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="speed"
                        stroke="hsl(var(--nebula-cyan))"
                        strokeWidth={3}
                        dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        animationDuration={2000}
                    />
                    <Line
                        type="monotone"
                        dataKey="efficiency"
                        stroke="hsl(var(--nebula-purple))"
                        strokeWidth={3}
                        dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        animationDuration={2000}
                    />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const GanttChart = () => {
    return (
        <div className="w-full h-[300px] overflow-hidden flex flex-col gap-2 p-4 bg-muted/10 rounded-xl border border-border/30">
            <div className="flex justify-between text-xs text-muted-foreground mb-2 px-2">
                <span>Start</span>
                <span>Week 1</span>
                <span>Week 2</span>
                <span>End</span>
            </div>
            <div className="space-y-4 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                    <div className="w-px h-full bg-foreground"></div>
                    <div className="w-px h-full bg-foreground"></div>
                    <div className="w-px h-full bg-foreground"></div>
                    <div className="w-px h-full bg-foreground"></div>
                </div>

                {ganttData.map((task, index) => {
                    const width = ((task.end - task.start) / 14) * 100;
                    const left = (task.start / 14) * 100;
                    const color = COLORS[index % COLORS.length];

                    return (
                        <div key={task.id} className="relative h-8 flex items-center">
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: `${width}%`, opacity: 1 }}
                                transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                                className="absolute h-6 rounded-full shadow-lg flex items-center px-3 overflow-hidden whitespace-nowrap"
                                style={{
                                    left: `${left}%`,
                                    backgroundColor: color,
                                    boxShadow: `0 0 10px ${color}` // glow effect
                                }}
                            >
                                <span className="text-xs font-bold text-white drop-shadow-md">{task.name}</span>
                            </motion.div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

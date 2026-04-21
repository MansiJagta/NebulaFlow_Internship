import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_COLORS = ['#00e5ff', '#a855f7', '#f43f5e', '#22c55e', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'];

// Helper: compute pixel-level positioning for a date range against a timeline window
function barStyle(start, end, timelineStart, timelineEnd) {
    const totalMs = timelineEnd - timelineStart;
    if (totalMs <= 0) return { left: '0%', width: '0%' };
    const leftMs = Math.max(0, start - timelineStart);
    const rightMs = Math.min(totalMs, end - timelineStart);
    const left = (leftMs / totalMs) * 100;
    const width = Math.max(0, ((rightMs - leftMs) / totalMs) * 100);
    return { left: `${left}%`, width: `${width}%` };
}

function formatDate(d) {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function toInputDate(d) {
    if (!d) return '';
    const date = new Date(d);
    return date.toISOString().split('T')[0];
}

const MilestoneGanttChart = ({ isPm = false }) => {
    const { token } = useAuth();
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        name: '',
        expectedStartDate: '',
        expectedEndDate: '',
        actualStartDate: '',
        actualEndDate: '',
        progress: 0,
        color: DEFAULT_COLORS[0],
    });

    const authHeaders = useMemo(() => {
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, [token]);

    const loadMilestones = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/milestones`, {
                headers: authHeaders,
                withCredentials: true,
            });
            setMilestones(res.data);
        } catch (err) {
            console.error('[GanttChart] failed to load milestones', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMilestones();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Compute timeline boundaries: earliest expected start to latest expected end
    const { timelineStart, timelineEnd, weekLabels } = useMemo(() => {
        if (!milestones.length) {
            const now = new Date();
            const s = new Date(now); s.setDate(s.getDate() - 14);
            const e = new Date(now); e.setDate(e.getDate() + 21);
            return { timelineStart: s.getTime(), timelineEnd: e.getTime(), weekLabels: [] };
        }
        const allDates = milestones.flatMap(m => [
            new Date(m.expectedStartDate).getTime(),
            new Date(m.expectedEndDate).getTime(),
            ...(m.actualStartDate ? [new Date(m.actualStartDate).getTime()] : []),
            ...(m.actualEndDate ? [new Date(m.actualEndDate).getTime()] : []),
        ]);
        const minDate = Math.min(...allDates) - 2 * 86400000; // 2-day padding
        const maxDate = Math.max(...allDates) + 2 * 86400000;

        // Generate week labels
        const labels = [];
        let cursor = new Date(minDate);
        while (cursor.getTime() < maxDate) {
            labels.push(formatDate(cursor));
            cursor = new Date(cursor.getTime() + 7 * 86400000);
        }

        return { timelineStart: minDate, timelineEnd: maxDate, weekLabels: labels };
    }, [milestones]);

    const resetForm = () => {
        setForm({
            name: '',
            expectedStartDate: '',
            expectedEndDate: '',
            actualStartDate: '',
            actualEndDate: '',
            progress: 0,
            color: DEFAULT_COLORS[milestones.length % DEFAULT_COLORS.length],
        });
        setEditingId(null);
    };

    const handleSave = async () => {
        try {
            const payload = {
                name: form.name,
                expectedStartDate: form.expectedStartDate,
                expectedEndDate: form.expectedEndDate,
                actualStartDate: form.actualStartDate || null,
                actualEndDate: form.actualEndDate || null,
                progress: Number(form.progress),
                color: form.color,
            };

            if (editingId) {
                const res = await axios.patch(
                    `${API_BASE_URL}/milestones/${editingId}`,
                    payload,
                    { headers: authHeaders, withCredentials: true }
                );
                setMilestones(prev => prev.map(m => m._id === editingId ? res.data : m));
            } else {
                // For now, hardcode workspaceId from the first milestone or use a fallback
                const workspaceId = milestones[0]?.workspaceId || 'default';
                const res = await axios.post(
                    `${API_BASE_URL}/milestones`,
                    { ...payload, workspaceId },
                    { headers: authHeaders, withCredentials: true }
                );
                setMilestones(prev => [...prev, res.data]);
            }

            setIsCreateOpen(false);
            resetForm();
        } catch (err) {
            console.error('[GanttChart] save failed', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/milestones/${id}`, {
                headers: authHeaders,
                withCredentials: true,
            });
            setMilestones(prev => prev.filter(m => m._id !== id));
        } catch (err) {
            console.error('[GanttChart] delete failed', err);
        }
    };

    const openEdit = (milestone) => {
        setForm({
            name: milestone.name,
            expectedStartDate: toInputDate(milestone.expectedStartDate),
            expectedEndDate: toInputDate(milestone.expectedEndDate),
            actualStartDate: toInputDate(milestone.actualStartDate),
            actualEndDate: toInputDate(milestone.actualEndDate),
            progress: milestone.progress || 0,
            color: milestone.color || DEFAULT_COLORS[0],
        });
        setEditingId(milestone._id);
        setIsCreateOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">Project Gantt Chart</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-2 rounded-sm opacity-40 bg-foreground" />
                            Expected
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-2 rounded-sm bg-foreground" />
                            Actual
                        </span>
                    </div>
                </div>
                {isPm && (
                    <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="gradient">
                                <Plus className="w-4 h-4 mr-1" />
                                Add Phase
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{editingId ? 'Edit Phase' : 'New Gantt Phase'}</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Define the expected timeline. Actual dates track real progress.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 gap-3 mt-2">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Phase Name</label>
                                    <Input
                                        value={form.name}
                                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Frontend Development"
                                        className="mt-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Expected Start</label>
                                        <Input
                                            type="date"
                                            value={form.expectedStartDate}
                                            onChange={e => setForm(prev => ({ ...prev, expectedStartDate: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Expected End</label>
                                        <Input
                                            type="date"
                                            value={form.expectedEndDate}
                                            onChange={e => setForm(prev => ({ ...prev, expectedEndDate: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Actual Start <span className="text-muted-foreground/60">(optional)</span></label>
                                        <Input
                                            type="date"
                                            value={form.actualStartDate}
                                            onChange={e => setForm(prev => ({ ...prev, actualStartDate: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Actual End <span className="text-muted-foreground/60">(optional)</span></label>
                                        <Input
                                            type="date"
                                            value={form.actualEndDate}
                                            onChange={e => setForm(prev => ({ ...prev, actualEndDate: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Progress (%)</label>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={form.progress}
                                            onChange={e => setForm(prev => ({ ...prev, progress: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Color</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="color"
                                                value={form.color}
                                                onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                                                className="w-8 h-8 rounded border border-border/30 cursor-pointer bg-transparent"
                                            />
                                            <span className="text-xs text-muted-foreground font-mono">{form.color}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>Cancel</Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={!form.name.trim() || !form.expectedStartDate || !form.expectedEndDate}
                                >
                                    {editingId ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Gantt Grid */}
            <div className="bg-muted/10 rounded-xl border border-border/30 overflow-hidden">
                {/* Timeline Header */}
                <div className="flex border-b border-border/20">
                    <div className="w-44 shrink-0 p-3 text-xs font-semibold text-muted-foreground uppercase border-r border-border/20">
                        Phase
                    </div>
                    <div className="flex-1 flex">
                        {weekLabels.map((label, i) => (
                            <div
                                key={i}
                                className="flex-1 text-center text-[10px] text-muted-foreground py-2 border-r border-border/10 last:border-r-0"
                            >
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Milestone Rows */}
                {milestones.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                        No phases yet. {isPm ? 'Click "Add Phase" to start planning.' : 'The PM will add project phases.'}
                    </div>
                ) : (
                    milestones.map((milestone, index) => {
                        const color = milestone.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

                        const expectedBar = barStyle(
                            new Date(milestone.expectedStartDate).getTime(),
                            new Date(milestone.expectedEndDate).getTime(),
                            timelineStart,
                            timelineEnd
                        );

                        const hasActual = milestone.actualStartDate;
                        const actualEnd = milestone.actualEndDate
                            ? new Date(milestone.actualEndDate).getTime()
                            : Date.now(); // If still in progress, extend to today
                        const actualBar = hasActual
                            ? barStyle(
                                new Date(milestone.actualStartDate).getTime(),
                                actualEnd,
                                timelineStart,
                                timelineEnd
                            )
                            : null;

                        // Detect delay: actual end exceeds expected end
                        const isDelayed = hasActual &&
                            actualEnd > new Date(milestone.expectedEndDate).getTime();

                        return (
                            <div
                                key={milestone._id}
                                className="flex border-b border-border/10 last:border-b-0 hover:bg-muted/5 transition-colors group"
                            >
                                {/* Phase name column */}
                                <div className="w-44 shrink-0 p-3 flex items-center gap-2 border-r border-border/20">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="text-xs text-foreground font-medium truncate flex-1">
                                        {milestone.name}
                                    </span>
                                    {isPm && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEdit(milestone)}
                                                className="p-0.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(milestone._id)}
                                                className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Bar area */}
                                <div className="flex-1 relative h-16 flex flex-col justify-center gap-1 px-1">
                                    {/* Vertical grid lines */}
                                    <div className="absolute inset-0 flex pointer-events-none">
                                        {weekLabels.map((_, i) => (
                                            <div key={i} className="flex-1 border-r border-border/10 last:border-r-0" />
                                        ))}
                                    </div>

                                    {/* Today indicator */}
                                    {(() => {
                                        const todayPct = ((Date.now() - timelineStart) / (timelineEnd - timelineStart)) * 100;
                                        if (todayPct >= 0 && todayPct <= 100) {
                                            return (
                                                <div
                                                    className="absolute top-0 bottom-0 w-px bg-primary/50 z-10"
                                                    style={{ left: `${todayPct}%` }}
                                                />
                                            );
                                        }
                                        return null;
                                    })()}

                                    {/* Expected bar (translucent) */}
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: expectedBar.width, opacity: 1 }}
                                        transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                                        className="absolute h-5 rounded-full z-[1]"
                                        style={{
                                            left: expectedBar.left,
                                            backgroundColor: color,
                                            opacity: 0.25,
                                            top: '12px',
                                        }}
                                        title={`Expected: ${formatDate(milestone.expectedStartDate)} – ${formatDate(milestone.expectedEndDate)}`}
                                    />

                                    {/* Actual bar (solid) */}
                                    {actualBar && (
                                        <motion.div
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: actualBar.width, opacity: 1 }}
                                            transition={{ duration: 0.8, delay: index * 0.1 + 0.15, ease: 'easeOut' }}
                                            className={`absolute h-5 rounded-full z-[2] flex items-center px-2 overflow-hidden ${isDelayed ? 'ring-1 ring-red-500/50' : ''}`}
                                            style={{
                                                left: actualBar.left,
                                                backgroundColor: color,
                                                top: '33px',
                                                boxShadow: `0 0 12px ${color}40`,
                                            }}
                                            title={`Actual: ${formatDate(milestone.actualStartDate)} – ${milestone.actualEndDate ? formatDate(milestone.actualEndDate) : 'In Progress'}`}
                                        >
                                            <span className="text-[9px] font-bold text-white drop-shadow-md whitespace-nowrap">
                                                {milestone.progress}%
                                            </span>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Legend / Status Summary */}
            {milestones.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground px-1">
                    <span className="flex items-center gap-1.5">
                        <div className="w-px h-4 bg-primary/50" />
                        Today
                    </span>
                    {milestones.some(m => m.actualStartDate && (m.actualEndDate ? new Date(m.actualEndDate).getTime() : Date.now()) > new Date(m.expectedEndDate).getTime()) && (
                        <span className="flex items-center gap-1.5 text-red-400">
                            <div className="w-3 h-2 rounded-sm bg-red-500/30 ring-1 ring-red-500/50" />
                            Delayed
                        </span>
                    )}
                    <span className="ml-auto text-muted-foreground/50">
                        {milestones.length} phase{milestones.length !== 1 ? 's' : ''} · {milestones.filter(m => m.progress === 100).length} completed
                    </span>
                </div>
            )}
        </div>
    );
};

export default MilestoneGanttChart;

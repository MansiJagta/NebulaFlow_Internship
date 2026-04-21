import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { priorityColors } from '@/data/jiraMockData';
import { Calendar as CalendarIcon, Clock, Users, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TaskEditModal from './TaskEditModal';
import MeetingDetailModal from './MeetingDetailModal';
import MilestoneDetailModal from './MilestoneDetailModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CalendarView = ({ issues, sprints = [], users = [] }) => {
    const { token } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    // Modal states
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [selectedMilestone, setSelectedMilestone] = useState(null);

    const moveMonth = (offset) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const authHeaders = useMemo(() => {
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, [token]);

    const loadEvents = async () => {
        try {
            const [meetRes, mileRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/meetings`, { headers: authHeaders, withCredentials: true }),
                axios.get(`${API_BASE_URL}/milestones`, { headers: authHeaders, withCredentials: true })
            ]);
            setMeetings(meetRes.data);
            setMilestones(mileRes.data);
        } catch (err) {
            console.error('[CalendarView] failed to load events', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [authHeaders]);

    // Construct the calendar grid dates for current month (6 weeks with previous/next month padding)
    const { calendarDays, eventsMap } = useMemo(() => {
        const firstOfMonth = new Date(currentMonth);
        firstOfMonth.setHours(0, 0, 0, 0);

        const startDay = new Date(firstOfMonth);
        startDay.setDate(startDay.getDate() - startDay.getDay());

        const days = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(startDay);
            d.setDate(d.getDate() + i);
            d.setHours(0, 0, 0, 0);
            days.push(d);
        }

        // Map events to date strings Native M-D-Y or ISO YYYY-MM-DD
        const map = {};
        const safeDateStr = (dateObj) => new Date(dateObj).toISOString().split('T')[0];

        // 1. Map Milestones
        milestones.forEach(m => {
            let curr = new Date(m.startDate || m.expectedStartDate); // support old or new format
            const end = new Date(m.endDate || m.expectedEndDate);
            while (curr <= end) {
                const ds = safeDateStr(curr);
                if (!map[ds]) map[ds] = [];
                map[ds].push({ type: 'milestone', data: m });
                curr.setDate(curr.getDate() + 1);
            }
        });

        // 2. Map Meetings
        meetings.forEach(m => {
            const ds = safeDateStr(m.startTime);
            if (!map[ds]) map[ds] = [];
            map[ds].push({ type: 'meeting', data: m });
        });

        // 3. Map Issues (Deadlines) - only active tasks & let dueDate show
        issues
            .filter(issue => issue.dueDate)
            .forEach(issue => {
                const due = new Date(issue.dueDate);
                if (Number.isNaN(due.getTime())) return;

                // Use only date part to avoid TZ offset shift
                const ds = `${due.getFullYear().toString().padStart(4, '0')}-${(due.getMonth() + 1).toString().padStart(2, '0')}-${due.getDate().toString().padStart(2, '0')}`;
                if (!map[ds]) map[ds] = [];
                map[ds].push({ type: 'issue', data: issue });
            });

        return { calendarDays: days, eventsMap: map };
    }, [milestones, meetings, issues]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-full bg-card rounded-xl border border-border/30 overflow-hidden shadow-sm">
                {/* Header / Days of Week */}
                <div className="flex items-center justify-between p-3 border-b border-border/30 bg-muted/20">
                    <div className="flex items-center gap-2">
                        <button onClick={() => moveMonth(-1)} className="px-2 py-1 rounded border border-border/30 hover:bg-muted/40">‹</button>
                        <span className="text-sm font-semibold">{currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => moveMonth(1)} className="px-2 py-1 rounded border border-border/30 hover:bg-muted/40">›</button>
                    </div>
                    <div className="grid grid-cols-7 gap-0 w-full max-w-lg text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="p-1">{d}</div>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-border/20 overflow-y-auto">
                    {calendarDays.map((day, i) => {
                        const dateStr = day.toISOString().split('T')[0];
                        const todayStr = new Date().toISOString().split('T')[0];
                        const isToday = dateStr === todayStr;
                        const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                        const dayEvents = eventsMap[dateStr] || [];

                        return (
                            <div key={i} className={`min-h-[120px] bg-card p-2 hover:bg-muted/5 transition-colors flex flex-col gap-1 overflow-hidden group ${!isCurrentMonth ? 'opacity-50' : ''}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground font-bold shadow-md' : 'text-muted-foreground font-medium group-hover:text-foreground'}`}>
                                        {day.getDate()}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{dayEvents.length}</span>
                                    )}
                                </div>

                                <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 stylish-scrollbar">
                                    {dayEvents.map((ev, idx) => {
                                        if (ev.type === 'milestone') {
                                            return (
                                                <div
                                                    key={`m-${ev.data._id}-${idx}`}
                                                    onClick={() => setSelectedMilestone(ev.data)}
                                                    className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-1 rounded-md border-l-2 border-purple-500 truncate flex items-center gap-1 cursor-pointer hover:bg-purple-500/20 transition-colors"
                                                    title={ev.data.name}
                                                >
                                                    <Flag className="w-3 h-3 shrink-0" />
                                                    <span className="truncate font-medium">{ev.data.name}</span>
                                                </div>
                                            );
                                        }
                                        if (ev.type === 'meeting') {
                                            const timeStr = new Date(ev.data.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            return (
                                                <div
                                                    key={`meet-${ev.data._id}`}
                                                    onClick={() => setSelectedMeeting(ev.data)}
                                                    className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-1 rounded-md border-l-2 border-blue-500 truncate flex items-center gap-1 cursor-pointer hover:bg-blue-500/20 transition-colors"
                                                    title={`${ev.data.title} at ${timeStr}`}
                                                >
                                                    <Clock className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{timeStr} {ev.data.title}</span>
                                                </div>
                                            );
                                        }
                                        if (ev.type === 'issue') {
                                            return (
                                                <div
                                                    key={`iss-${ev.data._id}`}
                                                    onClick={() => setSelectedTask(ev.data)}
                                                    className="text-[10px] bg-muted/50 text-foreground px-1.5 py-1 rounded-md border border-border/40 truncate flex items-center gap-1.5 cursor-pointer hover:border-primary/50 hover:bg-background shadow-xs transition-colors"
                                                    title={ev.data.title}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full bg-[var(--color)]`} style={{ '--color': priorityColors[ev.data.priority]?.includes('red') ? '#ef4444' : priorityColors[ev.data.priority]?.includes('yellow') ? '#f59e0b' : '#3b82f6' }} />
                                                    <span className="font-mono text-muted-foreground mr-0.5">{ev.data.issueKey}</span>
                                                    <span className="truncate">{ev.data.title}</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="p-3 border-t border-border/30 bg-muted/10 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-purple-500/20 ring-1 ring-purple-500/50" /> Milestone</span>
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-500/20 ring-1 ring-blue-500/50" /> Meeting</span>
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-muted ring-1 ring-border" /> Task Deadline</span>
                </div>
            </div>

            {/* Modals */}
            <TaskEditModal
                isOpen={!!selectedTask}
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={loadEvents}
                sprints={sprints}
                users={users}
            />

            <MeetingDetailModal
                isOpen={!!selectedMeeting}
                meeting={selectedMeeting}
                onClose={() => setSelectedMeeting(null)}
                onUpdate={loadEvents}
                users={users}
            />

            <MilestoneDetailModal
                isOpen={!!selectedMilestone}
                milestone={selectedMilestone}
                onClose={() => setSelectedMilestone(null)}
                onUpdate={loadEvents}
            />
        </>
    );
};

export default CalendarView;

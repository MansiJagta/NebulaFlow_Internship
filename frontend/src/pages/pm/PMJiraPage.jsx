import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { statusColumns, statusLabels, priorityColors, typeIcons, SPRINT_DURATION_DAYS } from '@/data/jiraMockData';
import { List, LayoutGrid, Calendar as CalendarIcon, GanttChart as GanttIcon, Search, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GanttChart, DonutChart } from '@/components/common/Charts';
import { useAuth } from '@/contexts/AuthContext';

// --- DND Components ---
const SortableTicket = ({ ticket }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ticket.issueKey });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <JiraCard ticket={ticket} />
        </div>
    );
};

const JiraCard = ({ ticket, isOverlay }) => (
    <div className={`p-3 bg-card rounded-lg border border-border/40 shadow-sm hover:border-primary/40 cursor-grab active:cursor-grabbing group transition-all ${isOverlay ? 'shadow-xl rotate-2 scale-105 border-primary' : ''}`}>
        <div className="flex flex-col gap-2 mb-2">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">{ticket.title}</p>
                <Badge variant="outline" className="text-[10px] font-medium px-2 py-1">
                    {ticket.sprint || 'Backlog'}
                </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-1 rounded">{ticket.issueKey}</span>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                {ticket.dueDate && (
                    <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                        Due {ticket.dueDate}
                    </span>
                )}
            </div>
        </div>

        {ticket.description && (
            <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
                {ticket.description}
            </p>
        )}

        <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5">
                <span className="text-sm">{typeIcons[ticket.type]}</span>
                {ticket.type === 'story' && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                {ticket.type === 'bug' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                {ticket.type === 'task' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                <span className="text-[10px] text-muted-foreground">{ticket.reporter}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs bg-muted/40 text-muted-foreground px-1.5 rounded min-w-[20px] text-center">{ticket.storyPoints}</span>
                <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 border-2 border-background">
                        <AvatarFallback className="text-[10px] bg-secondary/20 text-secondary font-bold">
                            {((ticket.assigneeUser?.fullName || 'Unassigned').split(' ').map(n => n[0]).join(''))}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{ticket.assigneeUser?.fullName || 'Unassigned'}</span>
                </div>
            </div>
        </div>
    </div>
);

// --- Main Page Component ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const JiraPage = () => {
    const { token } = useAuth();
    const [view, setView] = useState('board');
    const [items, setItems] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [sprints, setSprints] = useState([]);

    const [form, setForm] = useState({
        title: '',
        description: '',
        assigneeUserId: '',
        priority: 'medium',
        type: 'task',
        points: 3,
        sprintId: 'none',
        status: 'backlog',
        dueDate: '',
    });

    const authHeaders = useMemo(() => {
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, [token]);

    const loadData = async () => {
        try {
            const [usersRes, issuesRes, sprintsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/pm/users`, { headers: authHeaders, withCredentials: true }),
                axios.get(`${API_BASE_URL}/api/pm/issues`, { headers: authHeaders, withCredentials: true }),
                axios.get(`${API_BASE_URL}/api/pm/sprints`, { headers: authHeaders, withCredentials: true }),
            ]);

            setUsers(usersRes.data);
            setItems(issuesRes.data);
            setSprints(sprintsRes.data);

            if (usersRes.data.length && !form.assigneeUserId) {
                setForm(prev => ({ ...prev, assigneeUserId: usersRes.data[0]._id }));
            }
            if (sprintsRes.data.length && (form.sprintId === 'none' || !form.sprintId)) {
                const active = sprintsRes.data.find(s => s.isActive) || sprintsRes.data[0];
                if (active) setForm(prev => ({ ...prev, sprintId: active._id }));
            }
        } catch (err) {
            console.error('[PMJiraPage] loadData failed', err);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const collaborators = useMemo(() => {
        return users.filter(u => u.role === 'collaborator' || u.role === 'pm');
    }, [users]);

    const activeSprint = useMemo(() => {
        return sprints.find(s => s.isActive) || sprints[0] || null;
    }, [sprints]);

    const filteredItems = items.filter(
        t =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.issueKey?.toLowerCase().includes(search.toLowerCase())
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event) => setActiveId(event.active.id);

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) { setActiveId(null); return; }

        const activeId = active.id;
        const overId = over.id;

        // Drop on column logic
        if (statusColumns.includes(overId) || items.find(i => i.issueKey === overId)) {
            let newStatus = overId;
            // If dropped on an item, get that item's status
            const overItem = items.find(i => i.issueKey === overId);
            if (overItem) newStatus = overItem.status;

            setItems(prev => prev.map(t =>
                t.issueKey === activeId ? { ...t, status: newStatus } : t
            ));

            try {
                const ticket = items.find(t => t.issueKey === activeId);
                if (ticket) {
                    await axios.patch(
                        `${API_BASE_URL}/api/pm/issues/${ticket._id}`,
                        { status: newStatus },
                        { headers: authHeaders, withCredentials: true }
                    );
                }
            } catch (err) {
                console.error('[PMJiraPage] failed to update issue status', err);
            }
        }
        setActiveId(null);
    };

    const handleCreateTicket = async () => {
        try {
            const payload = {
                title: form.title,
                description: form.description,
                assigneeUserId: form.assigneeUserId || null,
                priority: form.priority,
                type: form.type,
                storyPoints: form.points,
                sprintId: form.sprintId && form.sprintId !== 'none' ? form.sprintId : null,
                status: form.status,
                dueDate: form.dueDate,
            };

            const res = await axios.post(
                `${API_BASE_URL}/api/pm/issues`,
                payload,
                { headers: authHeaders, withCredentials: true }
            );

            setItems(prev => [res.data, ...prev]);
            setIsCreateOpen(false);
            setForm(prev => ({
                ...prev,
                title: '',
                description: '',
                points: 3,
                status: 'backlog',
            }));
        } catch (err) {
            console.error('[PMJiraPage] create ticket failed', err);
        }
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Header Area */}
            <div className="flex flex-col gap-4 pb-4 border-b border-border/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex flex-wrap items-center gap-2">
                            Sprint 14 Board
                            <span className="text-xs font-normal text-muted-foreground bg-muted/20 px-2 py-1 rounded-full">{activeSprint?.name ?? 'Sprint 14'}</span>
                            <span className="text-xs font-normal text-muted-foreground bg-muted/20 px-2 py-1 rounded-full">{SPRINT_DURATION_DAYS}-day sprint</span>
                            {activeSprint && (
                                <span className="text-xs font-normal text-muted-foreground bg-muted/20 px-2 py-1 rounded-full">
                                    {new Date(activeSprint.startsOn).toLocaleDateString()} - {new Date(activeSprint.endsOn).toLocaleDateString()}
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-muted-foreground">Nebula Flow / NEB Board</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center -space-x-2">
                            {['Alice', 'Bob', 'Carol'].map((u, i) => (
                                <Avatar key={u} className="w-8 h-8 border-2 border-background cursor-pointer hover:z-10 transition-transform hover:scale-110">
                                    <AvatarFallback className={`text-xs ${i === 0 ? 'bg-red-500/20 text-red-500' : i === 1 ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>{u[0]}</AvatarFallback>
                                </Avatar>
                            ))}
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground border-2 border-background z-0">+2</div>
                        </div>
                        <Button size="sm" className="bg-muted/30 text-foreground hover:bg-muted/50">Complete Sprint</Button>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="gradient"><Plus className="w-4 h-4 mr-1" /> Create</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>New Jira Issue</DialogTitle>
                                    <DialogDescription className="text-sm text-muted-foreground">
                                        Create and assign a task to your team. Sprint length is {SPRINT_DURATION_DAYS} days.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 gap-3 mt-4">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Title</label>
                                        <Input
                                            value={form.title}
                                            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Issue title"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Description</label>
                                        <Textarea
                                            value={form.description}
                                            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Short summary of the issue"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Assignee</label>
                                            <Select
                                                value={form.assigneeUserId}
                                                onValueChange={value => setForm(prev => ({ ...prev, assigneeUserId: value }))}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {collaborators.length > 0 ? (
                                                        collaborators.map(user => (
                                                            <SelectItem key={user._id} value={user._id}>
                                                                {user.fullName}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="none" disabled>
                                                            No collaborators available
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Sprint</label>
                                            <Select
                                                value={form.sprintId}
                                                onValueChange={value => setForm(prev => ({ ...prev, sprintId: value }))}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Sprint" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sprints.map(s => (
                                                        <SelectItem key={s._id} value={s._id}>
                                                            {s.name}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="none">Backlog</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Priority</label>
                                            <Select
                                                value={form.priority}
                                                onValueChange={value => setForm(prev => ({ ...prev, priority: value }))}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="low">Low</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Type</label>
                                            <Select
                                                value={form.type}
                                                onValueChange={value => setForm(prev => ({ ...prev, type: value }))}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="story">Story</SelectItem>
                                                    <SelectItem value="task">Task</SelectItem>
                                                    <SelectItem value="bug">Bug</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Points</label>
                                            <Input
                                                type="number"
                                                value={form.points}
                                                onChange={e => setForm(prev => ({ ...prev, points: Number(e.target.value || 0) }))}
                                                className="mt-1"
                                                min={0}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Due date</label>
                                            <Input
                                                type="date"
                                                value={form.dueDate}
                                                onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground">Status</label>
                                            <Select
                                                value={form.status}
                                                onValueChange={value => setForm(prev => ({ ...prev, status: value }))}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statusColumns.map(col => (
                                                        <SelectItem key={col} value={col}>
                                                            {statusLabels[col]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button
                                        onClick={handleCreateTicket}
                                        disabled={!form.title.trim() || !form.assigneeUserId || form.assigneeUserId === 'none'}
                                    >
                                        Create
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1 max-w-md relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search this board..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 h-9 bg-background/50 border-border/30"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7 mr-2"><AvatarFallback className="text-[10px] bg-primary/20 text-primary">ME</AvatarFallback></Avatar>
                        <span className="text-sm text-muted-foreground border-r border-border/30 pr-4 mr-2">Only My Issues</span>

                        <Button variant="outline" size="sm" className="h-8 border-transparent text-muted-foreground hover:text-foreground">Recently Updated</Button>

                        {/* View Switcher */}
                        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg ml-4">
                            {[
                                { id: 'board', icon: LayoutGrid },
                                { id: 'list', icon: List },
                                { id: 'calendar', icon: CalendarIcon },
                                { id: 'timeline', icon: GanttIcon },
                            ].map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setView(v.id)}
                                    className={`p-1.5 rounded-md transition-all ${view === v.id ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                                    title={v.id}
                                >
                                    <v.icon className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {view === 'board' && (
                    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <div className="flex gap-4 h-full overflow-x-auto pb-4 items-start">
                            {statusColumns.map(status => (
                                <div key={status} className="flex-shrink-0 w-72 bg-muted/10 rounded-xl p-2 border border-border/20 flex flex-col max-h-full">
                                    <div className="flex items-center justify-between mb-3 px-2 py-1 sticky top-0 bg-transparent z-10">
                                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                            {statusLabels[status]}
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/30 rounded-full">{filteredItems.filter(t => t.status === status).length}</Badge>
                                        </h3>
                                        <MoreHorizontal className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                                    </div>

                                    <div className="flex-1 overflow-y-auto px-1 space-y-2 min-h-[150px]">
                                        <SortableContext id={status} items={filteredItems.filter(t => t.status === status).map(t => t.issueKey)} strategy={verticalListSortingStrategy}>
                                            {filteredItems.filter(t => t.status === status).map(ticket => (
                                                <SortableTicket key={ticket._id} ticket={ticket} />
                                            ))}
                                        </SortableContext>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeId ? <JiraCard ticket={items.find(t => t.issueKey === activeId)} isOverlay /> : null}
                        </DragOverlay>
                    </DndContext>
                )}

                {view === 'list' && (
                    <div className="bg-card rounded-lg border border-border/30 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/20 border-b border-border/30 text-left text-xs font-semibold text-muted-foreground">
                                    <th className="p-3 w-10">Type</th>
                                    <th className="p-3 w-20">Key</th>
                                    <th className="p-3">Summary</th>
                                    <th className="p-3 w-32">Assignee</th>
                                    <th className="p-3 w-24">Priority</th>
                                    <th className="p-3 w-24">Status</th>
                                    <th className="p-3 w-16 text-right">Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(ticket => (
                                    <tr key={ticket._id} className="border-b border-border/10 hover:bg-muted/5 transition-colors group">
                                        <td className="p-3">{typeIcons[ticket.type]}</td>
                                        <td className="p-3 font-mono text-muted-foreground text-xs">{ticket.issueKey}</td>
                                        <td className="p-3 font-medium text-foreground group-hover:text-primary transition-colors cursor-pointer max-w-md truncate">{ticket.title}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-5 h-5"><AvatarFallback className="text-[9px]">{(ticket.assigneeUser?.fullName || 'Unassigned').substring(0, 2)}</AvatarFallback></Avatar>
                                                <span className="text-muted-foreground truncate">{ticket.assigneeUser?.fullName || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="p-3"><span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${priorityColors[ticket.priority]}`}>{ticket.priority}</span></td>
                                        <td className="p-3"><Badge variant="outline" className="capitalize font-normal text-xs">{statusLabels[ticket.status]}</Badge></td>
                                        <td className="p-3 text-right font-mono text-muted-foreground">{ticket.storyPoints}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'timeline' && (
                    <div className="h-full overflow-y-auto pr-2">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold mb-2">Roadmap</h3>
                            <GanttChart />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Sprint Progress</h4>
                                <div className="nebula-card p-4">
                                    <DonutChart />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'calendar' && (
                    <div className="grid grid-cols-7 gap-px bg-border/30 rounded-lg overflow-hidden border border-border/30">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="bg-card p-2 text-center text-xs font-semibold text-muted-foreground uppercase">{d}</div>
                        ))}
                        {Array.from({ length: 35 }).map((_, i) => {
                            const day = i - 2; // Offset for mock calendar
                            const dayTickets = filteredItems.filter((_, idx) => (idx * 3 + 1) % 31 === day); // Random distribution

                            return (
                                <div key={i} className={`bg-card min-h-[100px] p-2 ${day > 0 && day <= 31 ? '' : 'bg-muted/10'}`}>
                                    {day > 0 && day <= 31 && (
                                        <>
                                            <span className={`text-xs ${day === 14 ? 'w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold' : 'text-muted-foreground'}`}>{day}</span>
                                            <div className="space-y-1 mt-1">
                                                {dayTickets.map(t => (
                                                    <div key={t._id} className="text-[10px] bg-primary/10 text-primary px-1 py-0.5 rounded truncate border-l-2 border-primary cursor-pointer hover:bg-primary/20">
                                                        {t.issueKey}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JiraPage;

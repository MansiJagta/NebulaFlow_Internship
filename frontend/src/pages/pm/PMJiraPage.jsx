import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { statusColumns, statusLabels, priorityColors, typeIcons, SPRINT_DURATION_DAYS } from '@/data/jiraMockData';
import { List, LayoutGrid, Calendar as CalendarIcon, Search, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DonutChart } from '@/components/common/Charts';
import CalendarView from '@/components/common/CalendarView';
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
                <span className="text-[10px] font-bold text-muted-foreground " title="Sprint">{ticket.sprint || 'Backlog'}</span>
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

const DroppableColumn = ({ status, children }) => {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div
            ref={setNodeRef}
            className={`flex-shrink-0 w-72 bg-muted/10 rounded-xl p-2 border border-border/20 flex flex-col max-h-full transition ${isOver ? 'ring-2 ring-primary/40 bg-primary/10' : ''}`}
        >
            {children}
        </div>
    );
};

// --- Main Page Component ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const JiraPage = () => {
    const { token, selectedRepo } = useAuth();
    const [view, setView] = useState('board');
    const [items, setItems] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [collaborators, setCollaborators] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [workspace, setWorkspace] = useState(null);

    // Role-based filters
    const [taskScope, setTaskScope] = useState('team'); // 'team' | 'my'
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

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
            const workspaceIdToFetch = selectedRepo?.workspaceId || null;
            const wsUrl = workspaceIdToFetch 
                ? `${API_BASE_URL}/workspace/${workspaceIdToFetch}` 
                : `${API_BASE_URL}/workspace/me`;

            const workspaceRes = await axios.get(wsUrl, { headers: authHeaders, withCredentials: true });
            const workspaceData = workspaceRes.data;
            const workspaceId = workspaceData?._id;
            setWorkspace(workspaceData || null);

            let collabPromise = Promise.resolve({ data: [] });
            if (selectedRepo && selectedRepo.name) {
                const owner = selectedRepo.owner || (selectedRepo.fullName?.includes('/') ? selectedRepo.fullName.split('/')[0] : '');
                collabPromise = axios.get(
                    `${API_BASE_URL}/github/repo/collaborators?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(selectedRepo.name)}`,
                    { headers: authHeaders, withCredentials: true }
                );
            }

            const [collabRes, issuesRes, sprintsRes] = await Promise.all([
                collabPromise,
                axios.get(`${API_BASE_URL}/pm/issues${workspaceId ? `?workspaceId=${workspaceId}` : ''}`, { headers: authHeaders, withCredentials: true }),
                axios.get(`${API_BASE_URL}/pm/sprints`, { headers: authHeaders, withCredentials: true }),
            ]);

            // Filter strict GitHub collaborators with accounts
            const activeUniqueMembers = (Array.isArray(collabRes.data) ? collabRes.data : [])
                .filter((entry) => entry.hasAccount && entry.userId)
                .map((entry) => ({
                    _id: entry.userId,
                    fullName: entry.name || entry.login,
                    email: entry.email || `${entry.login}@github.com`,
                    avatarUrl: entry.avatarUrl || '',
                    role: entry.role || 'collaborator'
                }));

            setCollaborators(activeUniqueMembers);
            setItems(issuesRes.data);
            setSprints(sprintsRes.data);

            if (activeUniqueMembers.length > 0 && (!form.assigneeUserId || form.assigneeUserId === 'none')) {
                setForm(prev => ({ ...prev, assigneeUserId: activeUniqueMembers[0]._id }));
            }
            if (sprintsRes.data.length > 0 && (form.sprintId === 'none' || !form.sprintId)) {
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
    }, [selectedRepo?._id, selectedRepo?.workspaceId]);

    const filteredCollaborators = useMemo(() => {
        return collaborators;
    }, [collaborators]);

    const activeSprint = useMemo(() => {
        return sprints.find(s => s.isActive) || sprints[0] || null;
    }, [sprints]);

    const { user: currentUser } = useAuth(); // getting the actual user from auth context

    const filteredItems = items.filter(t => {
        // Text search
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.issueKey?.toLowerCase().includes(search.toLowerCase());

        // Scope filter - FIXED: properly distinguish 'my' vs 'team'
        let matchScope = true;
        if (taskScope === 'my') {
            // Only show tasks assigned to current user
            matchScope = t.assigneeUser && String(t.assigneeUser._id) === String(currentUser?.id);
        } else if (taskScope === 'team') {
            // Show all tasks for the team
            matchScope = true;
        }

        // Extended filters
        const matchAssignee = assigneeFilter === 'all' || (t.assigneeUser && String(t.assigneeUser._id) === assigneeFilter);
        const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter; // Note: priority is a Number (1,2,3) natively but could be string 'all'
        const matchStatus = statusFilter === 'all' || t.status === statusFilter;

        return matchSearch && matchScope && matchAssignee && matchPriority && matchStatus;
    });

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

        const ticket = items.find(t => t.issueKey === activeId);
        if (!ticket) {
            setActiveId(null);
            return;
        }

        let newStatus = null;

        if (statusColumns.includes(overId)) {
            newStatus = overId;
        } else {
            const overItem = items.find(i => i.issueKey === overId);
            if (overItem) {
                newStatus = overItem.status;
            }
        }

        if (!newStatus || newStatus === ticket.status) {
            setActiveId(null);
            return;
        }

        setItems(prev => prev.map(t =>
            t.issueKey === activeId ? { ...t, status: newStatus } : t
        ));

        try {
            await axios.patch(
                `${API_BASE_URL}/pm/issues/${ticket._id}`,
                { status: newStatus },
                { headers: authHeaders, withCredentials: true }
            );
        } catch (err) {
            console.error('[PMJiraPage] failed to update issue status', err);
        }

        setActiveId(null);
    };

    const handleCreateTicket = async () => {
        try {
            const payload = {
                title: form.title,
                description: form.description,
                assigneeUserId: form.assigneeUserId || null,
                workspaceId: workspace?._id || null,
                priority: form.priority,
                type: form.type,
                storyPoints: form.points,
                sprintId: form.sprintId && form.sprintId !== 'none' ? form.sprintId : null,
                status: form.status,
                dueDate: form.dueDate,
            };

            const res = await axios.post(
                `${API_BASE_URL}/pm/issues`,
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
                                                    {filteredCollaborators.length > 0 ? (
                                                        filteredCollaborators.map(user => (
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
                        {/* Task Scope Toggle */}
                        <div className="flex items-center bg-muted/30 p-1 rounded-lg">
                            <button
                                onClick={() => setTaskScope('team')}
                                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${taskScope === 'team' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Team Tasks
                            </button>
                            <button
                                onClick={() => setTaskScope('my')}
                                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${taskScope === 'my' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                My Tasks
                            </button>
                        </div>

                        {/* More Filters */}
                        {taskScope === 'team' && (
                            <div className="hidden lg:flex items-center gap-2 border-l border-border/30 pl-2 ml-2">
                                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                    <SelectTrigger className="h-8 text-xs border-transparent shadow-none bg-muted/20 w-32">
                                        <SelectValue placeholder="Assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Assignees</SelectItem>
                                        {filteredCollaborators.map(u => <SelectItem key={u._id} value={u._id}>{u.fullName}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-8 text-xs border-transparent shadow-none bg-muted/20 w-28">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        {statusColumns.map(col => <SelectItem key={col} value={col}>{statusLabels[col]}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <Button variant="outline" size="sm" className="h-8 border-transparent text-muted-foreground hover:text-foreground">Recently Updated</Button>

                        {/* View Switcher */}
                        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg ml-4">
                            {[
                                { id: 'board', icon: LayoutGrid },
                                { id: 'list', icon: List },
                                { id: 'calendar', icon: CalendarIcon },
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
                                <DroppableColumn key={status} status={status}>
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
                                </DroppableColumn>
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

                {view === 'calendar' && (
                    <div className="h-full pr-2 pb-4">
                        <CalendarView issues={filteredItems} sprints={sprints} users={collaborators} />
                    </div>
                )}


            </div>
        </div>
    );
};

export default JiraPage;

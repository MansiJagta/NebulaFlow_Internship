import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { statusColumns, statusLabels, priorityColors, typeIcons } from '@/data/jiraMockData';
import { List, LayoutGrid, Calendar as CalendarIcon, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DonutChart } from '@/components/common/Charts';
import CalendarView from '@/components/common/CalendarView';
import { useAuth } from '@/contexts/AuthContext';
import { useCollaboratorWorkspaceLive } from '@/hooks/useCollaboratorWorkspaceLive';

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
        <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">{ticket.title}</p>
        </div>
        <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-1 rounded">{ticket.issueKey}</span>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${priorityColors[ticket.priority]}`}>
                {ticket.priority}
            </span>
        </div>
        <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5">
                <span className="text-sm">{typeIcons[ticket.type]}</span>
                {ticket.type === 'story' && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                {ticket.type === 'bug' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                {ticket.type === 'task' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs bg-muted/40 text-muted-foreground px-1.5 rounded min-w-[20px] text-center">{ticket.storyPoints}</span>
            </div>
        </div>
    </div>
);

const CollaboratorJiraPage = () => {
    const { user } = useAuth();
    const [view, setView] = useState('list'); // Default to list for focus
    const [allIssues, setAllIssues] = useState([]); // Store all issues
    const [taskScope, setTaskScope] = useState('my'); // Default to 'my' for collaborator
    const [items, setItems] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [search, setSearch] = useState('');
    const { workspace, issues: liveIssues, loading } = useCollaboratorWorkspaceLive();

    useEffect(() => {
        setAllIssues(liveIssues);
    }, [liveIssues]);

    useEffect(() => {
        if (taskScope === 'my') {
            const assigned = allIssues.filter(issue =>
                issue.assigneeUser && user?.id
                    ? String(issue.assigneeUser._id) === String(user.id)
                    : false
            );
            setItems(assigned);
        } else {
            setItems(allIssues);
        }
    }, [taskScope, allIssues, user?.id]);

    const filteredItems = items.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.issueKey?.toLowerCase().includes(search.toLowerCase()));

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event) => setActiveId(event.active.id);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) { setActiveId(null); return; }

        const activeId = active.id;
        const overId = over.id;

        if (statusColumns.includes(overId) || items.find(i => i.issueKey === overId)) {
            let newStatus = overId;
            const overItem = items.find(i => i.issueKey === overId);
            if (overItem) newStatus = overItem.status;

            setItems(prev => prev.map(t =>
                t.issueKey === activeId ? { ...t, status: newStatus } : t
            ));
        }
        setActiveId(null);
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Syncing workspace issues…
                </div>
            )}
            <div className="flex flex-col gap-4 pb-4 border-b border-border/20">
                <div className="flex items-center justify-between">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h1 className="text-2xl font-bold nebula-gradient-text flex items-center gap-2">
                            My Issues
                            <Badge variant="outline" className="text-xs font-normal border-primary/30 text-primary">Sprint 14</Badge>
                        </h1>
                        <p className="text-sm text-muted-foreground">Focus on your assigned tasks</p>
                    </motion.div>
                    <div className="flex items-center gap-3">
                        <Button size="sm" variant="gradient"><Plus className="w-4 h-4 mr-1" /> New Issue</Button>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1 max-w-md relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search my issues..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 h-9 bg-background/50 border-border/30"
                        />
                    </div>

                    {/* Task Scope Toggle */}
                    <div className="flex items-center bg-muted/30 p-1 rounded-lg">
                        <button
                            onClick={() => setTaskScope('my')}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${taskScope === 'my' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            My Tasks
                        </button>
                        <button
                            onClick={() => setTaskScope('team')}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${taskScope === 'team' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Team Tasks
                        </button>
                    </div>

                    {/* View Switcher */}
                    <div className="flex gap-1 bg-muted/30 p-1 rounded-lg ml-4">
                        {[
                            { id: 'list', icon: List },
                            { id: 'board', icon: LayoutGrid },
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

                {/* Team Members Panel */}
                {workspace && workspace.members && (
                    <div className="bg-card/50 border border-border/20 rounded-lg p-4">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3">👥 Team Members ({workspace.members.length})</h3>
                        <div className="flex flex-wrap gap-2">
                            {workspace.members.map(member => (
                                <div key={member._id} className="flex items-center gap-2 bg-muted/20 px-3 py-1.5 rounded-lg border border-border/30 text-sm">
                                    <Avatar className="w-6 h-6">
                                        <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                                        <AvatarFallback className="text-[10px]">{member.fullName?.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-foreground text-xs">{member.fullName}</p>
                                        <p className="text-[10px] text-muted-foreground capitalize">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-lg border border-border/30 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/20 border-b border-border/30 text-left text-xs font-semibold text-muted-foreground">
                                    <th className="p-3 w-10">Type</th>
                                    <th className="p-3 w-20">Key</th>
                                    <th className="p-3">Summary</th>
                                    <th className="p-3 w-24">Priority</th>
                                    <th className="p-3 w-24">Status</th>
                                    <th className="p-3 w-16 text-right">Pts</th>
                                    <th className="p-3 w-20">Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(ticket => (
                                    <tr key={ticket._id} className="border-b border-border/10 hover:bg-muted/5 transition-colors group">
                                        <td className="p-3">{typeIcons[ticket.type]}</td>
                                        <td className="p-3 font-mono text-muted-foreground text-xs">{ticket.issueKey}</td>
                                        <td className="p-3 font-medium text-foreground group-hover:text-primary transition-colors cursor-pointer max-w-md truncate">{ticket.title}</td>
                                        <td className="p-3"><span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${priorityColors[ticket.priority]}`}>{ticket.priority}</span></td>
                                        <td className="p-3"><Badge variant="outline" className="capitalize font-normal text-xs">{statusLabels[ticket.status]}</Badge></td>
                                        <td className="p-3 text-right font-mono text-muted-foreground">{ticket.storyPoints}</td>
                                        <td className="p-3 text-xs text-muted-foreground">
                                            {ticket.dueDate || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {view === 'calendar' && (
                    <div className="h-full pr-2 pb-4">
                        <CalendarView issues={filteredItems} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollaboratorJiraPage;

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { statusColumns, statusLabels, priorityColors } from '@/data/jiraMockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MiniKanban = () => {
    const { token } = useAuth();
    const [items, setItems] = useState([]);
    const [activeId, setActiveId] = useState(null);

    const authHeaders = useMemo(() => (
        token ? { Authorization: `Bearer ${token}` } : {}
    ), [token]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/pm/issues`, {
                    headers: authHeaders,
                    withCredentials: true,
                });
                setItems(res.data);
            } catch (err) {
                console.error('[MiniKanban] failed to load issues', err);
            }
        };
        load();
    }, [authHeaders]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        const activeId = active.id;
        const overId = over?.id;

        if (!overId) {
            setActiveId(null);
            return;
        }

        const activeItem = items.find(item => item.issueKey === activeId);
        const overItem = items.find(item => item.issueKey === overId);

        // If dropped over a container (column) directly
        if (!overItem && statusColumns.includes(overId)) {
            setItems(prev => prev.map(t => (t.issueKey === activeId ? { ...t, status: overId } : t)));
            if (activeItem) {
                await axios.patch(
                    `${API_BASE_URL}/pm/issues/${activeItem._id}`,
                    { status: overId },
                    { headers: authHeaders, withCredentials: true }
                );
            }
        } else if (activeItem && overItem && activeItem.status !== overItem.status) {
            setItems(prev => prev.map(t => (t.issueKey === activeId ? { ...t, status: overItem.status } : t)));
            await axios.patch(
                `${API_BASE_URL}/pm/issues/${activeItem._id}`,
                { status: overItem.status },
                { headers: authHeaders, withCredentials: true }
            );
        }

        setActiveId(null);
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    const columns = statusColumns;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 h-full overflow-x-auto pb-2">
                {columns.map(status => (
                    <div key={status} className="flex-shrink-0 min-w-[260px] bg-muted/10 rounded-xl p-3 border border-border/20 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground">{statusLabels[status]}</h4>
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{items.filter(t => t.status === status).length}</span>
                        </div>

                        <SortableContext
                            id={status}
                            items={items.filter(t => t.status === status).map(t => t.issueKey)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2 min-h-[100px] flex-1">
                                {items.filter(t => t.status === status).slice(0, 4).map(ticket => (
                                    <SortableItem key={ticket._id} ticket={ticket} />
                                ))}
                                {/* Droppable area filler if empty */}
                                {items.filter(t => t.status === status).length === 0 && (
                                    <div className="h-20 border-2 border-dashed border-border/20 rounded-lg flex items-center justify-center text-xs text-muted-foreground/50">
                                        Drop here
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </div>
                ))}
            </div>
            <DragOverlay dropAnimation={dropAnimation}>
                {activeId ? (
                    <Item ticket={items.find(t => t.issueKey === activeId)} isOverlay />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

const SortableItem = ({ ticket }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: ticket.issueKey });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Item ticket={ticket} />
        </div>
    );
};

const Item = ({ ticket, isOverlay }) => {
    return (
        <div className={`bg-card p-3 rounded-lg border border-border/30 shadow-sm hover:border-primary/30 transition-colors cursor-grab active:cursor-grabbing group ${isOverlay ? 'shadow-xl ring-2 ring-primary rotate-2' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-muted-foreground">{ticket.issueKey}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
            </div>
            <p className="text-xs font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{ticket.title}</p>
            <div className="flex items-center justify-between">
                <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center text-[9px] text-secondary font-bold">
                    {((ticket.assigneeUser?.fullName || 'Unassigned').split(' ').map(n => n[0]).join(''))}
                </div>
                <span className="text-[10px] text-muted-foreground">{ticket.storyPoints}pts</span>
            </div>
        </div>
    );
};

export default MiniKanban;

import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { jiraTickets, statusLabels, priorityColors } from '@/data/jiraMockData';

const MiniKanban = () => {
    const [items, setItems] = useState(jiraTickets.filter(t => ['todo', 'in-progress', 'done'].includes(t.status)));
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        const activeId = active.id;
        const overId = over?.id;

        if (!overId) {
            setActiveId(null);
            return;
        }

        const activeItem = items.find(item => item.id === activeId);
        const overItem = items.find(item => item.id === overId);

        // If dropped over a container (column) directly
        if (!overItem && ['todo', 'in-progress', 'done'].includes(overId)) {
            setItems(prev => {
                return prev.map(t => {
                    if (t.id === activeId) {
                        return { ...t, status: overId };
                    }
                    return t;
                });
            });
        } else if (activeItem && overItem && activeItem.status !== overItem.status) {
            // Moved to another column over an item
            setItems(prev => {
                return prev.map(t => {
                    if (t.id === activeId) {
                        return { ...t, status: overItem.status };
                    }
                    return t;
                });
            });
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

    const columns = ['todo', 'in-progress', 'done'];

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {columns.map(status => (
                    <div key={status} className="bg-muted/10 rounded-xl p-3 border border-border/20 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground">{statusLabels[status]}</h4>
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{items.filter(t => t.status === status).length}</span>
                        </div>

                        <SortableContext
                            id={status}
                            items={items.filter(t => t.status === status).map(t => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2 min-h-[100px] flex-1">
                                {items.filter(t => t.status === status).slice(0, 4).map(ticket => (
                                    <SortableItem key={ticket.id} ticket={ticket} />
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
                    <Item ticket={items.find(t => t.id === activeId)} isOverlay />
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
    } = useSortable({ id: ticket.id });

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
                <span className="text-[10px] font-mono text-muted-foreground">{ticket.id}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
            </div>
            <p className="text-xs font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{ticket.title}</p>
            <div className="flex items-center justify-between">
                <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center text-[9px] text-secondary font-bold">
                    {ticket.assignee.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-[10px] text-muted-foreground">{ticket.points}pts</span>
            </div>
        </div>
    );
};

export default MiniKanban;

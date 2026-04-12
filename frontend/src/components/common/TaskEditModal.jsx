import { useState, useMemo } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Calendar } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TaskEditModal = ({ isOpen, task, onClose, onUpdate, sprints, users }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'backlog',
        priority: task?.priority || 'medium',
        dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assigneeUserId: task?.assigneeUserId || '',
        sprintId: task?.sprintId || '',
        storyPoints: task?.storyPoints || 0,
    });

    const authHeaders = useMemo(() => {
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, [token]);

    const handleSave = async () => {
        if (!task?._id) return;
        
        setLoading(true);
        try {
            const updates = {
                ...form,
                priority: form.priority === 'high' ? 1 : form.priority === 'low' ? 3 : 2,
            };

            await axios.patch(
                `${API_BASE_URL}/pm/issues/${task._id}`,
                updates,
                { headers: authHeaders, withCredentials: true }
            );

            onUpdate();
            onClose();
        } catch (err) {
            console.error('[TaskEditModal] update failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!task?._id || !window.confirm('Are you sure? This action cannot be undone.')) return;

        setLoading(true);
        try {
            await axios.delete(
                `${API_BASE_URL}/pm/issues/${task._id}`,
                { headers: authHeaders, withCredentials: true }
            );

            onUpdate();
            onClose();
        } catch (err) {
            console.error('[TaskEditModal] delete failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground">{task?.issueKey}</span>
                        Edit Task
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Title</label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Task title"
                            disabled={loading}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Description</label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Task description"
                            disabled={loading}
                            rows={3}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Status</label>
                        <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="backlog">Backlog</SelectItem>
                                <SelectItem value="todo">To Do</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority & Story Points */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Priority</label>
                            <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Story Points</label>
                            <Input
                                type="number"
                                value={form.storyPoints}
                                onChange={(e) => setForm({ ...form, storyPoints: parseInt(e.target.value) || 0 })}
                                disabled={loading}
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Assignee */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Assignee</label>
                        <Select value={form.assigneeUserId || ''} onValueChange={(value) => setForm({ ...form, assigneeUserId: value })} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Unassigned</SelectItem>
                                {users.map((user) => (
                                    <SelectItem key={user._id} value={user._id}>
                                        {user.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sprint */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Sprint</label>
                        <Select value={form.sprintId || ''} onValueChange={(value) => setForm({ ...form, sprintId: value })} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Backlog" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Backlog</SelectItem>
                                {sprints.map((sprint) => (
                                    <SelectItem key={sprint._id} value={sprint._id}>
                                        {sprint.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Due Date
                        </label>
                        <Input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                            disabled={loading}
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2 flex-row-reverse">
                    <Button onClick={handleSave} disabled={loading} className="flex-1">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button onClick={handleDelete} variant="destructive" disabled={loading} className="flex-1" >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                    <Button onClick={onClose} variant="outline" disabled={loading} className="flex-1">
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TaskEditModal;

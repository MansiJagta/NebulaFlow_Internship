import { useState, useMemo } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Calendar, Flag } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MilestoneDetailModal = ({ isOpen, milestone, onClose, onUpdate }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: milestone?.name || '',
        description: milestone?.description || '',
        expectedStartDate: milestone?.expectedStartDate ? new Date(milestone.expectedStartDate).toISOString().split('T')[0] : '',
        expectedEndDate: milestone?.expectedEndDate ? new Date(milestone.expectedEndDate).toISOString().split('T')[0] : '',
    });

    const authHeaders = useMemo(() => {
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, [token]);

    const handleSave = async () => {
        if (!milestone?._id) return;

        setLoading(true);
        try {
            await axios.patch(
                `${API_BASE_URL}/milestones/${milestone._id}`,
                form,
                { headers: authHeaders, withCredentials: true }
            );

            onUpdate();
            onClose();
        } catch (err) {
            console.error('[MilestoneDetailModal] update failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!milestone?._id || !window.confirm('Delete this milestone?')) return;

        setLoading(true);
        try {
            await axios.delete(
                `${API_BASE_URL}/milestones/${milestone._id}`,
                { headers: authHeaders, withCredentials: true }
            );

            onUpdate();
            onClose();
        } catch (err) {
            console.error('[MilestoneDetailModal] delete failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Flag className="w-4 h-4" /> Milestone Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Name</label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Milestone name"
                            disabled={loading}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Description</label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Milestone description"
                            disabled={loading}
                            rows={3}
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Start Date
                            </label>
                            <Input
                                type="date"
                                value={form.expectedStartDate}
                                onChange={(e) => setForm({ ...form, expectedStartDate: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> End Date
                            </label>
                            <Input
                                type="date"
                                value={form.expectedEndDate}
                                onChange={(e) => setForm({ ...form, expectedEndDate: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-muted/20 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                            Duration: {form.expectedStartDate && form.expectedEndDate
                                ? (() => {
                                    const start = new Date(form.expectedStartDate);
                                    const end = new Date(form.expectedEndDate);
                                    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                                    return `${days} day${days !== 1 ? 's' : ''}`;
                                })()
                                : 'N/A'
                            }
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 flex-row-reverse">
                    <Button onClick={handleSave} disabled={loading} className="flex-1">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button onClick={handleDelete} variant="destructive" disabled={loading} className="flex-1">
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

export default MilestoneDetailModal;

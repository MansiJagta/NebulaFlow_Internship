import { useState, useMemo } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MeetingDetailModal = ({ isOpen, meeting, onClose, onUpdate, users }) => {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: meeting?.title || '',
        description: meeting?.description || '',
        location: meeting?.location || '',
        startTime: meeting?.startTime ? new Date(meeting.startTime).toISOString().slice(0, 16) : '',
        endTime: meeting?.endTime ? new Date(meeting.endTime).toISOString().slice(0, 16) : '',
    });
    const [rsvpStatus, setRsvpStatus] = useState('pending');

    const isOrganizer = meeting?.organizerId?._id === user?._id || meeting?.organizerId === user?._id;

    const authHeaders = useMemo(() => {
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, [token]);

    const handleSave = async () => {
        if (!meeting?._id || !isOrganizer) return;

        setLoading(true);
        try {
            await axios.patch(
                `${API_BASE_URL}/meetings/${meeting._id}`,
                form,
                { headers: authHeaders, withCredentials: true }
            );

            onUpdate();
            onClose();
        } catch (err) {
            console.error('[MeetingDetailModal] update failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!meeting?._id || !isOrganizer || !window.confirm('Delete this meeting?')) return;

        setLoading(true);
        try {
            await axios.delete(
                `${API_BASE_URL}/meetings/${meeting._id}`,
                { headers: authHeaders, withCredentials: true }
            );

            onUpdate();
            onClose();
        } catch (err) {
            console.error('[MeetingDetailModal] delete failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRsvp = async (status) => {
        if (!meeting?._id) return;

        setLoading(true);
        try {
            await axios.post(
                `${API_BASE_URL}/meetings/${meeting._id}/attend`,
                { status },
                { headers: authHeaders, withCredentials: true }
            );

            setRsvpStatus(status);
            onUpdate();
        } catch (err) {
            console.error('[MeetingDetailModal] RSVP failed', err);
        } finally {
            setLoading(false);
        }
    };

    const startTime = meeting?.startTime ? new Date(meeting.startTime) : null;
    const endTime = meeting?.endTime ? new Date(meeting.endTime) : null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Meeting Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Title */}
                    {isOrganizer ? (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Title</label>
                            <Input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg font-semibold">{meeting?.title}</h3>
                        </div>
                    )}

                    {/* Description */}
                    {isOrganizer ? (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Description</label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                disabled={loading}
                                rows={2}
                            />
                        </div>
                    ) : (
                        meeting?.description && (
                            <p className="text-sm text-muted-foreground">{meeting.description}</p>
                        )
                    )}

                    {/* Time */}
                    {isOrganizer ? (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Start Time</label>
                                <Input
                                    type="datetime-local"
                                    value={form.startTime}
                                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">End Time</label>
                                <Input
                                    type="datetime-local"
                                    value={form.endTime}
                                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {startTime && endTime && (
                                <span>
                                    {startTime.toLocaleString()} - {endTime.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Location */}
                    {isOrganizer ? (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> Location
                            </label>
                            <Input
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                placeholder="Virtual or physical location"
                                disabled={loading}
                            />
                        </div>
                    ) : (
                        meeting?.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {meeting.location}
                            </div>
                        )
                    )}

                    {/* Organizer */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Organizer</label>
                        <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                    {meeting?.organizerId?.fullName?.split(' ').map(n => n[0]).join('') || 'O'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{meeting?.organizerId?.fullName || 'Unknown'}</span>
                        </div>
                    </div>

                    {/* Attendees */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Attendees
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {meeting?.attendees?.map((attendee) => (
                                <Badge key={attendee._id} variant="outline">
                                    {attendee.fullName}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* RSVP Status */}
                    {!isOrganizer && (
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">Your Response:</p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={rsvpStatus === 'accept' ? 'default' : 'outline'}
                                    onClick={() => handleRsvp('accept')}
                                    disabled={loading}
                                    className="flex-1 text-xs"
                                >
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Accept
                                </Button>
                                <Button
                                    size="sm"
                                    variant={rsvpStatus === 'decline' ? 'destructive' : 'outline'}
                                    onClick={() => handleRsvp('decline')}
                                    disabled={loading}
                                    className="flex-1 text-xs"
                                >
                                    Decline
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2 flex-row-reverse">
                    {isOrganizer && (
                        <>
                            <Button onClick={handleSave} disabled={loading} className="flex-1">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button onClick={handleDelete} variant="destructive" disabled={loading} className="flex-1">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </Button>
                        </>
                    )}
                    <Button onClick={onClose} variant="outline" disabled={loading} className="flex-1">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MeetingDetailModal;

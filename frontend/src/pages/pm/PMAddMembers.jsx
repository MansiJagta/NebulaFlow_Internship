import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Shield, Send, Check, Clock, MoreVertical, Trash2, RefreshCw, Github, Loader2, AtSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Fallback static members shown when no repo is linked
const FALLBACK_MEMBERS = [
    { id: '1', name: 'Alice Chen', login: 'alice-chen', email: 'alice@nebula.dev', role: 'Developer', avatarUrl: '', lastActive: '2m ago' },
    { id: '2', name: 'Bob Kumar', login: 'bob-kumar', email: 'bob@nebula.dev', role: 'Developer', avatarUrl: '', lastActive: '1h ago' },
    { id: '3', name: 'Carol Davis', login: 'carol-davis', email: 'carol@nebula.dev', role: 'Designer', avatarUrl: '', lastActive: '5h ago' },
    { id: '4', name: 'Dave Wilson', login: 'dave-wilson', email: 'dave@nebula.dev', role: 'DevOps', avatarUrl: '', lastActive: '1d ago' },
];

const FALLBACK_INVITES = [
    { id: '5', email: 'eve@nebula.dev', role: 'Frontend', status: 'pending' },
    { id: '6', email: 'frank@nebula.dev', role: 'QA', status: 'pending' },
];

const PMAddMembers = () => {
    const navigate = useNavigate();
    const { user, selectedRepo, token, API_BASE_URL } = useAuth();

    const [email, setEmail] = useState('');
    const [githubUsername, setGithubUsername] = useState('');
    const [role, setRole] = useState('Developer');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteResult, setInviteResult] = useState(null);
    const [invites, setInvites] = useState(FALLBACK_INVITES);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch real collaborators when a repo is selected
    useEffect(() => {
        if (!selectedRepo) {
            setMembers(FALLBACK_MEMBERS);
            return;
        }

        const fetchCollaborators = async () => {
            setLoading(true);
            setError(null);
            try {
                // If workspace exists, use workspace members as source of truth
                let workspaceMembers = null;
                try {
                    const wsRes = await axios.get(`${API_BASE_URL}/api/workspace/me`, {
                        withCredentials: true,
                    });
                    if (wsRes.data?.members) {
                        workspaceMembers = wsRes.data.members.map((m) => ({
                            id: m._id,
                            name: m.fullName || m.email,
                            login: m.email ? m.email.split('@')[0] : '',
                            email: m.email,
                            role: m.role || 'collaborator',
                            avatarUrl: m.avatarUrl || '',
                            lastActive: 'Workspace Member',
                            profileUrl: '',
                        }));
                    }
                } catch (workspaceErr) {
                    console.warn('[PMAddMembers] workspace/me fetch failed', workspaceErr);
                }

                const owner = selectedRepo.owner
                    || (selectedRepo.fullName?.includes('/')
                        ? selectedRepo.fullName.split('/')[0]
                        : null);
                const repo = selectedRepo.name;

                if (!owner) {
                    setError('Could not determine repo owner.');
                    setMembers(FALLBACK_MEMBERS);
                    return;
                }

                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await axios.get(
                    `${API_BASE_URL}/api/github/repo/collaborators?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
                    { headers, withCredentials: true }
                );

                const githubMembers = (res.data && res.data.length > 0) ? res.data.map((c, i) => ({
                    id: String(c.login || i),
                    name: c.name || c.login,
                    login: c.login,
                    email: `${c.login}@github.com`,
                    role: c.role || 'Collaborator',
                    avatarUrl: c.avatarUrl || '',
                    lastActive: 'GitHub',
                    profileUrl: c.profileUrl,
                })) : FALLBACK_MEMBERS;

                // Source-of-truth: workspace member roster if available
                if (workspaceMembers && workspaceMembers.length > 0) {
                    setMembers(workspaceMembers);
                } else {
                    setMembers(githubMembers);
                }
            } catch (err) {
                console.error('[PMAddMembers] collaborators fetch error:', err);
                setError('Could not load collaborators from GitHub. Showing demo data.');
                setMembers(FALLBACK_MEMBERS);
            } finally {
                setLoading(false);
            }
        };

        fetchCollaborators();
    }, [selectedRepo, API_BASE_URL]);

    const handleInvite = async () => {
        if (!email) return;
        setIsInviting(true);
        setInviteResult(null);
        try {
            const owner = selectedRepo?.owner
                || (selectedRepo?.fullName?.includes('/') ? selectedRepo.fullName.split('/')[0] : null);

            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.post(
                `${API_BASE_URL}/api/github/invite`,
                {
                    email,
                    githubUsername: githubUsername.trim() || undefined,
                    role,
                    repoOwner: owner || undefined,
                    repoName: selectedRepo?.name || undefined,
                    senderEmail: user?.email || undefined,
                    senderName: user?.name || undefined,
                },
                { headers, withCredentials: true }
            );

            setInviteResult(res.data);
            // Add to pending invites list
            setInvites(prev => [...prev, { id: Date.now().toString(), email, role, status: 'pending' }]);
            setEmail('');
            setGithubUsername('');
        } catch (err) {
            const msg = err.response?.data?.error || 'Invite failed. Check server logs.';
            setInviteResult({ emailSent: false, githubInvited: false, errors: [msg] });
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = (id) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const handleRevokeInvite = (id) => {
        setInvites(prev => prev.filter(i => i.id !== id));
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold nebula-gradient-text">Team Management</h1>
                    <p className="text-muted-foreground text-sm">
                        {selectedRepo
                            ? `Collaborators of ${selectedRepo.name}`
                            : 'Invite and manage your project members'}
                    </p>
                </div>
                {!selectedRepo && (
                    <Button size="sm" variant="outline" className="border-primary/30 text-primary" onClick={() => navigate('/repository-selection')}>
                        <Github className="w-4 h-4 mr-2" /> Connect GitHub
                    </Button>
                )}
            </motion.div>

            {/* No repo banner */}
            {!selectedRepo && (
                <div className="p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-center text-sm text-muted-foreground">
                    No repository linked —{' '}
                    <button onClick={() => navigate('/repository-selection')} className="text-primary underline">
                        connect GitHub
                    </button>{' '}
                    to see real collaborators. Showing demo data.
                </div>
            )}

            {error && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                    {error}
                </div>
            )}

            {/* Invite Result Banner */}
            <AnimatePresence>
                {inviteResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex flex-col gap-2"
                    >
                        {inviteResult.emailSent && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                Invite email sent successfully!
                            </div>
                        )}
                        {inviteResult.githubInvited && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                                <Github className="w-4 h-4 shrink-0" />
                                GitHub collaborator invitation sent!
                            </div>
                        )}
                        {inviteResult.errors?.length > 0 && inviteResult.errors.map((e, i) => (
                            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />{e}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Invite Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="nebula-card p-6 border-primary/20 bg-primary/5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-primary/20 rounded-md text-primary"><UserPlus className="w-4 h-4" /></div>
                    Invite New Member
                </h3>
                <div className="flex flex-col gap-3">
                    {/* Row 1: email + role */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Email address (e.g. name@nebula.dev)"
                                className="pl-10 bg-background/50 border-border/30 focus-visible:ring-primary/50"
                            />
                        </div>
                        <div className="w-full md:w-48 relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                className="w-full h-10 pl-10 pr-3 bg-background/50 border border-border/30 rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
                            >
                                <option>Developer</option>
                                <option>Designer</option>
                                <option>DevOps</option>
                                <option>Product Owner</option>
                                <option>QA Engineer</option>
                            </select>
                        </div>
                    </div>
                    {/* Row 2: GitHub username + Send button */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={githubUsername}
                                onChange={e => setGithubUsername(e.target.value)}
                                placeholder="GitHub username (optional – to add as repo collaborator)"
                                className="pl-10 bg-background/50 border-border/30 focus-visible:ring-primary/50"
                            />
                        </div>
                        <Button
                            onClick={handleInvite}
                            disabled={isInviting || !email}
                            className={`min-w-[140px] transition-all duration-300 ${inviteResult?.emailSent ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'
                                }`}
                        >
                            {isInviting ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
                            ) : inviteResult?.emailSent ? (
                                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                                    <Check className="w-4 h-4 mr-2 inline" /> Sent!
                                </motion.div>
                            ) : (
                                <> <Send className="w-4 h-4 mr-2" /> Send Invite </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Invites */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Pending Invites ({invites.length})</h3>
                    <div className="space-y-2">
                        <AnimatePresence>
                            {invites.map((invite) => (
                                <motion.div
                                    key={invite.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0, x: -20 }}
                                    className="nebula-card p-3 flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border">
                                            <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{invite.email}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-dashed border-muted-foreground/40 text-muted-foreground font-normal">{invite.role}</Badge>
                                                <span className="text-[10px] text-muted-foreground">Sent today</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Resend">
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                        <Button onClick={() => handleRevokeInvite(invite.id)} size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10" title="Revoke">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {invites.length === 0 && (
                            <div className="text-center p-8 border-2 border-dashed border-border/20 rounded-lg text-muted-foreground text-sm">
                                No pending invites
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Active Members / Collaborators */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                        {selectedRepo ? `Collaborators (${members.length})` : `Active Members (${members.length})`}
                    </h3>

                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading collaborators from GitHub…
                        </div>
                    )}

                    <div className="space-y-2">
                        {members.map((member) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="nebula-card p-3 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="w-10 h-10 border-2 border-background">
                                            {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
                                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-foreground font-bold">
                                                {member.name?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">{member.role}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {member.profileUrl
                                                    ? <a href={member.profileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@{member.login}</a>
                                                    : `• Active ${member.lastActive}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {member.profileUrl && (
                                            <DropdownMenuItem onClick={() => window.open(member.profileUrl, '_blank')}>
                                                View GitHub Profile
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-400" onClick={() => handleRemoveMember(member.id)}>
                                            Remove Member
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PMAddMembers;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Shield, Send, Check, Clock, MoreVertical, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const initialMembers = [
    { id: '1', name: 'Alice Chen', email: 'alice@nebula.dev', role: 'Developer', status: 'active', lastActive: '2m ago' },
    { id: '2', name: 'Bob Kumar', email: 'bob@nebula.dev', role: 'Developer', status: 'active', lastActive: '1h ago' },
    { id: '3', name: 'Carol Davis', email: 'carol@nebula.dev', role: 'Designer', status: 'active', lastActive: '5h ago' },
    { id: '4', name: 'Dave Wilson', email: 'dave@nebula.dev', role: 'DevOps', status: 'active', lastActive: '1d ago' },
];

const initialInvites = [
    { id: '5', name: 'Eve Martinez', email: 'eve@nebula.dev', role: 'Frontend', status: 'pending' },
    { id: '6', name: 'Frank Wright', email: 'frank@nebula.dev', role: 'QA', status: 'pending' },
];

const PMAddMembers = () => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Developer');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteSent, setInviteSent] = useState(false);
    const [members, setMembers] = useState(initialMembers);
    const [invites, setInvites] = useState(initialInvites);

    const handleInvite = () => {
        if (!email) return;
        setIsInviting(true);
        setTimeout(() => {
            setIsInviting(false);
            setInviteSent(true);
            setInvites(prev => [...prev, { id: Date.now().toString(), name: email.split('@')[0], email, role, status: 'pending' }]);
            setEmail('');
            setTimeout(() => setInviteSent(false), 2000);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold nebula-gradient-text">Team Management</h1>
                <p className="text-muted-foreground text-sm">Invite and manage your project members</p>
            </motion.div>

            {/* Invite Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="nebula-card p-6 border-primary/20 bg-primary/5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-primary/20 rounded-md text-primary"><UserPlus className="w-4 h-4" /></div>
                    Invite New Member
                </h3>
                <div className="flex flex-col md:flex-row gap-4">
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
                    <Button
                        onClick={handleInvite}
                        disabled={isInviting || !email}
                        className={`min-w-[120px] transition-all duration-300 ${inviteSent ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`}
                    >
                        {isInviting ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                <RefreshCw className="w-4 h-4" />
                            </motion.div>
                        ) : inviteSent ? (
                            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                                <Check className="w-4 h-4 mr-2 inline" /> Sent!
                            </motion.div>
                        ) : (
                            <> <Send className="w-4 h-4 mr-2" /> Send Invite </>
                        )}
                    </Button>
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
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10" title="Revoke">
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

                {/* Active Members */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Active Members ({members.length})</h3>
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
                                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-foreground font-bold">{member.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">{member.role}</span>
                                            <span className="text-[10px] text-muted-foreground">• Active {member.lastActive}</span>
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
                                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-400">Remove Member</DropdownMenuItem>
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

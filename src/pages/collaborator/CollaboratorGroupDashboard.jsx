import { motion } from 'framer-motion';
import { GitBranch, Layout } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ActivityFeed from '@/components/common/ActivityFeed';

const teamMembers = [
    { name: 'Alice Chen', role: 'Frontend', status: 'coding', avatar: 'A' },
    { name: 'Bob Kumar', role: 'Backend', status: 'meeting', avatar: 'B' },
    { name: 'Carol Davis', role: 'Design', status: 'offline', avatar: 'C' },
    { name: 'Dave Wilson', role: 'DevOps', status: 'coding', avatar: 'D' },
];

const CollaboratorGroupDashboard = () => {
    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold nebula-gradient-text">Group Dashboard</h1>
                <p className="text-muted-foreground text-sm">See what your team is up to</p>
            </motion.div>

            {/* Team Status Strip */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {teamMembers.map((m, i) => (
                    <div key={i} className="nebula-card p-3 flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="w-10 h-10 border border-border">
                                <AvatarFallback className="bg-muted text-muted-foreground">{m.avatar}</AvatarFallback>
                            </Avatar>
                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${m.status === 'coding' ? 'bg-green-500' : m.status === 'meeting' ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">{m.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{m.status}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="nebula-card p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Team Activity Feed</h3>
                        <ActivityFeed />
                    </motion.div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="nebula-card p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Sprint Goal</h3>
                        <div className="p-4 bg-muted/10 rounded-lg border border-border/20 text-center">
                            <p className="text-lg font-bold text-primary mb-1">92%</p>
                            <p className="text-xs text-muted-foreground">Completion Rate</p>
                            <div className="w-full bg-muted/20 h-2 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-primary w-[92%] rounded-full"></div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="nebula-card p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Active Channels</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm p-2 hover:bg-muted/10 rounded-lg cursor-pointer">
                                <span className="flex items-center gap-2"><Layout className="w-4 h-4 text-muted-foreground" /> #general</span>
                                <Badge variant="secondary" className="text-[10px] h-5">12 new</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm p-2 hover:bg-muted/10 rounded-lg cursor-pointer">
                                <span className="flex items-center gap-2"><GitBranch className="w-4 h-4 text-muted-foreground" /> #dev-updates</span>
                                <Badge variant="secondary" className="text-[10px] h-5">5 new</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm p-2 hover:bg-muted/10 rounded-lg cursor-pointer">
                                <span className="flex items-center gap-2"><Layout className="w-4 h-4 text-muted-foreground" /> #design</span>
                                <Badge variant="secondary" className="text-[10px] h-5">2 new</Badge>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CollaboratorGroupDashboard;

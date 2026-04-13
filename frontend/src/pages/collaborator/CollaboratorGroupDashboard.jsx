import { motion } from 'framer-motion';
import { GitBranch, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ActivityFeed from '@/components/common/ActivityFeed';
import { useAuth } from '@/contexts/AuthContext';
import { useCollaborators } from '@/hooks/useCollaborators';
import { useCollaboratorWorkspaceLive } from '@/hooks/useCollaboratorWorkspaceLive';

const CollaboratorGroupDashboard = () => {
    const { selectedRepo } = useAuth();
    const { workspace, repoList, meetings, issues, loading } = useCollaboratorWorkspaceLive();
    const { collaborators } = useCollaborators(selectedRepo?.workspaceId || workspace?._id);

    const completionRate = issues.length
        ? Math.round((issues.filter((issue) => issue.status === 'done').length / issues.length) * 100)
        : 0;

    const activities = [...issues.slice(0, 4).map((issue) => ({
        id: issue._id,
        user: issue.assigneeUser?.fullName || issue.reporterUser?.fullName || 'Team',
        action: issue.status === 'done' ? 'completed' : 'updated',
        target: issue.title,
        time: issue.updatedAt ? new Date(issue.updatedAt).toLocaleString() : 'Recently',
        type: 'task',
    })), ...meetings.slice(0, 3).map((meeting) => ({
        id: meeting._id,
        user: meeting.organizerId?.fullName || 'Team',
        action: 'scheduled',
        target: meeting.title,
        time: meeting.startTime ? new Date(meeting.startTime).toLocaleString() : 'Soon',
        type: 'message',
    }))];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold nebula-gradient-text">Group Dashboard</h1>
                    <p className="text-muted-foreground text-sm">Live team activity for {workspace?.name || selectedRepo?.fullName || 'your workspace'}</p>
                </div>
                {loading && (
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" /> Syncing collaborators…
                    </span>
                )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {collaborators.map((member, index) => (
                    <div key={member._id || index} className="nebula-card p-3 flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="w-10 h-10 border border-border">
                                <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                                <AvatarFallback className="bg-muted text-muted-foreground">{member.fullName?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">{member.fullName}</p>
                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="nebula-card p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Team Activity Feed</h3>
                        <ActivityFeed activities={activities} />
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="nebula-card p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Sprint Goal</h3>
                        <div className="p-4 bg-muted/10 rounded-lg border border-border/20 text-center">
                            <p className="text-lg font-bold text-primary mb-1">{completionRate}%</p>
                            <p className="text-xs text-muted-foreground">Completion Rate</p>
                            <div className="w-full bg-muted/20 h-2 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${completionRate}%` }} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="nebula-card p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Active Repositories</h3>
                        <div className="space-y-2">
                            {(repoList.length > 0 ? repoList : [selectedRepo].filter(Boolean)).slice(0, 3).map((repo, index) => (
                                <div key={repo.id || repo.fullName || index} className="flex items-center justify-between text-sm p-2 hover:bg-muted/10 rounded-lg cursor-pointer">
                                    <span className="flex items-center gap-2">
                                        <GitBranch className="w-4 h-4 text-muted-foreground" />
                                        {repo.fullName || repo.name}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] h-5">Live</Badge>
                                </div>
                            ))}
                            {repoList.length === 0 && !selectedRepo && (
                                <div className="text-xs text-muted-foreground">No repositories available yet.</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CollaboratorGroupDashboard;

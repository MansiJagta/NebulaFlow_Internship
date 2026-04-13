import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ListChecks, Clock, GitBranch, Zap, Calendar, Play, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import KpiCard from '@/components/common/KpiCard';
import ActivityFeed from '@/components/common/ActivityFeed';
import { useAuth } from '@/contexts/AuthContext';
import { useCollaboratorWorkspaceLive } from '@/hooks/useCollaboratorWorkspaceLive';

const fallbackTaskBreakdown = [
    { name: 'Completed', value: 12, color: 'hsl(187, 100%, 50%)' },
    { name: 'In Progress', value: 5, color: 'hsl(257, 100%, 68%)' },
    { name: 'To Do', value: 7, color: 'hsl(340, 100%, 65%)' },
];

const CollaboratorDashboard = () => {
    const { user, selectedRepo } = useAuth();
    const { workspace, repoList, repoDetails, meetings, issues, repoCollaborators, loading } = useCollaboratorWorkspaceLive();

    const myTasks = useMemo(() => issues.filter((issue) => {
        const assigneeId = String(issue?.assigneeUser?._id || issue?.assigneeUserId || '');
        return user?.id && assigneeId && assigneeId === String(user.id);
    }), [issues, user?.id]);

    const taskBreakdown = useMemo(() => {
        if (!issues.length) return fallbackTaskBreakdown;

        const done = issues.filter((issue) => issue.status === 'done').length;
        const active = issues.filter((issue) => ['in-progress', 'review'].includes(issue.status)).length;
        const todo = Math.max(0, issues.length - done - active);

        return [
            { name: 'Completed', value: done, color: 'hsl(187, 100%, 50%)' },
            { name: 'In Progress', value: active, color: 'hsl(257, 100%, 68%)' },
            { name: 'To Do', value: todo, color: 'hsl(340, 100%, 65%)' },
        ];
    }, [issues]);

    const projects = useMemo(() => {
        const liveRepos = repoList.length > 0 ? [...repoList] : [];
        if (selectedRepo && !liveRepos.some((repo) => repo.id === selectedRepo.id)) {
            liveRepos.unshift(selectedRepo);
        }

        return liveRepos.slice(0, 3).map((repo, index) => ({
            name: repo.fullName || repo.name,
            role: repo.id === selectedRepo?.id ? 'Active repo' : 'Connected repo',
            status: repo.language || 'Live',
            progress: Math.max(18, 100 - index * 24),
            deadline: repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : 'Live',
        }));
    }, [repoList, selectedRepo]);

    const schedule = useMemo(() => {
        if (!meetings.length) return [];
        return meetings.slice(0, 3).map((meeting) => ({
            _id: meeting._id,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            title: meeting.title,
            type: 'Meeting',
        }));
    }, [meetings]);

    const activities = useMemo(() => {
        const issueActivities = issues.slice(0, 5).map((issue) => ({
            id: issue._id,
            user: issue.assigneeUser?.fullName || issue.reporterUser?.fullName || 'Team',
            action: issue.status === 'done' ? 'completed' : 'updated',
            target: issue.title,
            time: issue.updatedAt ? new Date(issue.updatedAt).toLocaleString() : 'Recently',
            timestamp: issue.updatedAt ? new Date(issue.updatedAt).getTime() : Date.now(),
            type: 'task',
        }));

        const meetingActivities = meetings.slice(0, 3).map((meeting) => ({
            id: meeting._id,
            user: meeting.organizerId?.fullName || 'Team',
            action: 'scheduled',
            target: meeting.title,
            time: meeting.startTime ? new Date(meeting.startTime).toLocaleString() : 'Soon',
            timestamp: meeting.startTime ? new Date(meeting.startTime).getTime() : Date.now(),
            type: 'message',
        }));

        return [...issueActivities, ...meetingActivities]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 6);
    }, [issues, meetings]);

    const hoursLogged = useMemo(() => {
        return meetings.reduce((total, meeting) => {
            if (!meeting.startTime || !meeting.endTime) return total;
            const duration = (new Date(meeting.endTime) - new Date(meeting.startTime)) / 3600000;
            return total + Math.max(0, duration);
        }, 0);
    }, [meetings]);

    const storyPoints = myTasks.reduce((total, issue) => total + (issue.storyPoints || issue.points || 0), 0);
    const openPRs = repoDetails?.openPRsCount ?? 0;
    const teamCount = workspace?.members?.length || repoCollaborators.length || 0;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold nebula-gradient-text mb-1">My Workspace</h1>
                    <p className="text-muted-foreground text-sm">
                        {workspace?.name || selectedRepo?.fullName || 'Live workspace overview'}
                    </p>
                </div>
                {loading && (
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" /> Refreshing live workspace data…
                    </span>
                )}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="My Tasks" value={myTasks.length} icon={<ListChecks className="w-5 h-5" />} delay={0} />
                <KpiCard title="Hours Logged" value={hoursLogged.toFixed(1)} suffix="h" icon={<Clock className="w-5 h-5" />} trend={{ value: 5, positive: true }} delay={0.1} />
                <KpiCard title="Open PRs" value={openPRs} icon={<GitBranch className="w-5 h-5" />} delay={0.2} />
                <KpiCard title="Story Points" value={storyPoints} suffix="pts" icon={<Zap className="w-5 h-5" />} trend={{ value: 15, positive: true }} delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="nebula-card p-5"
                    >
                        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                            <h3 className="text-sm font-semibold text-foreground">Active Projects</h3>
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{teamCount} collaborators</Badge>
                        </div>
                        <div className="space-y-5">
                            {projects.length > 0 ? projects.map((project, index) => (
                                <div key={`${project.name}-${index}`} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{project.name}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {project.role} • <span className={index === 0 ? 'text-yellow-500 font-bold' : ''}>{project.deadline}</span>
                                            </p>
                                        </div>
                                        <span className="text-xs font-mono text-primary">{project.progress}%</span>
                                    </div>
                                    <Progress value={project.progress} className="h-2" indicatorClassName={project.progress >= 90 ? 'bg-green-500' : project.progress >= 50 ? 'bg-primary' : 'bg-muted-foreground'} />
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground">No live repositories linked yet.</p>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="nebula-card p-5"
                    >
                        <h3 className="text-sm font-semibold text-foreground mb-4">My Task Breakdown</h3>
                        <div className="flex items-center gap-8 justify-center sm:justify-start">
                            <ResponsiveContainer width={180} height={180}>
                                <PieChart>
                                    <Pie data={taskBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                        {taskBreakdown.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'hsl(234, 55%, 18%)', border: '1px solid hsl(257, 60%, 30%)', borderRadius: '8px', color: 'hsl(233, 60%, 92%)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3 min-w-[140px]">
                                {taskBreakdown.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                                        <span className="text-sm text-foreground">{item.name}</span>
                                        <span className="text-sm font-bold text-foreground ml-auto">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="nebula-card p-5 bg-gradient-to-b from-card to-background"
                    >
                        <div className="flex items-center justify-between mb-4 gap-2">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" /> Today's Schedule
                            </h3>
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Live</Badge>
                        </div>
                        <div className="relative border-l-2 border-border/30 ml-2 space-y-6 pl-4 py-2">
                            {schedule.length > 0 ? schedule.map((item, index) => (
                                <div key={item._id || index} className="relative">
                                    <span className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-background ${index === 0 ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`}></span>
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-mono mb-0.5 ${index === 0 ? 'text-green-500 font-bold' : 'text-muted-foreground'}`}>
                                            {item.startTime ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Soon'}
                                        </span>
                                        <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="text-[9px] py-0 px-1.5 h-4">{item.type}</Badge>
                                            <span className="text-[10px] text-muted-foreground">
                                                {item.startTime && item.endTime ? `${Math.round((new Date(item.endTime) - new Date(item.startTime)) / 60000)} min` : 'Live workspace data'}
                                            </span>
                                        </div>
                                    </div>
                                    <Button size="sm" className="w-full mt-3 h-7 text-xs" variant="gradient" onClick={() => window.alert(`Joining meeting: ${item.title}`)}>
                                        <Play className="w-3 h-3 mr-1.5" /> Join Meeting
                                    </Button>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground">No meetings scheduled in this workspace yet.</p>
                            )}
                        </div>
                    </motion.div>

                    <ActivityFeed activities={activities} />
                </div>
            </div>
        </div>
    );
};

export default CollaboratorDashboard;

import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserProfileCard from '@/components/common/UserProfileCard';
import RoleBadge from '@/components/common/RoleBadge';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Zap, Users } from 'lucide-react';

const SettingsPage = () => {
    const { user, role, selectedRepo } = useAuth();
    const navigate = useNavigate();

    const featuresByRole = {
        pm: [
            { icon: Users, label: 'Manage Team Members', description: 'Add, remove, or update team member roles' },
            { icon: Shield, label: 'Workspace Administration', description: 'Control workspace settings and access' },
            { icon: Zap, label: 'Performance Analytics', description: 'View detailed team performance metrics' },
        ],
        collaborator: [
            { icon: Zap, label: 'Performance Analytics', description: 'View your performance metrics' },
            { icon: Users, label: 'Team Collaboration', description: 'Collaborate with team members and view tasks' },
        ]
    };

    const currentFeatures = featuresByRole[role] || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Go back"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your account and workspace preferences</p>
                </div>
            </div>

            {/* User Profile Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Your Profile</h2>
                <UserProfileCard 
                    user={user} 
                    role={role}
                    clickable={role === 'pm'}
                />
            </section>

            {/* Workspace Info */}
            <section className="space-y-4 p-6 rounded-xl border border-border/30 bg-card/50">
                <h2 className="text-xl font-bold">Workspace Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Current Role</p>
                        <div className="flex items-center gap-2">
                            <RoleBadge role={role} size="md" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                        <p className="font-medium text-foreground">{user?.email}</p>
                    </div>
                    {selectedRepo && (
                        <>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Repository</p>
                                <p className="font-medium text-foreground">{selectedRepo.fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Workspace ID</p>
                                <p className="font-mono text-sm text-foreground break-all">{selectedRepo.workspaceId}</p>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Role-Based Features */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Available Features</h2>
                <p className="text-muted-foreground">
                    As a <span className="font-semibold text-foreground capitalize">{role}</span>, you have access to:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentFeatures.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-4 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/40 transition-colors space-y-2"
                            >
                                <div className="flex items-start gap-3">
                                    <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-foreground">
                                            {feature.label}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Role Information */}
            <section className="space-y-4 p-6 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                <h2 className="text-xl font-bold">About Your Role</h2>
                {role === 'pm' ? (
                    <div className="space-y-3">
                        <p className="text-sm text-foreground">
                            As a <span className="font-semibold">Project Manager</span>, you have full control over your workspace:
                        </p>
                        <ul className="space-y-2 text-sm text-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">✓</span>
                                <span>Add and remove team members</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">✓</span>
                                <span>Assign and update member roles</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">✓</span>
                                <span>Configure workspace settings</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">✓</span>
                                <span>View comprehensive performance analytics</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => navigate('/pm/members')}
                            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                            Manage Team Members →
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-foreground">
                            As a <span className="font-semibold">Collaborator</span>, you can:
                        </p>
                        <ul className="space-y-2 text-sm text-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">✓</span>
                                <span>View and complete assigned tasks</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">✓</span>
                                <span>Collaborate with team members</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">✓</span>
                                <span>Access team dashboards and performance </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">✓</span>
                                <span>Participate in team group activities</span>
                            </li>
                        </ul>
                    </div>
                )}
            </section>
        </motion.div>
    );
};

export default SettingsPage;

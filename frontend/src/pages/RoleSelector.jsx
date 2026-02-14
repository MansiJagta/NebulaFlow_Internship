import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import ParticleBackground from '@/components/layout/ParticleBackground';
import { Shield, Users, Rocket, ArrowRight, X, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

const roles = [
    {
        id: 'pm',
        title: 'Project Manager',
        emoji: '👑',
        description: 'Manage projects, assign tasks, track performance, and oversee team collaboration across all tools.',
        icon: Shield,
        color: 'from-nebula-cyan to-nebula-purple',
        badgeColor: 'cyan',
        features: ['Dashboard Analytics', 'Team Management', 'Performance Tracking', 'Task Assignment'],
    },
    {
        id: 'collaborator',
        title: 'Collaborator',
        emoji: '👨‍💻',
        description: 'Work on tasks, communicate with team, submit updates, and contribute to active projects.',
        icon: Users,
        color: 'from-nebula-pink to-nebula-deep',
        badgeColor: 'pink',
        features: ['Task Board', 'Team Chat', 'Code Reviews', 'Progress Updates'],
    },
];

const RoleSelector = () => {
    const { selectRole } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);

    const handleConfirm = () => {
        if (!selectedRole) return;
        selectRole(selectedRole);
        navigate('/repository-selection');
    };

    const selected = roles.find(r => r.id === selectedRole);

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <ParticleBackground />

            {/* Floating orbs */}
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-[120px] -top-20 -right-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, hsl(var(--nebula-cyan) / 0.8), transparent)' }}
                animate={{ scale: [1, 1.1, 0.9, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] -bottom-20 -left-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, hsl(var(--nebula-purple) / 0.8), transparent)' }}
                animate={{ scale: [1, 1.2, 0.9, 1], rotate: [0, -90, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative z-10 w-full max-w-4xl px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <motion.div
                        className="inline-flex items-center gap-3 mb-4"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <motion.div
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-nebula-cyan to-nebula-purple flex items-center justify-center shadow-[0_0_15px_hsla(var(--nebula-cyan),0.4)]"
                            whileHover={{ rotate: 15, scale: 1.1 }}
                        >
                            <Rocket className="w-6 h-6 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-nebula-cyan to-nebula-purple bg-clip-text text-transparent">
                            Choose Your Role
                        </h1>
                    </motion.div>
                    <p className="text-muted-foreground text-lg">Select how you want to experience Nebula Flow</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {roles.map((role, i) => (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15, type: 'spring', stiffness: 100 }}
                            onClick={() => setSelectedRole(role.id)}
                        >
                            <GlassCard
                                className={`group cursor-pointer h-full border-white/5 hover:border-white/20 transition-all duration-500 relative overflow-hidden ${selectedRole === role.id ? 'ring-2 ring-nebula-cyan ring-offset-2 ring-offset-background' : ''}`}
                            >
                                {/* Hover Gradient Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                <div className="p-8 relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <role.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <span className="text-3xl filter drop-shadow-md group-hover:scale-125 transition-transform duration-300 transform origin-top-right">{role.emoji}</span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-nebula-cyan transition-colors">
                                        {role.title}
                                    </h2>

                                    <p className="text-muted-foreground leading-relaxed mb-6 min-h-[48px]">
                                        {role.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {role.features.map(f => (
                                            <Badge key={f} variant={role.badgeColor} className="bg-opacity-10 border-white/5">
                                                {f}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Confirmation Dialog (Modal replacement using Dialog component) */}
            <Dialog open={!!selectedRole} onOpenChange={(open) => !open && setSelectedRole(null)}>
                <DialogContent className="sm:max-w-md border-white/10 bg-black/40 backdrop-blur-xl">
                    <DialogHeader className="items-center text-center">
                        {selected && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`w-20 h-20 rounded-full bg-gradient-to-br ${selected.color} flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(var(--nebula-cyan),0.3)]`}
                            >
                                <selected.icon className="w-10 h-10 text-white" />
                            </motion.div>
                        )}
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Confirm Selection
                        </DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            You are about to enter as <span className={`font-semibold ${selected?.id === 'pm' ? 'text-nebula-cyan' : 'text-nebula-pink'}`}>{selected?.title}</span>.
                            <br />
                            Explore the workspace tailored for you.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:justify-center mt-6 w-full">
                        <Button
                            variant="outline"
                            onClick={() => setSelectedRole(null)}
                            className="flex-1 border-white/10 hover:bg-white/5 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="gradient"
                            onClick={handleConfirm}
                            className="flex-1 shadow-[0_0_15px_rgba(var(--nebula-cyan),0.4)]"
                        >
                            Continue <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RoleSelector;

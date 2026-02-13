import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import ParticleBackground from '@/components/layout/ParticleBackground';
import { Shield, Users, Rocket, ArrowRight, X } from 'lucide-react';

const roles = [
  {
    id: 'pm' as const,
    title: 'Project Manager',
    emoji: '👑',
    description: 'Manage projects, assign tasks, track performance, and oversee team collaboration across all tools.',
    icon: Shield,
    color: 'from-primary to-secondary',
    glowColor: 'hsl(187 100% 50% / 0.35)',
    features: ['Dashboard Analytics', 'Team Management', 'Performance Tracking', 'Task Assignment'],
  },
  {
    id: 'collaborator' as const,
    title: 'Collaborator',
    emoji: '👨‍💻',
    description: 'Work on tasks, communicate with team, submit updates, and contribute to active projects.',
    icon: Users,
    color: 'from-secondary to-accent',
    glowColor: 'hsl(340 100% 65% / 0.35)',
    features: ['Task Board', 'Team Chat', 'Code Reviews', 'Progress Updates'],
  },
];

const RoleSelector = () => {
  const { selectRole } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'pm' | 'collaborator' | null>(null);

  const handleConfirm = () => {
    if (!selectedRole) return;
    selectRole(selectedRole);
    navigate(selectedRole === 'pm' ? '/pm/dashboard' : '/collaborator/dashboard');
  };

  const selected = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              className="w-10 h-10 rounded-xl nebula-gradient-bg flex items-center justify-center"
              whileHover={{ rotate: 15 }}
            >
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl font-bold nebula-gradient-text">Choose Your Role</h1>
          </motion.div>
          <p className="text-muted-foreground">Select how you want to use Nebula Flow</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: 'spring', stiffness: 100 }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 40px ${role.glowColor}`,
                borderColor: 'hsl(var(--primary) / 0.5)',
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedRole(role.id)}
              className="nebula-card p-8 text-left group cursor-pointer transition-all duration-300 border border-border/30 hover:border-primary/40"
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                  <role.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="text-2xl">{role.emoji}</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2 group-hover:nebula-gradient-text transition-all">
                {role.title}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {role.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {role.features.map(f => (
                  <span key={f} className="text-xs px-2 py-1 rounded-full bg-muted/40 text-muted-foreground border border-border/20">
                    {f}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedRole && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md"
            onClick={() => setSelectedRole(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="nebula-card p-8 w-full max-w-sm mx-4 text-center border border-border/40"
            >
              <button
                onClick={() => setSelectedRole(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <motion.div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selected.color} flex items-center justify-center mx-auto mb-5`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <selected.icon className="w-8 h-8 text-primary-foreground" />
              </motion.div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                Continue as {selected.emoji} {selected.title}?
              </h3>
              <p className="text-muted-foreground text-sm mb-6">{selected.description}</p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole(null)}
                  className="flex-1 py-2.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-sm font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-lg nebula-gradient-bg text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 animate-glow-pulse"
                >
                  Confirm <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSelector;

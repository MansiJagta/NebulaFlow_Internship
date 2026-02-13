import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import ParticleBackground from '@/components/layout/ParticleBackground';
import { Shield, Users, Rocket } from 'lucide-react';

const roles = [
  {
    id: 'pm' as const,
    title: 'Project Manager',
    description: 'Manage projects, assign tasks, track performance, and oversee team collaboration.',
    icon: Shield,
    color: 'from-primary to-secondary',
    glowColor: 'hsl(187 100% 50% / 0.3)',
  },
  {
    id: 'collaborator' as const,
    title: 'Collaborator',
    description: 'Work on tasks, communicate with team, submit updates, and contribute to projects.',
    icon: Users,
    color: 'from-secondary to-accent',
    glowColor: 'hsl(340 100% 65% / 0.3)',
  },
];

const RoleSelector = () => {
  const { selectRole } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (role: 'pm' | 'collaborator') => {
    selectRole(role);
    navigate(role === 'pm' ? '/pm/dashboard' : '/collaborator/dashboard');
  };

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
            className="inline-flex items-center gap-2 mb-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Rocket className="w-8 h-8 text-primary" />
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
              whileHover={{ scale: 1.03, boxShadow: `0 0 30px ${role.glowColor}` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(role.id)}
              className="nebula-card p-8 text-left group cursor-pointer transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-5`}>
                <role.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2 group-hover:nebula-gradient-text transition-all">
                {role.title}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {role.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;

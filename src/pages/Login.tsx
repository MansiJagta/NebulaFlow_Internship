import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import ParticleBackground from '@/components/layout/ParticleBackground';
import { Rocket, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
    navigate('/select-role');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(187 100% 50% / 0.4), transparent)' }}
        animate={{ x: [0, 50, -30, 0], y: [0, -40, 20, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full opacity-15 right-1/4 top-1/4"
        style={{ background: 'radial-gradient(circle, hsl(340 100% 65% / 0.4), transparent)' }}
        animate={{ x: [0, -40, 30, 0], y: [0, 30, -40, 0], scale: [1, 0.8, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="nebula-card p-8 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-2 mb-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Rocket className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold nebula-gradient-text">Nebula Flow</h1>
          </motion.div>
          <p className="text-muted-foreground">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-lg font-semibold nebula-gradient-bg text-primary-foreground flex items-center justify-center gap-2 animate-glow-pulse disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Demo: use any email & password
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

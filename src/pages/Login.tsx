import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import ParticleBackground from '@/components/layout/ParticleBackground';
import { Rocket, Mail, Lock, ArrowRight, Github, MessageSquare, LayoutGrid, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
    navigate('/select-role');
  };

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.className = 'absolute rounded-full bg-foreground/20 pointer-events-none animate-[ripple_0.6s_ease-out_forwards]';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const oauthProviders = [
    { name: 'GitHub', icon: Github, bg: 'hover:bg-muted/60' },
    { name: 'Slack', icon: MessageSquare, bg: 'hover:bg-muted/60' },
    { name: 'Atlassian', icon: LayoutGrid, bg: 'hover:bg-muted/60' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />

      {/* Floating orbs */}
      <motion.div
        className="absolute w-72 h-72 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(var(--nebula-cyan) / 0.4), transparent)' }}
        animate={{ x: [0, 60, -40, 0], y: [0, -50, 30, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-56 h-56 rounded-full opacity-15 right-1/4 top-1/4"
        style={{ background: 'radial-gradient(circle, hsl(var(--nebula-pink) / 0.4), transparent)' }}
        animate={{ x: [0, -50, 40, 0], y: [0, 40, -50, 0], scale: [1, 0.8, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-40 h-40 rounded-full opacity-10 left-1/4 bottom-1/4"
        style={{ background: 'radial-gradient(circle, hsl(var(--nebula-purple) / 0.5), transparent)' }}
        animate={{ x: [0, 30, -20, 0], y: [0, -30, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="nebula-card p-8 backdrop-blur-xl bg-card/70 border border-border/40">
          {/* Animated Logo */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-3 mb-4"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                className="w-12 h-12 rounded-xl nebula-gradient-bg flex items-center justify-center animate-glow-pulse"
                whileHover={{ rotate: 15, scale: 1.1 }}
              >
                <Rocket className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <h1 className="text-3xl font-extrabold nebula-gradient-text animate-gradient-shift">
                Nebula Flow
              </h1>
            </motion.div>
            <p className="text-muted-foreground text-sm">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border/40 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:shadow-[0_0_15px_hsl(var(--nebula-cyan)/0.2)] transition-all duration-300"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 bg-muted/30 border border-border/40 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:shadow-[0_0_15px_hsl(var(--nebula-cyan)/0.2)] transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </motion.div>

            {/* Remember me */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => setRemember(!remember)}
                  className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                    remember
                      ? 'bg-primary border-primary'
                      : 'border-border/60 bg-muted/20 group-hover:border-primary/50'
                  }`}
                >
                  {remember && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 text-primary-foreground"
                      viewBox="0 0 12 12"
                    >
                      <path d="M2 6l3 3 5-5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" />
                    </motion.svg>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </a>
            </motion.div>

            {/* Sign In Button with Ripple */}
            <motion.button
              ref={buttonRef}
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRipple}
              className="relative overflow-hidden w-full py-3 rounded-lg font-semibold nebula-gradient-bg text-primary-foreground flex items-center justify-center gap-2 animate-glow-pulse disabled:opacity-50 transition-all"
            >
              {loading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>Sign In<ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-3 gap-3">
            {oauthProviders.map((provider, i) => (
              <motion.button
                key={provider.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border border-border/40 bg-muted/20 text-muted-foreground ${provider.bg} transition-all duration-200`}
              >
                <provider.icon className="w-5 h-5" />
                <span className="text-xs">{provider.name}</span>
              </motion.button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Demo: use any email & password
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

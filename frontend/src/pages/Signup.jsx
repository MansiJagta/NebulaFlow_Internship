import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import ParticleBackground from '@/components/layout/ParticleBackground';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/card';
import NebulaLogo from '@/components/common/NebulaLogo';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            await register(email, password, fullName);

            // Check if there's an invite token from accept-invite flow
            const inviteToken = localStorage.getItem('inviteToken');
            if (inviteToken) {
                try {
                    // Accept the invite with the newly created user
                    const res = await axios.get(
                        `${API_BASE_URL}/auth/accept-invite?token=${inviteToken}`,
                        { withCredentials: true }
                    );

                    const { action, redirectUrl } = res.data;

                    // Clean up localStorage
                    localStorage.removeItem('inviteToken');
                    localStorage.removeItem('inviteeEmail');
                    localStorage.removeItem('inviteRole');

                    // Redirect to appropriate dashboard
                    if (action === 'added_to_workspace_authenticated' && redirectUrl) {
                        navigate(redirectUrl);
                    } else {
                        navigate('/repository-selection');
                    }
                } catch (err) {
                    console.error('Failed to process invite after signup:', err);
                    navigate('/repository-selection');
                }
            } else {
                navigate('/repository-selection');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${apiBase}/auth/google`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
        >
            <ParticleBackground />

            <motion.div
                className="absolute w-96 h-96 rounded-full opacity-20 blur-[100px]"
                style={{ background: 'radial-gradient(circle, hsl(var(--nebula-cyan) / 0.6), transparent)' }}
                animate={{ x: [0, 80, -60, 0], y: [0, -60, 40, 0], scale: [1, 1.2, 0.9, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute w-72 h-72 rounded-full opacity-20 blur-[80px] right-1/4 top-1/4"
                style={{ background: 'radial-gradient(circle, hsl(var(--nebula-pink) / 0.6), transparent)' }}
                animate={{ x: [0, -70, 50, 0], y: [0, 50, -60, 0], scale: [1, 0.8, 1.15, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                className="relative z-10 w-full max-w-md px-4"
            >
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <motion.div
                            className="inline-flex items-center gap-3 mb-4"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <motion.div
                                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nebula-cyan/20 to-nebula-purple/20 border border-white/10 flex items-center justify-center shadow-[0_0_20px_hsla(var(--nebula-cyan),0.2)]"
                                whileHover={{ rotate: 15, scale: 1.1 }}
                            >
                                <NebulaLogo className="w-10 h-10" />
                            </motion.div>
                            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-nebula-cyan to-nebula-purple bg-clip-text text-transparent">
                                Create your Nebula Flow account
                            </h1>
                        </motion.div>
                        <p className="text-muted-foreground">Sign up to start collaborating with your team</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                        >
                            <Input
                                type="text"
                                placeholder="Full name"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="h-11 bg-black/20 border-white/10 text-white placeholder:text-muted-foreground/70"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-nebula-cyan transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="Work email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="pl-10 h-11 bg-black/20 border-white/10 text-white placeholder:text-muted-foreground/70"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="space-y-3"
                        >
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-nebula-cyan transition-colors" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="pl-10 pr-10 h-11 bg-black/20 border-white/10 text-white placeholder:text-muted-foreground/70"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <Input
                                type="password"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                className="h-11 bg-black/20 border-white/10 text-white placeholder:text-muted-foreground/70"
                            />
                        </motion.div>

                        {error && (
                            <p className="text-xs text-red-400">{error}</p>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Button
                                type="submit"
                                disabled={loading}
                                variant="gradient"
                                size="lg"
                                className="w-full font-bold shadow-[0_0_20px_hsla(var(--nebula-cyan),0.3)] hover:shadow-[0_0_30px_hsla(var(--nebula-purple),0.5)] transition-shadow duration-300"
                            >
                                {loading ? (
                                    <motion.div
                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    />
                                ) : (
                                    <>Create account<ArrowRight className="w-4 h-4 ml-2" /></>
                                )}
                            </Button>
                        </motion.div>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">or continue with</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={handleGoogleSignUp}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border:white/10 bg-black/20 text-muted-foreground hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-200"
                    >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text:black">
                            G
                        </span>
                        <span className="text-sm font-medium">Sign up with Google</span>
                    </motion.button>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-nebula-cyan hover:text-nebula-cyan/80 underline-offset-4 hover:underline"
                        >
                            Sign in
                        </button>
                    </p>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
};

export default Signup;


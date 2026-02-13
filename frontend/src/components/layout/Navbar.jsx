import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, role } = useAuth();

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="h-14 border-b border-border/30 bg-card/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30"
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="pl-9 pr-4 py-1.5 bg-muted/30 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-64 transition-all"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
                </motion.button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full nebula-gradient-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Navbar;

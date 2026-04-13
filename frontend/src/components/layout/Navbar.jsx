import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, Settings, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RoleBadge from '@/components/common/RoleBadge';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();

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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 group">
                            <Avatar className="h-8 w-8 border-2 border-primary/30 group-hover:border-primary/60 transition-colors">
                                <AvatarImage src={user?.avatar} alt={user?.name} />
                                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-purple-500 text-white font-bold">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[240px]">
                        <DropdownMenuLabel>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-semibold">{user?.name || 'User'}</span>
                                <span className="text-xs text-muted-foreground">{user?.email}</span>
                                <div className="pt-1">
                                    <RoleBadge role={role} size="sm" />
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => navigate(role === 'pm' ? '/pm/dashboard' : '/collaborator/dashboard')}
                            className="cursor-pointer"
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => navigate('/settings')}
                            className="cursor-pointer"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={async () => {
                                await logout();
                                navigate('/login');
                            }}
                            className="cursor-pointer text-red-400 focus:text-red-400"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.header>
    );
};

export default Navbar;

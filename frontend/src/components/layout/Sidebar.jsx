import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard, ListChecks, MessageSquare, GitBranch,
    BarChart3, UserPlus, LogOut, Rocket, ChevronLeft, ArrowLeft
} from 'lucide-react';
import { useState } from 'react';

const pmLinks = [
    { to: '/pm/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/pm/jira', label: 'Jira', icon: ListChecks },
    { to: '/pm/slack', label: 'Slack', icon: MessageSquare },
    { to: '/pm/github', label: 'GitHub', icon: GitBranch },
    { to: '/pm/performance', label: 'Performance', icon: BarChart3 },
    { to: '/pm/members', label: 'Add Members', icon: UserPlus },
];

const collabLinks = [
    { to: '/collaborator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/collaborator/jira', label: 'Jira', icon: ListChecks },
    { to: '/collaborator/slack', label: 'Slack', icon: MessageSquare },
    { to: '/collaborator/github', label: 'GitHub', icon: GitBranch },
    { to: '/collaborator/performance', label: 'Performance', icon: BarChart3 },
    { to: '/collaborator/group', label: 'Group', icon: LayoutDashboard },
];

const Sidebar = ({ collapsed: propCollapsed, setCollapsed: propSetCollapsed }) => {
    const { role, logout, user } = useAuth();
    const navigate = useNavigate();
    const [localCollapsed, setLocalCollapsed] = useState(false);

    const collapsed = propCollapsed !== undefined ? propCollapsed : localCollapsed;
    const setCollapsed = propSetCollapsed !== undefined ? propSetCollapsed : setLocalCollapsed;

    const links = role === 'pm' ? pmLinks : collabLinks;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}
        >
            {/* Logo */}
            <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 focus:outline-none">
                    <Rocket className="w-6 h-6 text-primary flex-shrink-0" />
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-lg nebula-gradient-text"
                        >
                            Nebula Flow
                        </motion.span>
                    )}
                </button>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Back to Repo Selection */}
            <div className="p-2 border-b border-sidebar-border">
                <button
                    onClick={() => navigate('/repository-selection')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                    title="Back to Repository Selection"
                >
                    <ArrowLeft className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Back to Repos</span>}
                </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {links.map((link, i) => (
                    <motion.div
                        key={link.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 120 }}
                    >
                        <NavLink
                            to={link.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-sidebar-accent text-primary nebula-glow-cyan'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                                } ${collapsed ? 'justify-center' : ''}`
                            }
                        >
                            <link.icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>{link.label}</span>}
                        </NavLink>
                    </motion.div>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="p-3 border-t border-sidebar-border space-y-2">
                {!collapsed && user && (
                    <div className="px-2 py-1">
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <p className="text-xs text-primary capitalize">{role}</p>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-accent hover:bg-muted/30 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
                >
                    <LogOut className="w-5 h-5" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;

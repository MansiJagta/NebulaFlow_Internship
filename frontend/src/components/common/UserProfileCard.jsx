import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RoleBadge from '@/components/common/RoleBadge';
import { useNavigate } from 'react-router-dom';

export const UserProfileCard = ({ user, role, compact = false, clickable = false }) => {
    const navigate = useNavigate();

    if (!user) return null;

    const handleClick = () => {
        if (clickable && role === 'pm') {
            navigate('/pm/members');
        }
    };

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-2 p-2 rounded-lg border border-primary/20 bg-primary/5 ${
                    clickable ? 'cursor-pointer hover:bg-primary/10 transition-colors' : ''
                }`}
                onClick={handleClick}
            >
                <Avatar className="w-8 h-8 border border-primary/30">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {user.name?.[0] || '?'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                        {user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                        {user.email}
                    </p>
                </div>
                <RoleBadge role={role} size="xs" showIcon={false} />
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className={`p-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 space-y-3 ${
                clickable ? 'cursor-pointer hover:border-primary/40 transition-colors' : ''
            }`}
            onClick={handleClick}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-12 h-12 border-2 border-primary/30">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-sm bg-primary/20 text-primary font-bold">
                            {user.name?.[0] || '?'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-foreground">
                            {user.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                <span className="text-xs font-medium text-muted-foreground">
                    Workspace Role
                </span>
                <RoleBadge role={role} size="md" />
            </div>
            {clickable && role === 'pm' && (
                <p className="text-xs text-primary font-medium italic">
                    Click to manage workspace members →
                </p>
            )}
        </motion.div>
    );
};

export default UserProfileCard;

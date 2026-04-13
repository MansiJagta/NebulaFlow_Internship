import { Badge } from '@/components/ui/badge';
import { Crown, Users } from 'lucide-react';

export const RoleBadge = ({ role, size = 'sm', className = '', showIcon = true }) => {
    const normalizedRole = String(role || 'collaborator').toLowerCase();
    const roleConfig = {
        pm: {
            label: 'PM',
            color: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
            icon: Crown,
            description: 'Project Manager'
        },
        collaborator: {
            label: 'Collaborator',
            color: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
            icon: Users,
            description: 'Team Member'
        }
    };

    const config = roleConfig[normalizedRole] || roleConfig.collaborator;
    const Icon = config.icon;

    const sizeClasses = {
        xs: 'text-[10px] px-1.5 py-0.5',
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-2.5 py-1.5',
        lg: 'text-base px-3 py-2'
    };

    const iconSizes = {
        xs: 'w-3 h-3',
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <div className={`flex items-center gap-1 ${sizeClasses[size]} ${className}`}>
            {showIcon && <Icon className={iconSizes[size] || iconSizes.sm} />}
            <Badge className={`${config.color} border rounded-full font-medium pointer-events-none`} title={config.description}>
                {config.label}
            </Badge>
        </div>
    );
};

export default RoleBadge;

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import RoleBadge from '@/components/common/RoleBadge';

export const CollaboratorsSection = ({ currentUser, collaborators, collapsed = false }) => {
    if (collapsed) return null;

    const memberList = Array.isArray(collaborators) ? collaborators : [];

    // Add current user to the list and mark as self
    const allMembers = currentUser 
        ? [
            { ...currentUser, isSelf: true },
            ...memberList.filter(c => c._id !== currentUser?.id)
        ]
        : memberList;

    if (allMembers.length === 0) return null;

    return (
        <div className="mt-8 px-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-3 h-3" /> Collaborators
            </h3>
            <div className="space-y-3">
                {allMembers.map((member, idx) => (
                    <motion.div
                        key={member._id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center justify-between gap-2 p-2 rounded-lg group cursor-pointer transition-colors ${
                            member.isSelf 
                                ? 'bg-primary/10 border border-primary/30 hover:bg-primary/20' 
                                : 'hover:bg-sidebar-accent/50'
                        }`}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="relative flex-shrink-0">
                                <Avatar className="w-7 h-7 border border-sidebar-border">
                                    <AvatarImage src={member.avatar || member.avatarUrl} />
                                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary uppercase">
                                        {(member.name || member.fullName)?.[0] || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                {/* Online indicator */}
                                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-sidebar rounded-full shadow-sm"></span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-sidebar-foreground group-hover:text-foreground truncate font-medium transition-colors">
                                    {member.name || member.fullName}
                                    {member.isSelf && <span className="text-[10px] text-muted-foreground ml-1">(You)</span>}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                    {member.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <RoleBadge role={member.role || 'collaborator'} size="xs" showIcon={false} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CollaboratorsSection;

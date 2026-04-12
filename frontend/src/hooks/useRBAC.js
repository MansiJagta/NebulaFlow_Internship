import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for Role-Based Access Control (RBAC)
 * Returns permission flags based on the user's role in the current workspace.
 */
export const useRBAC = () => {
    const { user, workspace } = useAuth();

    // Determine role in the active workspace
    const currentMember = useMemo(() => {
        if (!user || !workspace?.members) return null;
        return workspace.members.find(m => 
            (m._id === user.id) || 
            (m.userId === user.id) || 
            (m.userId?._id === user.id) ||
            (m.userId === user._id)
        );
    }, [user, workspace]);

    const role = (currentMember?.role || user?.role || 'collaborator').toLowerCase();

    const permissions = useMemo(() => ({
        role,
        isPM: role === 'pm',
        canInvite: role === 'pm',
        canEditStructure: role === 'pm',
        canManageSprints: ['pm', 'developer'].includes(role),
        canViewAuditLogs: role === 'pm',
    }), [role]);

    return permissions;
};

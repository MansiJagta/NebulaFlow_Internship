import { useAuth } from '@/contexts/AuthContext';

/**
 * Component to conditionally render content based on user role
 * @param {string} requiredRole - 'pm' or 'collaborator'
 * @param {ReactNode} children - Content to render if role matches
 * @param {ReactNode} fallback - Content to render if role doesn't match
 */
export const RoleProtected = ({ requiredRole, children, fallback = null }) => {
    const { role } = useAuth();
    const normalizedRole = String(role || '').toLowerCase();

    if (!normalizedRole) return fallback;

    const roleHierarchy = {
        'pm': ['pm'],
        'collaborator': ['collaborator', 'pm'] // collaborators can see collaborator features, PMs can see everything
    };

    const allowedRoles = roleHierarchy[requiredRole] || [];

    return allowedRoles.includes(normalizedRole) ? children : fallback;
};

/**
 * Hook to check if current user has specific role
 * @param {string|string[]} requiredRoles - Single role or array of roles
 * @returns {boolean} - Whether user has the required role(s)
 */
export const useHasRole = (requiredRoles) => {
    const { role } = useAuth();
    const normalizedRole = String(role || '').toLowerCase();

    if (!requiredRoles) return false;

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.map((item) => String(item || '').toLowerCase()).includes(normalizedRole);
};

/**
 * Hook to get feature access based on role
 * @returns {object} - Feature access flags
 */
export const useFeatureAccess = () => {
    const { role } = useAuth();
    const normalizedRole = String(role || '').toLowerCase();

    return {
        isPM: normalizedRole === 'pm',
        isCollaborator: normalizedRole === 'collaborator',
        canManageMembers: normalizedRole === 'pm',
        canViewPerformance: ['pm', 'collaborator'].includes(normalizedRole),
        canViewJira: ['pm', 'collaborator'].includes(normalizedRole),
        canViewSlack: ['pm', 'collaborator'].includes(normalizedRole),
        canViewGitHub: ['pm', 'collaborator'].includes(normalizedRole),
        canViewDashboard: ['pm', 'collaborator'].includes(normalizedRole),
        canViewGroup: normalizedRole === 'collaborator',
    };
};

export default RoleProtected;

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to listen for role changes and trigger updates
 * Useful for components that need to respond to role changes in real-time
 */
export const useRoleSync = (onRoleChange) => {
    const { user, token } = useAuth();

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'nebula-user') {
                const newUser = JSON.parse(e.newValue || '{}');
                const oldUser = user ? JSON.parse(JSON.stringify(user)) : null;
                
                if (newUser?.role !== oldUser?.role) {
                    onRoleChange?.(newUser?.role, oldUser?.role);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [user, onRoleChange]);

    // Fetch latest user info from API to sync role
    const syncRoleFromServer = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                const stored = JSON.parse(localStorage.getItem('nebula-user') || '{}');
                
                if (userData.user?.role && userData.user.role !== stored.role) {
                    const updated = { ...stored, role: userData.user.role };
                    localStorage.setItem('nebula-user', JSON.stringify(updated));
                    onRoleChange?.(userData.user.role, stored.role);
                }
            }
        } catch (err) {
            console.warn('Failed to sync role from server:', err);
        }
    }, [token, onRoleChange]);

    return { syncRoleFromServer };
};

export default useRoleSync;

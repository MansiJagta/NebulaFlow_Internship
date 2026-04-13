import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const REFRESH_INTERVAL = 30000;

export const useCollaborators = (workspaceId) => {
    const [collaborators, setCollaborators] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = useCallback(async () => {
        if (!workspaceId) {
            setCollaborators([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`/api/workspace/${workspaceId}/members`, { withCredentials: true });

            const raw = response.data;
            const members = Array.isArray(raw) ? raw : (raw?.members || []);
            const filtered = members.filter(m => m.lastSeenAt !== null);

            const uniqueMembers = [];
            const seenIds = new Set();
            for (const m of filtered) {
                if (!seenIds.has(m._id)) {
                    seenIds.add(m._id);
                    uniqueMembers.push(m);
                }
            }

            setCollaborators(uniqueMembers);
        } catch (err) {
            console.error('Error fetching scoped collaborators:', err);
            setCollaborators([]);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        let active = true;

        const run = async () => {
            if (!active) return;
            await fetchMembers();
        };

        run();

        const interval = setInterval(run, REFRESH_INTERVAL);
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                run();
            }
        };

        window.addEventListener('focus', run);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            active = false;
            clearInterval(interval);
            window.removeEventListener('focus', run);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [fetchMembers]);

    return { collaborators, loading };
};
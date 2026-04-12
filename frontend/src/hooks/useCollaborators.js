import { useState, useEffect } from 'react';
import axios from 'axios';

export const useCollaborators = (workspaceId) => {
    const [collaborators, setCollaborators] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!workspaceId) {
                setCollaborators([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // The new workspace-scoped endpoint
                const response = await axios.get(`/api/workspace/${workspaceId}/members`, { withCredentials: true });
                
                // Constraints:
                // 1. lastSeenAt check
                // 2. deduplication by _id (manual check to avoid extra deps)
                const raw = response.data;
                const members = Array.isArray(raw) ? raw : (raw?.members || []);
                const filtered = members.filter(m => m.lastSeenAt !== null);
                
                // Keep only one occurrence of each user ID
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
                console.error("Error fetching scoped collaborators:", err);
                setCollaborators([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [workspaceId]); 

    return { collaborators, loading };
};
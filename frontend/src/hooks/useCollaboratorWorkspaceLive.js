import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const REFRESH_INTERVAL = 30000;

const safeArray = (value) => (Array.isArray(value) ? value : []);

export const useCollaboratorWorkspaceLive = () => {
    const { selectedRepo, token, API_BASE_URL } = useAuth();

    const [workspace, setWorkspace] = useState(null);
    const [repoList, setRepoList] = useState([]);
    const [repoDetails, setRepoDetails] = useState(null);
    const [repoCollaborators, setRepoCollaborators] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [issues, setIssues] = useState([]);
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const axiosConfig = useMemo(() => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return { headers, withCredentials: true };
    }, [token]);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const workspaceIdToFetch = selectedRepo?.workspaceId || null;
            const wsUrl = workspaceIdToFetch 
                ? `${API_BASE_URL}/workspace/${workspaceIdToFetch}` 
                : `${API_BASE_URL}/workspace/me`;

            const workspaceRes = await axios.get(wsUrl, axiosConfig).catch(() => ({ data: null }));
            const nextWorkspace = workspaceRes.data || null;
            const workspaceId = nextWorkspace?._id || workspaceIdToFetch;
            
            const owner = selectedRepo?.owner || (selectedRepo?.fullName?.includes('/') ? selectedRepo.fullName.split('/')[0] : null) || nextWorkspace?.githubConfig?.repoOwner;
            const repo = selectedRepo?.name || nextWorkspace?.githubConfig?.repoName;

            const requests = [
                axios.get(`${API_BASE_URL}/auth/github/repos`, axiosConfig).catch(() => ({ data: [] })),
                workspaceId
                    ? axios.get(`${API_BASE_URL}/pm/issues?workspaceId=${workspaceId}`, axiosConfig).catch(() => ({ data: [] }))
                    : Promise.resolve({ data: [] }),
                workspaceId
                    ? axios.get(`${API_BASE_URL}/meetings?workspaceId=${workspaceId}`, axiosConfig).catch(() => ({ data: [] }))
                    : Promise.resolve({ data: [] }),
                workspaceId
                    ? axios.get(`${API_BASE_URL}/performance/${workspaceId}`, axiosConfig).catch(() => ({ data: null }))
                    : Promise.resolve({ data: null }),
                workspaceId
                    ? axios.get(`${API_BASE_URL}/workspace/${workspaceId}/members`, axiosConfig).catch(() => ({ data: [] }))
                    : Promise.resolve({ data: [] }),
                owner && repo
                    ? axios.get(`${API_BASE_URL}/github/repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`, axiosConfig).catch(() => ({ data: null }))
                    : Promise.resolve({ data: null }),
                owner && repo
                    ? axios.get(`${API_BASE_URL}/github/repo/collaborators?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`, axiosConfig).catch(() => ({ data: [] }))
                    : Promise.resolve({ data: [] }),
            ];

            const [reposRes, issuesRes, meetingsRes, performanceRes, membersRes, repoRes, collaboratorsRes] = await Promise.all(requests);

            const members = safeArray(membersRes.data);

            setWorkspace(nextWorkspace ? {
                ...nextWorkspace,
                members: members.length > 0 ? members : safeArray(nextWorkspace.members),
            } : (workspaceId ? { _id: workspaceId, members } : null));
            setRepoList(safeArray(reposRes.data));
            setIssues(safeArray(issuesRes.data));
            setMeetings(safeArray(meetingsRes.data));
            setPerformance(performanceRes.data || null);
            setRepoDetails(repoRes.data || null);
            setRepoCollaborators(safeArray(collaboratorsRes.data));
        } catch (fetchError) {
            console.error('[useCollaboratorWorkspaceLive] refresh failed', fetchError);
            setError(fetchError);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, axiosConfig, selectedRepo?.fullName, selectedRepo?.name, selectedRepo?.owner, selectedRepo?.workspaceId]);

    useEffect(() => {
        let active = true;

        const refresh = async () => {
            if (!active) return;
            await loadData();
        };

        refresh();

        const interval = setInterval(refresh, REFRESH_INTERVAL);
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                refresh();
            }
        };

        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            active = false;
            clearInterval(interval);
            window.removeEventListener('focus', refresh);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [loadData]);

    return {
        workspace,
        repoList,
        repoDetails,
        repoCollaborators,
        meetings,
        issues,
        performance,
        loading,
        error,
        refresh: loadData,
        workspaceId: selectedRepo?.workspaceId || workspace?._id || null,
    };
};

export default useCollaboratorWorkspaceLive;
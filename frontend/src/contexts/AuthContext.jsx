import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('nebula-user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('nebula-token'));
    const [selectedRepo, setSelectedRepoState] = useState(() => {
        const saved = localStorage.getItem('nebula-selected-repo');
        return saved ? JSON.parse(saved) : null;
    });

    const syncUser = useCallback((apiUser, nextToken) => {
        if (!apiUser) {
            if (user !== null) {
                setUser(null);
                localStorage.removeItem('nebula-user');
                setToken(null);
                localStorage.removeItem('nebula-token');
            }
            return;
        }

        const mapped = {
            id: apiUser._id || apiUser.id,
            name: apiUser.fullName || apiUser.email?.split('@')[0] || '',
            email: apiUser.email,
            avatar: apiUser.avatarUrl || '',
            role: apiUser.role ?? null,
        };

        // Deep comparison to prevent re-renders
        const isSameUser = user && 
            user.id === mapped.id && 
            user.email === mapped.email && 
            user.role === mapped.role &&
            user.name === mapped.name;

        if (!isSameUser) {
            setUser(mapped);
            localStorage.setItem('nebula-user', JSON.stringify(mapped));
        }

        if (nextToken && nextToken !== token) {
            setToken(nextToken);
            localStorage.setItem('nebula-token', nextToken);
        }
    }, [user, token]);

    /** Persist the selected GitHub repo so all pages can read it */
    const setRepo = useCallback((repo) => {
        if (!repo) {
            setSelectedRepoState(null);
            localStorage.removeItem('nebula-selected-repo');
            return;
        }
        // Normalise fields – repo object comes from /api/auth/github/repos
        const normalised = {
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name || repo.fullName || repo.name,
            description: repo.description || '',
            language: repo.language || null,
            stars: repo.stars ?? repo.stargazers_count ?? 0,
            forks: repo.forks ?? repo.forks_count ?? 0,
            owner: repo.owner || repo.fullName?.split('/')[0] || repo.name,
            private: repo.private ?? repo.isPrivate ?? false,
        };
        setSelectedRepoState(normalised);
        localStorage.setItem('nebula-selected-repo', JSON.stringify(normalised));
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await fetch(`${API_BASE_URL}/api/auth/login-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            throw new Error('Login failed');
        }

        const data = await res.json();
        syncUser(data.user, data.token);
    }, [syncUser]);

    const register = useCallback(async (email, password, fullName) => {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, fullName }),
        });

        if (!res.ok) {
            throw new Error('Registration failed');
        }

        const data = await res.json();
        syncUser(data.user, data.token);
    }, [syncUser]);

    const selectRole = useCallback((role) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, role };
            localStorage.setItem('nebula-user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // ignore network errors on logout
        }
        setUser(null);
        localStorage.removeItem('nebula-user');
        setToken(null);
        localStorage.removeItem('nebula-token');
        setSelectedRepoState(null);
        localStorage.removeItem('nebula-selected-repo');
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
                    credentials: 'include',
                    headers,
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.user) {
                    // keep existing token unless backend returns a new one
                    syncUser(data.user, null);
                } else if (!data.user && token) {
                    // token is no longer valid
                    syncUser(null, null);
                }
            } catch {
                // ignore initial load failures
            }
        };
        load();
    }, [syncUser, token]);

    return (
        <AuthContext.Provider value={{
            user,
            role: user?.role ?? null,
            isAuthenticated: !!user,
            token,
            selectedRepo,
            setRepo,
            login,
            register,
            selectRole,
            logout,
            API_BASE_URL,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

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

    const syncUser = useCallback((apiUser, nextToken) => {
        if (!apiUser) {
            setUser(null);
            localStorage.removeItem('nebula-user');
            setToken(null);
            localStorage.removeItem('nebula-token');
            return;
        }

        const mapped = {
            id: apiUser.id,
            name: apiUser.fullName || apiUser.email?.split('@')[0] || '',
            email: apiUser.email,
            avatar: apiUser.avatarUrl || '',
            role: apiUser.role ?? null,
        };

        setUser(mapped);
        localStorage.setItem('nebula-user', JSON.stringify(mapped));
        if (nextToken) {
            setToken(nextToken);
            localStorage.setItem('nebula-token', nextToken);
        }
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
            login,
            register,
            selectRole,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};


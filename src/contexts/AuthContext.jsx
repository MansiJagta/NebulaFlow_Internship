import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('nebula-user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = useCallback(async (email, _password) => {
        const newUser = {
            name: email.split('@')[0],
            email,
            avatar: '',
            role: null,
        };
        setUser(newUser);
        localStorage.setItem('nebula-user', JSON.stringify(newUser));
    }, []);

    const selectRole = useCallback((role) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, role };
            localStorage.setItem('nebula-user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('nebula-user');
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            role: user?.role ?? null,
            isAuthenticated: !!user,
            login,
            selectRole,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

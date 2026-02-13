import React, { createContext, useContext, useState, useCallback } from 'react';

type Role = 'pm' | 'collaborator' | null;

interface User {
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  selectRole: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nebula-user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, _password: string) => {
    const newUser: User = {
      name: email.split('@')[0],
      email,
      avatar: '',
      role: null,
    };
    setUser(newUser);
    localStorage.setItem('nebula-user', JSON.stringify(newUser));
  }, []);

  const selectRole = useCallback((role: Role) => {
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

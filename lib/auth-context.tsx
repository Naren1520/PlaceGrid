'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'student' | 'company' | 'coordinator';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  skills?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, name: string, role: UserRole, token: string, companyId?: string) => void;
  logout: () => void;
  updateUserSkills: (skills: string[]) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name: string, role: UserRole, authToken: string, companyId?: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      role,
      companyId,
      skills: [],
    };
    setUser(newUser);
    setToken(authToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    localStorage.setItem('auth_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  const updateUserSkills = (skills: string[]) => {
    if (user) {
      const updated = { ...user, skills };
      setUser(updated);
      localStorage.setItem('auth_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUserSkills }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

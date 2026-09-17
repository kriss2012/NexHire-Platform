import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, role: 'USER' | 'EMPLOYER') => Promise<void>;
  logout: () => void;
  quickLogin: (role: 'ADMIN' | 'EMPLOYER' | 'USER') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('jobboard_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore active session
  useEffect(() => {
    async function restoreUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    restoreUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/login', {
      email,
      password,
    });
    const { user: loggedInUser, token: authToken } = res.data;
    localStorage.setItem('jobboard_token', authToken);
    setToken(authToken);
    setUser(loggedInUser);
  };

  const register = async (email: string, password: string, full_name: string, role: 'USER' | 'EMPLOYER') => {
    const res = await api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/register', {
      email,
      password,
      full_name,
      role,
    });
    const { user: registeredUser, token: authToken } = res.data;
    localStorage.setItem('jobboard_token', authToken);
    setToken(authToken);
    setUser(registeredUser);
  };

  const logout = () => {
    localStorage.removeItem('jobboard_token');
    setToken(null);
    setUser(null);
  };

  // Recruiter 1-Click Fast Demonstrator
  const quickLogin = async (role: 'ADMIN' | 'EMPLOYER' | 'USER') => {
    if (role === 'ADMIN') {
      await login('admin@jobboard.io', 'Admin123!');
    } else if (role === 'EMPLOYER') {
      await login('recruiter@techcorp.io', 'Employer123!');
    } else {
      await login('alex.dev@cloud.io', 'Applicant123!');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, quickLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

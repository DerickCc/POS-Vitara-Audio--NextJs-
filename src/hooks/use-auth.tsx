'use client';

import { SessionData } from '@/models/session.model';
import { getSession } from '@/utils/sessionlib';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: SessionData | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionData | null>(null);

  // Fetch the user session when the provider mounts
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const session = await getSession();
      const userData: SessionData = {
        id: session.id,
        name: session.name,
        username: session.username,
        role: session.role,
      };
      setUser(userData);
    } catch (e) {
      setUser(null);
      console.error('Failed to fetch user:', e);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const session = await getSession();
      session.destroy();
      setUser(null);
    } catch (e) {
      console.error('Failed to log out:', e);
    }
  };

  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthContextProvider');
  }
  return context;
}

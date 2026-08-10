import { createContext, useContext, useState, ReactNode } from 'react';
import { initThoughtSpot, ensureRestSession } from '../lib/thoughtspot';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string;
  password: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async (user: string, pass: string) => {
    initThoughtSpot(user, pass);
    await ensureRestSession(user, pass);
    setUsername(user);
    setPassword(pass);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, username, password, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

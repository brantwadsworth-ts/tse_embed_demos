import { createContext, useContext, useState, ReactNode } from 'react';
import { initThoughtSpot, resetThoughtSpot } from '../lib/thoughtspot';

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
    // Validate credentials by calling the auth-token endpoint first.
    // This surfaces config errors (missing secret key, bad credentials)
    // on the login form instead of silently failing in the embed.
    const res = await fetch('/api/auth-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body.error || `Auth failed (${res.status})`;
      throw new Error(msg);
    }
    initThoughtSpot(user, pass);
    setUsername(user);
    setPassword(pass);
    setIsAuthenticated(true);
  };

  const logout = () => {
    resetThoughtSpot();
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

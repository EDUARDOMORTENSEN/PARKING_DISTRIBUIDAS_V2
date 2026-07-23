import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api';
import type { UserPayload } from '../types';

interface AuthState {
  token: string | null;
  user: UserPayload | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
  isRecaudador: boolean;
  isCliente: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

function decodeToken(token: string): UserPayload | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      sub: payload.sub,
      personId: payload.personId,
      username: payload.username,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(() => {
    const t = localStorage.getItem('token');
    if (!t) return null;
    const decoded = decodeToken(t);
    // Force re-login if the token is old and missing personId
    if (decoded && !decoded.personId) {
      localStorage.removeItem('token');
      return null;
    }
    return decoded;
  });
  // Also clear token state if we returned null above
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.validate()
        .then(() => setLoading(false))
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    const decoded = decodeToken(res.access_token);
    setToken(res.access_token);
    setUser(decoded);
    localStorage.setItem('token', res.access_token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const hasPermission = (perm: string) => user?.permissions.includes(perm) ?? false;
  const hasRole = (role: string) => user?.roles.some(r => r.toUpperCase() === role.toUpperCase()) ?? false;

  const isAdmin = hasRole('ROOT') || hasRole('ADMIN');
  const isRecaudador = hasRole('RECAUDADOR');
  const isCliente = !isAdmin && !isRecaudador;

  return (
    <AuthContext.Provider value={{
      token, user, isAuthenticated: !!token, loading,
      login, logout, hasPermission, hasRole,
      isAdmin, isRecaudador, isCliente,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

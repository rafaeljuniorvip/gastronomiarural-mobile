import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api, { setToken } from '../config/api';
import { registerForPushNotifications } from '../services/notificacoes.service';

export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (credential: string) => Promise<void>;
  loginWithToken: (jwt: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const res = await api.get<{ data: { kind: string; user?: User } }>('/auth/me');
      if (res.data?.data?.user) setUser(res.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function tryRegisterPush() {
    try {
      await registerForPushNotifications();
    } catch (e) {
      console.warn('[push-register] erro após login:', e);
    }
  }

  async function loginWithGoogle(credential: string) {
    const res = await api.post<{ data: { token: string; user: User } }>('/auth/google', { credential });
    await setToken(res.data.data.token);
    setUser(res.data.data.user);
    await tryRegisterPush();
  }

  async function loginWithToken(jwt: string) {
    await setToken(jwt);
    try {
      const res = await api.get<{ data: { kind: string; user?: User } }>('/auth/me');
      const fetched = res.data?.data?.user;
      if (!fetched) {
        await setToken(null);
        throw new Error('Não foi possível carregar o usuário autenticado.');
      }
      setUser(fetched);
      await tryRegisterPush();
    } catch (err) {
      await setToken(null);
      setUser(null);
      throw err;
    }
  }

  async function logout() {
    await setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

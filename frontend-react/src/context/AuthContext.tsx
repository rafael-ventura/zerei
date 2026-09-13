import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api, setToken, clearToken } from '../api/client';
import type { AuthResponse, UsuarioResumo } from '../types/models';

const USER_KEY = 'zerei_user';

interface AuthContextValue {
  usuario: UsuarioResumo | null;
  logado: boolean;
  login: (emailOuUsername: string, senha: string) => Promise<void>;
  registrar: (nome: string, username: string, email: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function lerUsuario(): UsuarioResumo | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as UsuarioResumo) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioResumo | null>(lerUsuario());

  const salvar = useCallback((r: AuthResponse) => {
    setToken(r.token);
    localStorage.setItem(USER_KEY, JSON.stringify(r.usuario));
    setUsuario(r.usuario);
  }, []);

  const login = useCallback(async (emailOuUsername: string, senha: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { emailOuUsername, senha });
    salvar(data);
  }, [salvar]);

  const registrar = useCallback(async (nome: string, username: string, email: string, senha: string) => {
    const { data } = await api.post<AuthResponse>('/auth/registro', { nome, username, email, senha });
    salvar(data);
  }, [salvar]);

  const sair = useCallback(() => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, logado: usuario !== null, login, registrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}

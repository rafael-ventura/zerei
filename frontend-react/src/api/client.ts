import axios from 'axios';

export const API_BASE = 'http://localhost:5192/api';

const TOKEN_KEY = 'zerei_token';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

const USER_KEY = 'zerei_user';

// Token expirado/inválido: limpa a sessão e manda pro login em vez de deixar a tela
// travada num erro genérico. Endpoints públicos (perfil/u/:username) não têm token
// pra começo de conversa, então um 401 ali nunca vem daqui.
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error?.response?.status === 401 && getToken()) {
      clearToken();
      localStorage.removeItem(USER_KEY);
      if (location.pathname !== '/login') location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export function extractError(e: unknown, fallback: string): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const resp = (e as { response?: { data?: { erro?: string } } }).response;
    if (resp?.data?.erro) return resp.data.erro;
  }
  return fallback;
}

import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import type { Estatisticas, Perfil, PerfilPublico } from '../types/models';

export function usePerfil() {
  return useQuery({
    queryKey: ['perfil'],
    queryFn: async () => (await api.get<Perfil>('/perfil')).data,
  });
}

export function useEstatisticas() {
  return useQuery({
    queryKey: ['estatisticas'],
    queryFn: async () => (await api.get<Estatisticas>('/perfil/estatisticas')).data,
  });
}

export function usePerfilPublico(username: string) {
  return useQuery({
    queryKey: ['perfil-publico', username],
    queryFn: async () => (await api.get<PerfilPublico>(`/perfil/u/${username}`)).data,
    enabled: !!username,
    retry: false,
  });
}

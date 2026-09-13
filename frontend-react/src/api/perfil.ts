import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import type { Estatisticas, Perfil, PerfilPublico } from '../types/models';
import { normalizarUsuarioJogo } from './biblioteca';

export function usePerfil() {
  return useQuery({
    queryKey: ['perfil'],
    queryFn: async () => {
      const { data } = await api.get<Perfil>('/perfil');
      return { ...data, favoritos: data.favoritos.map(normalizarUsuarioJogo) };
    },
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
    queryFn: async () => {
      const { data } = await api.get<PerfilPublico>(`/perfil/u/${username}`);
      return { ...data, favoritos: data.favoritos.map(normalizarUsuarioJogo) };
    },
    enabled: !!username,
    retry: false,
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { UsuarioPublico } from '../types/models';

export function useSeguidores() {
  return useQuery({
    queryKey: ['seguidores'],
    queryFn: async () => (await api.get<UsuarioPublico[]>('/seguidores')).data,
  });
}

export function useSeguindo() {
  return useQuery({
    queryKey: ['seguindo'],
    queryFn: async () => (await api.get<UsuarioPublico[]>('/seguindo')).data,
  });
}

export function useSeguir() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (usuarioId: number) => api.post(`/seguidores/${usuarioId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seguidores'] });
      qc.invalidateQueries({ queryKey: ['seguindo'] });
      qc.invalidateQueries({ queryKey: ['perfil-publico'] });
    },
  });
}

export function useDeixarDeSeguir() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (usuarioId: number) => api.delete(`/seguidores/${usuarioId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seguidores'] });
      qc.invalidateQueries({ queryKey: ['seguindo'] });
      qc.invalidateQueries({ queryKey: ['perfil-publico'] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Jogatina, UsuarioJogo } from '../types/models';

export interface NovaJogatina {
  plataformaId?: number | null;
  ano?: number | null;
  horas?: number | null;
  status: number;
  ehRejogada: boolean;
  observacao?: string | null;
}

export interface AtualizarBiblioteca {
  status?: number | null;
  nota?: number | null;
  favorito?: boolean;
  resenha?: string | null;
}

export function useBiblioteca(status?: number | null) {
  return useQuery({
    queryKey: ['biblioteca', status ?? null],
    queryFn: async () =>
      (await api.get<UsuarioJogo[]>('/biblioteca', { params: status != null ? { status } : undefined })).data,
  });
}

export function usePorJogo(jogoId: number | null) {
  return useQuery({
    queryKey: ['biblioteca-jogo', jogoId],
    queryFn: async () => {
      try {
        const { data } = await api.get<UsuarioJogo>(`/biblioteca/jogo/${jogoId}`);
        return data;
      } catch {
        return null;
      }
    },
    enabled: jogoId !== null,
  });
}

function invalidateBiblioteca(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['biblioteca'] });
  qc.invalidateQueries({ queryKey: ['biblioteca-jogo'] });
  qc.invalidateQueries({ queryKey: ['perfil'] });
  qc.invalidateQueries({ queryKey: ['estatisticas'] });
}

export function useMarcar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ jogoId, status }: { jogoId: number; status: number }) =>
      (await api.post<UsuarioJogo>('/biblioteca/marcar', { jogoId, status })).data,
    onSuccess: () => invalidateBiblioteca(qc),
  });
}

export function useMarcarLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ jogoIds, status }: { jogoIds: number[]; status: number }) =>
      (await api.post<{ marcados: number }>('/biblioteca/marcar-lote', { jogoIds, status })).data,
    onSuccess: () => invalidateBiblioteca(qc),
  });
}

export function useAtualizarBiblioteca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ usuarioJogoId, body }: { usuarioJogoId: number; body: AtualizarBiblioteca }) =>
      (await api.put<UsuarioJogo>(`/biblioteca/${usuarioJogoId}`, body)).data,
    onSuccess: () => invalidateBiblioteca(qc),
  });
}

export function useRemoverDaBiblioteca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (usuarioJogoId: number) => api.delete(`/biblioteca/${usuarioJogoId}`),
    onSuccess: () => invalidateBiblioteca(qc),
  });
}

export function useAdicionarJogatina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ usuarioJogoId, body }: { usuarioJogoId: number; body: NovaJogatina }) =>
      (await api.post<Jogatina>(`/biblioteca/${usuarioJogoId}/jogatinas`, body)).data,
    onSuccess: () => invalidateBiblioteca(qc),
  });
}

export function useRemoverJogatina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jogatinaId: number) => api.delete(`/biblioteca/jogatinas/${jogatinaId}`),
    onSuccess: () => invalidateBiblioteca(qc),
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Jogatina, UsuarioJogo } from '../types/models';
import { normalizarStatus } from '../types/status';

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

export function normalizarJogatina(jt: Jogatina): Jogatina {
  return { ...jt, status: normalizarStatus(jt.status) };
}

export function normalizarUsuarioJogo(uj: UsuarioJogo): UsuarioJogo {
  return {
    ...uj,
    status: normalizarStatus(uj.status),
    jogatinas: (uj.jogatinas ?? []).map(normalizarJogatina),
  };
}

export function useBiblioteca(status?: number | null) {
  return useQuery({
    queryKey: ['biblioteca', status ?? null],
    queryFn: async () => {
      const { data } = await api.get<UsuarioJogo[]>('/biblioteca', { params: status != null ? { status } : undefined });
      return data.map(normalizarUsuarioJogo);
    },
  });
}

export function usePorJogo(jogoId: number | null) {
  return useQuery({
    queryKey: ['biblioteca-jogo', jogoId],
    queryFn: async () => {
      try {
        const { data } = await api.get<UsuarioJogo>(`/biblioteca/jogo/${jogoId}`);
        return normalizarUsuarioJogo(data);
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
    mutationFn: async ({ jogoId, status }: { jogoId: number; status: number }) => {
      const { data } = await api.post<UsuarioJogo>('/biblioteca/marcar', { jogoId, status });
      return normalizarUsuarioJogo(data);
    },
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
    mutationFn: async ({ usuarioJogoId, body }: { usuarioJogoId: number; body: AtualizarBiblioteca }) => {
      const { data } = await api.put<UsuarioJogo>(`/biblioteca/${usuarioJogoId}`, body);
      return normalizarUsuarioJogo(data);
    },
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
    mutationFn: async ({ usuarioJogoId, body }: { usuarioJogoId: number; body: NovaJogatina }) => {
      const { data } = await api.post<Jogatina>(`/biblioteca/${usuarioJogoId}/jogatinas`, body);
      return normalizarJogatina(data);
    },
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

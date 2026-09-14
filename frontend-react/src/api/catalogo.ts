import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import type { Genero, Jogo, Plataforma } from '../types/models';

export function useGeneros() {
  return useQuery({
    queryKey: ['generos'],
    queryFn: async () => (await api.get<Genero[]>('/catalogo/generos')).data,
  });
}

export function usePlataformas() {
  return useQuery({
    queryKey: ['plataformas'],
    queryFn: async () => (await api.get<Plataforma[]>('/catalogo/plataformas')).data,
  });
}

export function useFamosos(genero?: string) {
  return useQuery({
    queryKey: ['famosos', genero ?? null],
    queryFn: async () =>
      (await api.get<Jogo[]>('/catalogo/famosos', { params: genero ? { genero } : undefined })).data,
  });
}

export function useJogo(id: number | null) {
  return useQuery({
    queryKey: ['jogo', id],
    queryFn: async () => (await api.get<Jogo>(`/catalogo/jogos/${id}`)).data,
    enabled: id !== null,
  });
}

export function useBusca(termo: string) {
  return useQuery({
    queryKey: ['busca', termo],
    queryFn: async () => (await api.get<Jogo[]>('/catalogo/busca', { params: { q: termo } })).data,
    enabled: termo.trim().length >= 3,
    staleTime: 60_000,
  });
}

export function useRelacionados(jogoId: number | null) {
  return useQuery({
    queryKey: ['relacionados', jogoId],
    queryFn: async () => (await api.get<Jogo[]>(`/catalogo/jogos/${jogoId}/relacionados`)).data,
    enabled: jogoId !== null,
    staleTime: 5 * 60_000,
  });
}

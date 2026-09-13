import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API } from './api';
import { Jogatina, UsuarioJogo } from './models';
import { normalizarStatus } from './status';

export interface NovaJogatina {
  plataformaId?: number | null;
  ano?: number | null;
  horas?: number | null;
  status: number;
  ehRejogada: boolean;
  observacao?: string | null;
}

function normalizarJogatina(jt: Jogatina): Jogatina {
  return { ...jt, status: normalizarStatus(jt.status) };
}

function normalizarUsuarioJogo(uj: UsuarioJogo): UsuarioJogo {
  return {
    ...uj,
    status: normalizarStatus(uj.status),
    jogatinas: (uj.jogatinas ?? []).map(normalizarJogatina),
  };
}

@Injectable({ providedIn: 'root' })
export class BibliotecaService {
  private http = inject(HttpClient);

  listar(status?: number | null): Observable<UsuarioJogo[]> {
    const q = status !== undefined && status !== null ? `?status=${status}` : '';
    return this.http
      .get<UsuarioJogo[]>(`${API}/biblioteca${q}`)
      .pipe(map((lista) => lista.map(normalizarUsuarioJogo)));
  }

  porJogo(jogoId: number): Observable<UsuarioJogo> {
    return this.http.get<UsuarioJogo>(`${API}/biblioteca/jogo/${jogoId}`).pipe(map(normalizarUsuarioJogo));
  }

  marcar(jogoId: number, status: number): Observable<UsuarioJogo> {
    return this.http
      .post<UsuarioJogo>(`${API}/biblioteca/marcar`, { jogoId, status })
      .pipe(map(normalizarUsuarioJogo));
  }

  marcarLote(jogoIds: number[], status: number): Observable<{ marcados: number }> {
    return this.http.post<{ marcados: number }>(`${API}/biblioteca/marcar-lote`, { jogoIds, status });
  }

  atualizar(
    usuarioJogoId: number,
    body: Partial<{ status: number; nota: number; favorito: boolean; resenha: string }>,
  ): Observable<UsuarioJogo> {
    return this.http
      .put<UsuarioJogo>(`${API}/biblioteca/${usuarioJogoId}`, body)
      .pipe(map(normalizarUsuarioJogo));
  }

  remover(usuarioJogoId: number): Observable<void> {
    return this.http.delete<void>(`${API}/biblioteca/${usuarioJogoId}`);
  }

  adicionarJogatina(usuarioJogoId: number, body: NovaJogatina): Observable<Jogatina> {
    return this.http
      .post<Jogatina>(`${API}/biblioteca/${usuarioJogoId}/jogatinas`, body)
      .pipe(map(normalizarJogatina));
  }

  removerJogatina(jogatinaId: number): Observable<void> {
    return this.http.delete<void>(`${API}/biblioteca/jogatinas/${jogatinaId}`);
  }
}

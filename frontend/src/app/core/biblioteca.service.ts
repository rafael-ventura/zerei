import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from './api';
import { Jogatina, UsuarioJogo } from './models';

export interface NovaJogatina {
  plataformaId?: number | null;
  ano?: number | null;
  horas?: number | null;
  status: number;
  ehRejogada: boolean;
  observacao?: string | null;
}

@Injectable({ providedIn: 'root' })
export class BibliotecaService {
  private http = inject(HttpClient);

  listar(status?: number | null): Observable<UsuarioJogo[]> {
    const q = status !== undefined && status !== null ? `?status=${status}` : '';
    return this.http.get<UsuarioJogo[]>(`${API}/biblioteca${q}`);
  }

  porJogo(jogoId: number): Observable<UsuarioJogo> {
    return this.http.get<UsuarioJogo>(`${API}/biblioteca/jogo/${jogoId}`);
  }

  marcar(jogoId: number, status: number): Observable<UsuarioJogo> {
    return this.http.post<UsuarioJogo>(`${API}/biblioteca/marcar`, { jogoId, status });
  }

  marcarLote(jogoIds: number[], status: number): Observable<{ marcados: number }> {
    return this.http.post<{ marcados: number }>(`${API}/biblioteca/marcar-lote`, { jogoIds, status });
  }

  atualizar(
    usuarioJogoId: number,
    body: Partial<{ status: number; nota: number; favorito: boolean; resenha: string }>,
  ): Observable<UsuarioJogo> {
    return this.http.put<UsuarioJogo>(`${API}/biblioteca/${usuarioJogoId}`, body);
  }

  remover(usuarioJogoId: number): Observable<void> {
    return this.http.delete<void>(`${API}/biblioteca/${usuarioJogoId}`);
  }

  adicionarJogatina(usuarioJogoId: number, body: NovaJogatina): Observable<Jogatina> {
    return this.http.post<Jogatina>(`${API}/biblioteca/${usuarioJogoId}/jogatinas`, body);
  }

  removerJogatina(jogatinaId: number): Observable<void> {
    return this.http.delete<void>(`${API}/biblioteca/jogatinas/${jogatinaId}`);
  }
}

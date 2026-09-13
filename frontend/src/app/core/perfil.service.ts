import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API } from './api';
import { Estatisticas, Perfil, UsuarioJogo } from './models';
import { normalizarStatus } from './status';

function normalizarPerfil(p: Perfil): Perfil {
  return {
    ...p,
    favoritos: (p.favoritos ?? []).map(
      (uj: UsuarioJogo): UsuarioJogo => ({
        ...uj,
        status: normalizarStatus(uj.status),
        jogatinas: (uj.jogatinas ?? []).map((jt) => ({ ...jt, status: normalizarStatus(jt.status) })),
      }),
    ),
  };
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);

  meu(): Observable<Perfil> {
    return this.http.get<Perfil>(`${API}/perfil`).pipe(map(normalizarPerfil));
  }

  estatisticas(): Observable<Estatisticas> {
    return this.http.get<Estatisticas>(`${API}/perfil/estatisticas`);
  }
}

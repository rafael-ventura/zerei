import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from './api';
import { Estatisticas, Perfil } from './models';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);

  meu(): Observable<Perfil> {
    return this.http.get<Perfil>(`${API}/perfil`);
  }

  estatisticas(): Observable<Estatisticas> {
    return this.http.get<Estatisticas>(`${API}/perfil/estatisticas`);
  }
}

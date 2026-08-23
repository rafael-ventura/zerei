import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from './api';
import { Genero, Jogo, Plataforma } from './models';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private http = inject(HttpClient);

  generos(): Observable<Genero[]> {
    return this.http.get<Genero[]>(`${API}/catalogo/generos`);
  }

  plataformas(): Observable<Plataforma[]> {
    return this.http.get<Plataforma[]>(`${API}/catalogo/plataformas`);
  }

  famosos(genero?: string): Observable<Jogo[]> {
    const q = genero ? `?genero=${encodeURIComponent(genero)}` : '';
    return this.http.get<Jogo[]>(`${API}/catalogo/famosos${q}`);
  }

  porId(id: number): Observable<Jogo> {
    return this.http.get<Jogo>(`${API}/catalogo/jogos/${id}`);
  }

  busca(termo: string): Observable<Jogo[]> {
    return this.http.get<Jogo[]>(`${API}/catalogo/busca?q=${encodeURIComponent(termo)}`);
  }
}

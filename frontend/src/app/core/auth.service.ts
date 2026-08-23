import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API } from './api';
import { AuthResponse, UsuarioResumo } from './models';

const TOKEN_KEY = 'zerei_token';
const USER_KEY = 'zerei_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private _usuario = signal<UsuarioResumo | null>(this.lerUsuario());
  usuario = this._usuario.asReadonly();
  logado = computed(() => this._usuario() !== null);

  registrar(body: { nome: string; username: string; email: string; senha: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/registro`, body).pipe(tap((r) => this.salvar(r)));
  }

  login(body: { emailOuUsername: string; senha: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, body).pipe(tap((r) => this.salvar(r)));
  }

  sair(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._usuario.set(null);
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private salvar(r: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, r.token);
    localStorage.setItem(USER_KEY, JSON.stringify(r.usuario));
    this._usuario.set(r.usuario);
  }

  private lerUsuario(): UsuarioResumo | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UsuarioResumo) : null;
  }
}

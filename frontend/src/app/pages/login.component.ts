import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrap">
      <div class="auth-card">
        <span class="brand">zerei<span>.</span></span>
        <p class="tagline">Sua estante de jogos. Tudo que você já jogou, num lugar só.</p>

        <div class="field">
          <label class="label">E-mail ou usuário</label>
          <input
            class="input"
            [(ngModel)]="emailOuUsername"
            (keyup.enter)="entrar()"
            placeholder="voce@email.com"
            autocomplete="username"
          />
        </div>
        <div class="field">
          <label class="label">Senha</label>
          <input
            class="input"
            type="password"
            [(ngModel)]="senha"
            (keyup.enter)="entrar()"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>

        <button class="btn btn-primary btn-block" (click)="entrar()" [disabled]="carregando()">
          @if (carregando()) {
            <i class="pi pi-spin pi-spinner"></i>
          } @else {
            Entrar
          }
        </button>

        <p class="alt">Não tem conta? <a routerLink="/registro">Criar conta</a></p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private msg = inject(MessageService);

  emailOuUsername = '';
  senha = '';
  carregando = signal(false);

  entrar(): void {
    if (!this.emailOuUsername || !this.senha) return;
    this.carregando.set(true);
    this.auth.login({ emailOuUsername: this.emailOuUsername, senha: this.senha }).subscribe({
      next: () => this.router.navigate(['/biblioteca']),
      error: (e) => {
        this.carregando.set(false);
        this.msg.add({ severity: 'error', summary: 'Ops', detail: e?.error?.erro ?? 'Não foi possível entrar.' });
      },
    });
  }
}

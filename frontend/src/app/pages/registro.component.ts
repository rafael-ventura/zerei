import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrap">
      <div class="auth-card">
        <span class="brand">zerei<span>.</span></span>
        <p class="tagline">Crie sua conta e comece a montar sua biblioteca.</p>

        <div class="field">
          <label class="label">Nome</label>
          <input class="input" [(ngModel)]="nome" placeholder="Seu nome" />
        </div>
        <div class="field">
          <label class="label">Usuário</label>
          <input class="input" [(ngModel)]="username" placeholder="seu_usuario" autocomplete="username" />
        </div>
        <div class="field">
          <label class="label">E-mail</label>
          <input class="input" type="email" [(ngModel)]="email" placeholder="voce@email.com" autocomplete="email" />
        </div>
        <div class="field">
          <label class="label">Senha</label>
          <input
            class="input"
            type="password"
            [(ngModel)]="senha"
            (keyup.enter)="criar()"
            placeholder="mínimo 6 caracteres"
            autocomplete="new-password"
          />
        </div>

        <button class="btn btn-primary btn-block" (click)="criar()" [disabled]="carregando()">
          @if (carregando()) {
            <i class="pi pi-spin pi-spinner"></i>
          } @else {
            Criar conta
          }
        </button>

        <p class="alt">Já tem conta? <a routerLink="/login">Entrar</a></p>
      </div>
    </div>
  `,
})
export class RegistroComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private msg = inject(MessageService);

  nome = '';
  username = '';
  email = '';
  senha = '';
  carregando = signal(false);

  criar(): void {
    if (!this.username || !this.email || !this.senha) {
      this.msg.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha usuário, e-mail e senha.' });
      return;
    }
    this.carregando.set(true);
    this.auth
      .registrar({ nome: this.nome, username: this.username, email: this.email, senha: this.senha })
      .subscribe({
        next: () => this.router.navigate(['/onboarding']),
        error: (e) => {
          this.carregando.set(false);
          this.msg.add({ severity: 'error', summary: 'Ops', detail: e?.error?.erro ?? 'Não foi possível criar a conta.' });
        },
      });
  }
}

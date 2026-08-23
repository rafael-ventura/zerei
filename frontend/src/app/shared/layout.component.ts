import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="topbar">
      <div class="bar-inner">
        <a class="logo" routerLink="/biblioteca">zerei<span>.</span></a>
        <nav>
          <a routerLink="/biblioteca" routerLinkActive="ativo"><i class="pi pi-th-large"></i><span>Biblioteca</span></a>
          <a routerLink="/perfil" routerLinkActive="ativo"><i class="pi pi-user"></i><span>Perfil</span></a>
          <a routerLink="/onboarding" routerLinkActive="ativo" class="add"><i class="pi pi-plus"></i><span>Adicionar</span></a>
        </nav>
        @if (auth.usuario(); as u) {
          <div class="user">
            <span class="avatar">{{ inicial(u.nome) }}</span>
            <button class="sair" (click)="sair()" title="Sair"><i class="pi pi-sign-out"></i></button>
          </div>
        }
      </div>
    </header>
    <main class="conteudo">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .topbar {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(13, 14, 18, 0.85);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border);
      }
      .bar-inner {
        max-width: 1180px;
        margin: 0 auto;
        padding: 0 20px;
        height: 64px;
        display: flex;
        align-items: center;
        gap: 20px;
      }
      .logo {
        font-size: 22px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      .logo span {
        color: var(--primary);
      }
      nav {
        display: flex;
        gap: 4px;
        margin-left: 10px;
        flex: 1;
      }
      nav a {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 10px;
        color: var(--text-muted);
        font-weight: 600;
        font-size: 14px;
        transition: all 0.15s ease;
      }
      nav a:hover {
        background: var(--surface-2);
        color: var(--text);
      }
      nav a.ativo {
        background: var(--surface-2);
        color: var(--text);
      }
      nav a.add {
        color: var(--primary);
      }
      .user {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), #4f9cff);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        color: #fff;
      }
      .sair {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
      }
      .sair:hover {
        background: var(--surface-2);
        color: var(--red);
      }
      .conteudo {
        max-width: 1180px;
        margin: 0 auto;
        padding: 28px 20px 60px;
      }
      @media (max-width: 640px) {
        nav a span {
          display: none;
        }
        .bar-inner {
          gap: 10px;
        }
      }
    `,
  ],
})
export class LayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  inicial(nome: string): string {
    return (nome?.trim()?.charAt(0) || '?').toUpperCase();
  }

  sair(): void {
    this.auth.sair();
    this.router.navigate(['/login']);
  }
}

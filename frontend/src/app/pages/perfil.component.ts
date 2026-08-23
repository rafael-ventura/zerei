import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PerfilService } from '../core/perfil.service';
import { DistribuicaoItem, Perfil } from '../core/models';
import { JogoCardComponent } from '../shared/jogo-card.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, JogoCardComponent],
  template: `
    @if (perfil(); as p) {
      <div class="phead">
        <div class="avatar-xl">{{ inicial(p.usuario.nome) }}</div>
        <div>
          <h1>{{ p.usuario.nome }}</h1>
          <p class="user">&#64;{{ p.usuario.username }}</p>
        </div>
      </div>

      <div class="stats">
        <div class="stat"><span class="num">{{ p.estatisticas.totalJogos }}</span><span class="lab">Jogos</span></div>
        <div class="stat" style="--a: var(--green)"><span class="num">{{ p.estatisticas.zerados }}</span><span class="lab">Zerados</span></div>
        <div class="stat" style="--a: var(--gold)"><span class="num">{{ p.estatisticas.platinados }}</span><span class="lab">Platinados</span></div>
        <div class="stat" style="--a: var(--blue)"><span class="num">{{ p.estatisticas.totalHoras }}</span><span class="lab">Horas</span></div>
        <div class="stat" style="--a: var(--primary)"><span class="num">{{ p.estatisticas.notaMedia ?? '—' }}</span><span class="lab">Nota média</span></div>
      </div>

      <div class="destaques">
        <div class="dcard">
          <i class="pi pi-desktop"></i>
          <div><span>Plataforma favorita</span><strong>{{ p.estatisticas.plataformaFavorita || '—' }}</strong></div>
        </div>
        <div class="dcard">
          <i class="pi pi-tag"></i>
          <div><span>Gênero favorito</span><strong>{{ p.estatisticas.generoFavorito || '—' }}</strong></div>
        </div>
      </div>

      <div class="paineis">
        <div class="painel">
          <div class="secao-titulo">Por plataforma</div>
          @if (p.estatisticas.porFamiliaPlataforma.length) {
            @for (d of p.estatisticas.porFamiliaPlataforma; track d.rotulo) {
              <div class="barra">
                <span class="bl">{{ d.rotulo }}</span>
                <div class="track"><div class="fill" [style.width.%]="pct(d, p.estatisticas.porFamiliaPlataforma)"></div></div>
                <span class="bv">{{ d.quantidade }}</span>
              </div>
            }
          } @else {
            <p class="nada">Registre jogatinas com plataforma para ver isto.</p>
          }
        </div>

        <div class="painel">
          <div class="secao-titulo">Por status</div>
          @if (p.estatisticas.porStatus.length) {
            @for (d of p.estatisticas.porStatus; track d.rotulo) {
              <div class="barra">
                <span class="bl">{{ d.rotulo }}</span>
                <div class="track"><div class="fill alt" [style.width.%]="pct(d, p.estatisticas.porStatus)"></div></div>
                <span class="bv">{{ d.quantidade }}</span>
              </div>
            }
          } @else {
            <p class="nada">Nada por aqui ainda.</p>
          }
        </div>
      </div>

      @if (p.favoritos.length) {
        <div class="secao-titulo" style="margin-top: 36px">Favoritos</div>
        <div class="grade-jogos">
          @for (uj of p.favoritos; track uj.id) {
            <app-jogo-card [jogo]="uj.jogo" [status]="uj.status" [nota]="uj.nota ?? null" (clique)="abrir(uj.jogo.id)" />
          }
        </div>
      }
    } @else if (carregando()) {
      <div class="vazio"><i class="pi pi-spin pi-spinner"></i><p>Carregando perfil…</p></div>
    }
  `,
  styles: [
    `
      .phead {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 30px;
      }
      .avatar-xl {
        width: 78px;
        height: 78px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), #4f9cff);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: 800;
        color: #fff;
      }
      h1 {
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      .user {
        color: var(--text-muted);
        margin: 4px 0 0;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 14px;
        margin-bottom: 18px;
      }
      .stat {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 20px 18px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      .stat::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--a, var(--text-dim));
      }
      .stat .num {
        display: block;
        font-size: 30px;
        font-weight: 800;
        letter-spacing: -1px;
        color: var(--a, var(--text));
      }
      .stat .lab {
        font-size: 12px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.6px;
        font-weight: 600;
      }
      .destaques {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-bottom: 28px;
      }
      .dcard {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 18px 20px;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .dcard .pi {
        font-size: 22px;
        color: var(--primary);
        background: color-mix(in srgb, var(--primary) 14%, transparent);
        width: 46px;
        height: 46px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dcard span {
        display: block;
        font-size: 12px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.6px;
        font-weight: 600;
      }
      .dcard strong {
        font-size: 18px;
      }
      .paineis {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .painel {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 22px;
      }
      .barra {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .bl {
        width: 110px;
        font-size: 13px;
        color: var(--text-muted);
        flex-shrink: 0;
      }
      .track {
        flex: 1;
        height: 10px;
        background: var(--surface-2);
        border-radius: 6px;
        overflow: hidden;
      }
      .fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary), #9d8cff);
        border-radius: 6px;
        transition: width 0.4s ease;
      }
      .fill.alt {
        background: linear-gradient(90deg, var(--green), var(--cyan));
      }
      .bv {
        width: 28px;
        text-align: right;
        font-weight: 700;
        font-size: 14px;
      }
      .nada {
        color: var(--text-dim);
        font-size: 13px;
        margin: 0;
      }
      @media (max-width: 760px) {
        .stats {
          grid-template-columns: repeat(2, 1fr);
        }
        .destaques,
        .paineis {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PerfilComponent implements OnInit {
  private perfilSrv = inject(PerfilService);
  private router = inject(Router);

  perfil = signal<Perfil | null>(null);
  carregando = signal(true);

  ngOnInit(): void {
    this.perfilSrv.meu().subscribe({
      next: (p) => {
        this.perfil.set(p);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  pct(item: DistribuicaoItem, lista: DistribuicaoItem[]): number {
    const max = Math.max(...lista.map((d) => d.quantidade), 1);
    return Math.round((item.quantidade / max) * 100);
  }

  inicial(nome: string): string {
    return (nome?.trim()?.charAt(0) || '?').toUpperCase();
  }

  abrir(jogoId: number): void {
    this.router.navigate(['/jogo', jogoId]);
  }
}

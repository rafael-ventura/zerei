import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CatalogoService } from '../core/catalogo.service';
import { BibliotecaService } from '../core/biblioteca.service';
import { Genero, Jogo } from '../core/models';
import { StatusJogo } from '../core/status';
import { JogoCardComponent } from '../shared/jogo-card.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, JogoCardComponent],
  template: `
    <div class="ob">
      <header class="ob-top">
        <span class="brand">zerei<span>.</span></span>
        <div class="passos">
          <span class="dot" [class.on]="passo() >= 1"></span>
          <span class="dot" [class.on]="passo() >= 2"></span>
        </div>
        <button class="pular" (click)="pular()">Pular</button>
      </header>

      @if (passo() === 1) {
        <section class="conteudo">
          <h1>Quais gêneros você curte?</h1>
          <p class="sub">Escolha alguns pra gente te mostrar os jogos certos. (opcional)</p>

          <div class="chips">
            @for (g of generos(); track g.id) {
              <button class="chip" [class.on]="generosSel().has(g.nome)" (click)="toggleGenero(g.nome)">
                {{ g.nome }}
              </button>
            }
          </div>

          <div class="acoes">
            <button class="btn btn-primary" (click)="passo.set(2)">
              Continuar <i class="pi pi-arrow-right"></i>
            </button>
          </div>
        </section>
      } @else {
        <section class="conteudo">
          <h1>Marque o que você já jogou</h1>
          <p class="sub">Toque nas capas dos jogos que já passaram pela sua vida. Isso já monta sua biblioteca.</p>

          @if (carregando()) {
            <div class="vazio"><i class="pi pi-spin pi-spinner"></i><p>Carregando jogos…</p></div>
          } @else {
            <div class="grade-jogos">
              @for (j of jogosFiltrados(); track j.id) {
                <app-jogo-card
                  [jogo]="j"
                  [selecionado]="jogosSel().has(j.id)"
                  (clique)="toggleJogo(j.id)"
                />
              }
            </div>
          }

          <div class="acoes rodape">
            <button class="btn btn-ghost" (click)="passo.set(1)"><i class="pi pi-arrow-left"></i> Voltar</button>
            <button class="btn btn-primary" (click)="finalizar()" [disabled]="salvando()">
              @if (salvando()) {
                <i class="pi pi-spin pi-spinner"></i>
              } @else {
                {{ jogosSel().size > 0 ? 'Adicionar ' + jogosSel().size + ' jogos' : 'Finalizar' }}
              }
            </button>
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .ob {
        max-width: 980px;
        margin: 0 auto;
        padding: 22px 20px 80px;
      }
      .ob-top {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 36px;
      }
      .brand {
        font-size: 22px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      .brand span {
        color: var(--primary);
      }
      .passos {
        display: flex;
        gap: 8px;
        flex: 1;
        justify-content: center;
      }
      .dot {
        width: 36px;
        height: 5px;
        border-radius: 3px;
        background: var(--surface-3);
        transition: background 0.2s ease;
      }
      .dot.on {
        background: var(--primary);
      }
      .pular {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
      }
      .pular:hover {
        color: var(--text);
      }
      h1 {
        font-size: 30px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      .sub {
        color: var(--text-muted);
        margin: 10px 0 28px;
        font-size: 15px;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .chip {
        background: var(--surface-2);
        border: 1px solid var(--border);
        color: var(--text);
        border-radius: 999px;
        padding: 10px 18px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s ease;
      }
      .chip:hover {
        border-color: var(--border-2);
      }
      .chip.on {
        background: var(--primary);
        border-color: var(--primary);
        color: #fff;
      }
      .acoes {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 32px;
      }
      .rodape {
        position: sticky;
        bottom: 0;
        padding: 18px 0;
        margin-top: 28px;
        background: linear-gradient(transparent, var(--bg) 30%);
        justify-content: space-between;
      }
    `,
  ],
})
export class OnboardingComponent implements OnInit {
  private catalogo = inject(CatalogoService);
  private bib = inject(BibliotecaService);
  private router = inject(Router);
  private msg = inject(MessageService);

  passo = signal(1);
  generos = signal<Genero[]>([]);
  generosSel = signal<Set<string>>(new Set());
  jogos = signal<Jogo[]>([]);
  jogosSel = signal<Set<number>>(new Set());
  carregando = signal(true);
  salvando = signal(false);

  jogosFiltrados = computed(() => {
    const sel = this.generosSel();
    if (sel.size === 0) return this.jogos();
    return this.jogos().filter((j) => j.generos.some((g) => sel.has(g)));
  });

  ngOnInit(): void {
    forkJoin({ generos: this.catalogo.generos(), jogos: this.catalogo.famosos() }).subscribe({
      next: ({ generos, jogos }) => {
        this.generos.set(generos);
        this.jogos.set(jogos);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  toggleGenero(nome: string): void {
    const s = new Set(this.generosSel());
    s.has(nome) ? s.delete(nome) : s.add(nome);
    this.generosSel.set(s);
  }

  toggleJogo(id: number): void {
    const s = new Set(this.jogosSel());
    s.has(id) ? s.delete(id) : s.add(id);
    this.jogosSel.set(s);
  }

  pular(): void {
    this.router.navigate(['/biblioteca']);
  }

  finalizar(): void {
    const ids = [...this.jogosSel()];
    if (ids.length === 0) {
      this.router.navigate(['/biblioteca']);
      return;
    }
    this.salvando.set(true);
    this.bib.marcarLote(ids, StatusJogo.Jogado).subscribe({
      next: () => this.router.navigate(['/biblioteca']),
      error: () => {
        this.salvando.set(false);
        this.msg.add({ severity: 'error', summary: 'Ops', detail: 'Não foi possível salvar agora.' });
      },
    });
  }
}

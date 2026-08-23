import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { BibliotecaService } from '../core/biblioteca.service';
import { CatalogoService } from '../core/catalogo.service';
import { Jogo, UsuarioJogo } from '../core/models';
import { STATUS_LISTA } from '../core/status';
import { JogoCardComponent } from '../shared/jogo-card.component';

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, JogoCardComponent],
  template: `
    <div class="cab">
      <div>
        <h1>Minha biblioteca</h1>
        <p class="sub">{{ itens().length }} {{ itens().length === 1 ? 'jogo' : 'jogos' }} na sua estante</p>
      </div>
    </div>

    <div class="barra-busca">
      <i class="pi pi-search"></i>
      <input
        class="input"
        [ngModel]="termo()"
        (ngModelChange)="aoDigitar($event)"
        placeholder="Buscar e adicionar um jogo…"
      />
      @if (buscando()) {
        <i class="pi pi-spin pi-spinner spin"></i>
      } @else if (termo().length > 0) {
        <button class="limpar" (click)="aoDigitar('')"><i class="pi pi-times"></i></button>
      }
    </div>

    @if (termo().trim().length >= 2) {
      <!-- modo busca -->
      <div class="secao-titulo" style="margin-top: 24px">Resultados</div>
      @if (resultados().length === 0 && !buscando()) {
        <div class="vazio"><i class="pi pi-inbox"></i><p>Nenhum jogo encontrado para “{{ termo() }}”.</p></div>
      } @else {
        <div class="grade-jogos">
          @for (j of resultados(); track j.id) {
            <app-jogo-card [jogo]="j" (clique)="abrir(j.id)" />
          }
        </div>
      }
    } @else {
      <!-- modo biblioteca -->
      <div class="filtros">
        <button class="chip" [class.on]="filtro() === null" (click)="filtro.set(null)">
          Todos <span class="n">{{ itens().length }}</span>
        </button>
        @for (s of statusLista; track s.valor) {
          @if (contagem(s.valor) > 0) {
            <button class="chip" [class.on]="filtro() === s.valor" (click)="filtro.set(s.valor)">
              <i class="pi" [ngClass]="s.icone" [style.color]="s.cor"></i> {{ s.label }}
              <span class="n">{{ contagem(s.valor) }}</span>
            </button>
          }
        }
      </div>

      @if (carregando()) {
        <div class="vazio"><i class="pi pi-spin pi-spinner"></i><p>Carregando…</p></div>
      } @else if (itens().length === 0) {
        <div class="vazio">
          <i class="pi pi-bookmark"></i>
          <p>Sua biblioteca está vazia.</p>
          <a routerLink="/onboarding" class="btn btn-primary" style="margin-top: 14px">
            <i class="pi pi-plus"></i> Adicionar jogos
          </a>
        </div>
      } @else {
        <div class="grade-jogos">
          @for (uj of itensFiltrados(); track uj.id) {
            <app-jogo-card [jogo]="uj.jogo" [status]="uj.status" [nota]="uj.nota ?? null" (clique)="abrir(uj.jogo.id)" />
          }
        </div>
      }
    }
  `,
  styles: [
    `
      .cab {
        margin-bottom: 20px;
      }
      h1 {
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      .sub {
        color: var(--text-muted);
        margin: 6px 0 0;
        font-size: 14px;
      }
      .barra-busca {
        position: relative;
        display: flex;
        align-items: center;
      }
      .barra-busca > .pi-search {
        position: absolute;
        left: 14px;
        color: var(--text-dim);
      }
      .barra-busca .input {
        padding-left: 42px;
        padding-right: 42px;
      }
      .barra-busca .spin,
      .barra-busca .limpar {
        position: absolute;
        right: 14px;
        color: var(--text-dim);
      }
      .limpar {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-dim);
      }
      .filtros {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
        margin: 22px 0 24px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        color: var(--text);
        border-radius: 999px;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s ease;
      }
      .chip:hover {
        border-color: var(--border-2);
      }
      .chip.on {
        background: var(--surface-3);
        border-color: var(--primary);
      }
      .chip .n {
        background: var(--bg);
        border-radius: 999px;
        padding: 1px 8px;
        font-size: 12px;
        color: var(--text-muted);
      }
    `,
  ],
})
export class BibliotecaComponent implements OnInit {
  private bib = inject(BibliotecaService);
  private catalogo = inject(CatalogoService);
  private router = inject(Router);

  statusLista = STATUS_LISTA;

  itens = signal<UsuarioJogo[]>([]);
  filtro = signal<number | null>(null);
  carregando = signal(true);

  termo = signal('');
  resultados = signal<Jogo[]>([]);
  buscando = signal(false);
  private buscaSubject = new Subject<string>();

  itensFiltrados = computed(() => {
    const f = this.filtro();
    return f === null ? this.itens() : this.itens().filter((i) => i.status === f);
  });

  ngOnInit(): void {
    this.carregar();
    this.buscaSubject
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((q) => {
          if (q.trim().length < 2) {
            this.resultados.set([]);
            this.buscando.set(false);
            return of([] as Jogo[]);
          }
          this.buscando.set(true);
          return this.catalogo.busca(q.trim()).pipe(tap(() => this.buscando.set(false)));
        }),
      )
      .subscribe((r) => this.resultados.set(r));
  }

  carregar(): void {
    this.carregando.set(true);
    this.bib.listar().subscribe({
      next: (lista) => {
        this.itens.set(lista);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  contagem(status: number): number {
    return this.itens().filter((i) => i.status === status).length;
  }

  aoDigitar(valor: string): void {
    this.termo.set(valor);
    this.buscaSubject.next(valor);
  }

  abrir(jogoId: number): void {
    this.router.navigate(['/jogo', jogoId]);
  }
}

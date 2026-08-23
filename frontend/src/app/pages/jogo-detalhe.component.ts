import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { CatalogoService } from '../core/catalogo.service';
import { BibliotecaService, NovaJogatina } from '../core/biblioteca.service';
import { Jogo, UsuarioJogo } from '../core/models';
import { Plataforma } from '../core/models';
import { STATUS_LISTA, StatusJogo, statusInfo } from '../core/status';

@Component({
  selector: 'app-jogo-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, SelectModule, CheckboxModule],
  template: `
    <button class="voltar" (click)="local.back()"><i class="pi pi-arrow-left"></i> Voltar</button>

    @if (jogo(); as j) {
      <div class="detalhe">
        <aside class="lado">
          <div class="capa">
            @if (j.capaUrl) {
              <img [src]="j.capaUrl" [alt]="j.nome" />
            } @else {
              <div class="ph" [style.background]="corFundo(j.nome)"><span>{{ j.nome }}</span></div>
            }
          </div>
        </aside>

        <div class="corpo">
          <h1>{{ j.nome }}</h1>
          <div class="meta">
            @if (j.ano) {
              <span>{{ j.ano }}</span>
            }
            @for (g of j.generos; track g) {
              <span class="g">{{ g }}</span>
            }
          </div>

          <!-- status -->
          <div class="bloco">
            <div class="secao-titulo">Status</div>
            <div class="status-grid">
              @for (s of statusLista; track s.valor) {
                <button
                  class="st"
                  [class.on]="uj()?.status === s.valor"
                  [style.--c]="s.cor"
                  (click)="definirStatus(s.valor)"
                >
                  <i class="pi" [ngClass]="s.icone"></i> {{ s.label }}
                </button>
              }
            </div>
          </div>

          @if (uj(); as u) {
            <!-- nota + favorito -->
            <div class="bloco linha">
              <div>
                <div class="secao-titulo">Sua nota</div>
                <div class="nota-row">
                  @for (n of dez; track n) {
                    <button class="dot" [class.on]="(u.nota ?? 0) >= n" (click)="setNota(n)">{{ n }}</button>
                  }
                  @if (u.nota) {
                    <button class="limpar-nota" (click)="setNota(0)">limpar</button>
                  }
                </div>
              </div>
              <div>
                <div class="secao-titulo">Favorito</div>
                <button class="fav" [class.on]="u.favorito" (click)="toggleFavorito()">
                  <i class="pi" [ngClass]="u.favorito ? 'pi-heart-fill' : 'pi-heart'"></i>
                </button>
              </div>
            </div>

            <!-- resenha -->
            <div class="bloco">
              <div class="secao-titulo">Resenha</div>
              <textarea
                class="input"
                rows="3"
                [(ngModel)]="resenha"
                (blur)="salvarResenha()"
                placeholder="O que você achou desse jogo?"
              ></textarea>
            </div>

            <!-- jogatinas -->
            <div class="bloco">
              <div class="jt-cab">
                <div class="secao-titulo" style="margin:0">Suas jogatinas</div>
                <button class="btn btn-ghost mini" (click)="abrirDialog()"><i class="pi pi-plus"></i> Registrar</button>
              </div>

              @if (u.jogatinas.length === 0) {
                <p class="jt-vazio">Nenhuma jogatina registrada. Marque quando e onde você jogou — inclusive rejogadas.</p>
              } @else {
                <div class="jt-lista">
                  @for (jt of u.jogatinas; track jt.id) {
                    <div class="jt">
                      <span class="jt-status" [style.background]="info(jt.status).cor + '26'" [style.color]="info(jt.status).cor">
                        <i class="pi" [ngClass]="info(jt.status).icone"></i>
                      </span>
                      <div class="jt-info">
                        <strong>{{ jt.plataforma || 'Plataforma não informada' }}</strong>
                        <span class="jt-sub">
                          {{ info(jt.status).label }}
                          @if (jt.ano) { · {{ jt.ano }} }
                          @if (jt.horas) { · {{ jt.horas }}h }
                          @if (jt.ehRejogada) { · <i class="pi pi-replay"></i> rejogada }
                        </span>
                      </div>
                      <button class="jt-del" (click)="removerJogatina(jt.id)"><i class="pi pi-trash"></i></button>
                    </div>
                  }
                </div>
              }
            </div>

            <button class="btn btn-danger" (click)="removerDaBiblioteca()" style="margin-top: 8px">
              <i class="pi pi-trash"></i> Remover da biblioteca
            </button>
          } @else {
            <p class="dica"><i class="pi pi-info-circle"></i> Escolha um status acima para adicionar este jogo à sua biblioteca.</p>
          }
        </div>
      </div>
    } @else if (carregando()) {
      <div class="vazio"><i class="pi pi-spin pi-spinner"></i><p>Carregando…</p></div>
    }

    <!-- dialog de jogatina -->
    <p-dialog header="Registrar jogatina" [(visible)]="dialogAberto" [modal]="true" [draggable]="false" [style]="{ width: '440px' }">
      <div class="form-jt">
        <div class="field">
          <label class="label">Plataforma</label>
          <p-select [options]="plataformas()" optionLabel="nome" optionValue="id" [(ngModel)]="form.plataformaId"
            placeholder="Selecione" [filter]="true" appendTo="body" styleClass="w-full" />
        </div>
        <div class="duo">
          <div class="field">
            <label class="label">Ano</label>
            <input class="input" type="number" [(ngModel)]="form.ano" placeholder="2024" />
          </div>
          <div class="field">
            <label class="label">Horas</label>
            <input class="input" type="number" [(ngModel)]="form.horas" placeholder="40" />
          </div>
        </div>
        <div class="field">
          <label class="label">Como terminou</label>
          <p-select [options]="statusLista" optionLabel="label" optionValue="valor" [(ngModel)]="form.status" appendTo="body" styleClass="w-full" />
        </div>
        <div class="chk">
          <p-checkbox [(ngModel)]="form.ehRejogada" [binary]="true" inputId="rej" />
          <label for="rej">Foi uma rejogada</label>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button class="btn btn-ghost" (click)="dialogAberto.set(false)">Cancelar</button>
        <button class="btn btn-primary" (click)="salvarJogatina()" [disabled]="salvando()">Salvar</button>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .voltar {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        padding: 0;
        margin-bottom: 22px;
        display: inline-flex;
        gap: 8px;
        align-items: center;
      }
      .voltar:hover {
        color: var(--text);
      }
      .detalhe {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 36px;
      }
      .lado .capa {
        position: sticky;
        top: 90px;
        border-radius: var(--radius);
        overflow: hidden;
        border: 1px solid var(--border);
        aspect-ratio: 3 / 4;
      }
      .capa img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .ph {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px;
        text-align: center;
      }
      .ph span {
        font-weight: 800;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.92);
      }
      h1 {
        font-size: 32px;
        font-weight: 800;
        letter-spacing: -0.6px;
        line-height: 1.1;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 14px 0 8px;
        color: var(--text-muted);
        font-size: 14px;
        align-items: center;
      }
      .meta .g {
        background: var(--surface-2);
        border: 1px solid var(--border);
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 12px;
      }
      .bloco {
        margin-top: 26px;
      }
      .bloco.linha {
        display: flex;
        gap: 40px;
      }
      .status-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
      }
      .st {
        display: flex;
        align-items: center;
        gap: 9px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        color: var(--text);
        border-radius: 12px;
        padding: 12px 14px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s ease;
      }
      .st .pi {
        color: var(--c);
      }
      .st:hover {
        border-color: var(--border-2);
      }
      .st.on {
        border-color: var(--c);
        background: color-mix(in srgb, var(--c) 14%, var(--surface-2));
      }
      .nota-row {
        display: flex;
        gap: 5px;
        align-items: center;
        flex-wrap: wrap;
      }
      .dot {
        width: 30px;
        height: 34px;
        border-radius: 8px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        color: var(--text-dim);
        cursor: pointer;
        font-weight: 700;
        font-family: inherit;
        transition: all 0.12s ease;
      }
      .dot.on {
        background: var(--gold);
        border-color: var(--gold);
        color: #1a1a1a;
      }
      .limpar-nota {
        background: none;
        border: none;
        color: var(--text-dim);
        cursor: pointer;
        font-size: 13px;
        margin-left: 6px;
      }
      .fav {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        color: var(--text-muted);
        cursor: pointer;
        font-size: 20px;
      }
      .fav.on {
        color: var(--red);
        border-color: color-mix(in srgb, var(--red) 50%, transparent);
        background: color-mix(in srgb, var(--red) 12%, transparent);
      }
      .jt-cab {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }
      .mini {
        padding: 7px 12px;
        font-size: 13px;
      }
      .jt-vazio {
        color: var(--text-muted);
        font-size: 14px;
        margin: 0;
      }
      .jt-lista {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .jt {
        display: flex;
        align-items: center;
        gap: 13px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px 14px;
      }
      .jt-status {
        width: 36px;
        height: 36px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .jt-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
      }
      .jt-info strong {
        font-size: 14px;
      }
      .jt-sub {
        font-size: 13px;
        color: var(--text-muted);
      }
      .jt-del {
        background: none;
        border: none;
        color: var(--text-dim);
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
      }
      .jt-del:hover {
        color: var(--red);
        background: var(--surface-2);
      }
      .dica {
        margin-top: 22px;
        color: var(--text-muted);
        font-size: 14px;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .form-jt .duo {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .chk {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: var(--text-muted);
      }
      :host ::ng-deep .w-full {
        width: 100%;
      }
      @media (max-width: 760px) {
        .detalhe {
          grid-template-columns: 1fr;
        }
        .lado .capa {
          max-width: 220px;
          position: static;
        }
      }
    `,
  ],
})
export class JogoDetalheComponent implements OnInit {
  @Input() id!: string;

  private catalogo = inject(CatalogoService);
  private bib = inject(BibliotecaService);
  private msg = inject(MessageService);
  local = inject(Location);

  statusLista = STATUS_LISTA;
  dez = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  info = statusInfo;

  jogo = signal<Jogo | null>(null);
  uj = signal<UsuarioJogo | null>(null);
  plataformas = signal<Plataforma[]>([]);
  carregando = signal(true);
  resenha = '';

  dialogAberto = signal(false);
  salvando = signal(false);
  form: NovaJogatina = this.formVazio();

  private get jogoId(): number {
    return Number(this.id);
  }

  ngOnInit(): void {
    this.catalogo.porId(this.jogoId).subscribe({
      next: (j) => {
        this.jogo.set(j);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
    this.catalogo.plataformas().subscribe((p) => this.plataformas.set(p));
    this.bib.porJogo(this.jogoId).subscribe({
      next: (u) => {
        this.uj.set(u);
        this.resenha = u.resenha ?? '';
      },
      error: () => this.uj.set(null),
    });
  }

  definirStatus(status: number): void {
    this.bib.marcar(this.jogoId, status).subscribe({
      next: (u) => {
        this.uj.set(u);
        this.resenha = u.resenha ?? '';
      },
      error: (e) => this.erro(e),
    });
  }

  toggleFavorito(): void {
    const u = this.uj();
    if (!u) return;
    this.bib.atualizar(u.id, { favorito: !u.favorito }).subscribe({
      next: (atualizado) => this.uj.set({ ...atualizado, jogatinas: u.jogatinas }),
      error: (e) => this.erro(e),
    });
  }

  setNota(n: number): void {
    const u = this.uj();
    if (!u) return;
    this.bib.atualizar(u.id, { nota: n }).subscribe({
      next: (atualizado) => this.uj.set({ ...atualizado, jogatinas: u.jogatinas }),
      error: (e) => this.erro(e),
    });
  }

  salvarResenha(): void {
    const u = this.uj();
    if (!u || (u.resenha ?? '') === this.resenha) return;
    this.bib.atualizar(u.id, { resenha: this.resenha }).subscribe({
      next: (atualizado) => this.uj.set({ ...atualizado, jogatinas: u.jogatinas }),
      error: (e) => this.erro(e),
    });
  }

  abrirDialog(): void {
    this.form = this.formVazio();
    this.dialogAberto.set(true);
  }

  salvarJogatina(): void {
    const u = this.uj();
    if (!u) return;
    this.salvando.set(true);
    this.bib.adicionarJogatina(u.id, this.form).subscribe({
      next: (jt) => {
        this.uj.set({ ...u, jogatinas: [jt, ...u.jogatinas] });
        this.dialogAberto.set(false);
        this.salvando.set(false);
      },
      error: (e) => {
        this.salvando.set(false);
        this.erro(e);
      },
    });
  }

  removerJogatina(jogatinaId: number): void {
    const u = this.uj();
    if (!u) return;
    this.bib.removerJogatina(jogatinaId).subscribe({
      next: () => this.uj.set({ ...u, jogatinas: u.jogatinas.filter((x) => x.id !== jogatinaId) }),
      error: (e) => this.erro(e),
    });
  }

  removerDaBiblioteca(): void {
    const u = this.uj();
    if (!u) return;
    this.bib.remover(u.id).subscribe({
      next: () => this.uj.set(null),
      error: (e) => this.erro(e),
    });
  }

  corFundo(nome: string): string {
    let h = 0;
    for (let i = 0; i < nome.length; i++) h = nome.charCodeAt(i) + ((h << 5) - h);
    const hue = Math.abs(h) % 360;
    return `linear-gradient(150deg, hsl(${hue}, 45%, 30%), hsl(${(hue + 40) % 360}, 42%, 16%))`;
  }

  private formVazio(): NovaJogatina {
    return { plataformaId: null, ano: null, horas: null, status: StatusJogo.Zerado, ehRejogada: false, observacao: '' };
  }

  private erro(e: any): void {
    this.msg.add({ severity: 'error', summary: 'Ops', detail: e?.error?.erro ?? 'Algo deu errado.' });
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Jogo } from '../core/models';
import { StatusInfo, statusInfo } from '../core/status';

@Component({
  selector: 'app-jogo-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="jc" [class.sel]="selecionado" (click)="clique.emit()">
      <div class="capa">
        @if (jogo.capaUrl) {
          <img [src]="jogo.capaUrl" [alt]="jogo.nome" loading="lazy" />
        } @else {
          <div class="ph" [style.background]="corFundo(jogo.nome)">
            <span>{{ jogo.nome }}</span>
          </div>
        }

        @if (status !== null) {
          <span
            class="badge"
            [style.background]="info(status).cor + '26'"
            [style.color]="info(status).cor"
            [style.borderColor]="info(status).cor + '66'"
          >
            <i class="pi" [ngClass]="info(status).icone"></i>
          </span>
        }

        @if (nota) {
          <span class="nota"><i class="pi pi-star-fill"></i> {{ nota }}</span>
        }

        @if (selecionado) {
          <span class="check"><i class="pi pi-check"></i></span>
        }
      </div>

      @if (mostrarNome) {
        <div class="info">
          <div class="nome">{{ jogo.nome }}</div>
          @if (jogo.ano) {
            <div class="ano">{{ jogo.ano }}</div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .jc {
        cursor: pointer;
        user-select: none;
      }
      .capa {
        position: relative;
        aspect-ratio: 3 / 4;
        border-radius: 12px;
        overflow: hidden;
        background: var(--surface-2);
        border: 1px solid var(--border);
        transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
      }
      .jc:hover .capa {
        transform: translateY(-4px);
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.45);
        border-color: var(--border-2);
      }
      .jc.sel .capa {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px var(--primary);
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .ph {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
        text-align: center;
      }
      .ph span {
        font-weight: 700;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.92);
        line-height: 1.25;
        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
      }
      .badge {
        position: absolute;
        top: 8px;
        left: 8px;
        width: 26px;
        height: 26px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        border: 1px solid;
        backdrop-filter: blur(4px);
      }
      .nota {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.62);
        color: var(--gold);
        border-radius: 8px;
        padding: 3px 7px;
        font-size: 12px;
        font-weight: 700;
        backdrop-filter: blur(4px);
      }
      .nota .pi {
        font-size: 10px;
      }
      .check {
        position: absolute;
        inset: 0;
        background: rgba(124, 108, 255, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .check .pi {
        background: var(--primary);
        color: #fff;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }
      .info {
        margin-top: 8px;
      }
      .nome {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.3;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .ano {
        font-size: 12px;
        color: var(--text-dim);
        margin-top: 2px;
      }
    `,
  ],
})
export class JogoCardComponent {
  @Input({ required: true }) jogo!: Jogo;
  @Input() status: number | null = null;
  @Input() nota: number | null = null;
  @Input() selecionado = false;
  @Input() mostrarNome = true;
  @Output() clique = new EventEmitter<void>();

  info = (v: number | null): StatusInfo => statusInfo(v ?? 0);

  corFundo(nome: string): string {
    let h = 0;
    for (let i = 0; i < nome.length; i++) h = nome.charCodeAt(i) + ((h << 5) - h);
    const hue = Math.abs(h) % 360;
    return `linear-gradient(150deg, hsl(${hue}, 45%, 30%), hsl(${(hue + 40) % 360}, 42%, 16%))`;
  }
}

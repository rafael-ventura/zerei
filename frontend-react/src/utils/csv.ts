import type { UsuarioJogo } from '../types/models';
import { formatarMesAno } from './data';
import { somarHoras } from './jogo';

function csvEscape(valor: string | number | null | undefined): string {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  if (/[",\n;]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

const STATUS_LABEL: Record<number, string> = { 0: 'Quero jogar', 1: 'Jogando', 2: 'Jogado' };
const SIM_NAO = (v: boolean) => (v ? 'Sim' : 'Não');

const COLUNAS = [
  'Nome', 'Ano de lançamento', 'Gêneros', 'Metacritic', 'Nota da comunidade (RAWG)',
  'Status', 'Zerado', 'Platinado', 'Abandonado', 'Sua nota', 'Favorito',
  'Horas jogadas', 'Plataformas jogadas', 'Início (mês/ano)', 'Resenha',
] as const;

export function bibliotecaParaCsv(biblioteca: UsuarioJogo[]): string {
  const linhas = biblioteca.map((uj) => {
    const principal = uj.jogatinas.find((j) => !j.ehRejogada) ?? uj.jogatinas[0];
    const plataformas = [...new Set(uj.jogatinas.map((j) => j.plataforma).filter(Boolean))].join('; ');
    return [
      uj.jogo.nome,
      uj.jogo.ano ?? '',
      uj.jogo.generos.join('; '),
      uj.jogo.metacritic ?? '',
      uj.jogo.notaComunidade ?? '',
      STATUS_LABEL[uj.status] ?? uj.status,
      SIM_NAO(uj.zerado),
      SIM_NAO(uj.platinado),
      SIM_NAO(uj.abandonado),
      uj.nota || '',
      SIM_NAO(uj.favorito),
      somarHoras(uj) || '',
      plataformas,
      formatarMesAno(principal?.mes, principal?.ano) ?? '',
      uj.resenha ?? '',
    ].map(csvEscape).join(',');
  });
  return [COLUNAS.join(','), ...linhas].join('\r\n');
}

export function baixarCsv(conteudo: string, nomeArquivo: string): void {
  // BOM UTF-8 pro Excel reconhecer acentuação corretamente.
  const blob = new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}

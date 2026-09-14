import type { UsuarioJogo } from '../types/models';

export function somarHoras(uj: UsuarioJogo): number {
  return uj.jogatinas.reduce((soma, jt) => soma + (jt.horas ?? 0), 0);
}

export function somarHorasNoAno(uj: UsuarioJogo, ano: number): number {
  return uj.jogatinas.filter((jt) => jt.ano === ano).reduce((soma, jt) => soma + (jt.horas ?? 0), 0);
}

/** Anos com pelo menos uma jogatina registrada, mais recente primeiro. */
export function anosComJogatina(biblioteca: UsuarioJogo[]): number[] {
  const anos = new Set<number>();
  biblioteca.forEach((uj) => uj.jogatinas.forEach((jt) => { if (jt.ano) anos.add(jt.ano); }));
  return Array.from(anos).sort((a, b) => b - a);
}

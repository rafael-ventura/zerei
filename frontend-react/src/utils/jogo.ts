import type { UsuarioJogo } from '../types/models';

export function somarHoras(uj: UsuarioJogo): number {
  return uj.jogatinas.reduce((soma, jt) => soma + (jt.horas ?? 0), 0);
}

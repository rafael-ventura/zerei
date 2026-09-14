export const MESES = [
  { value: '1', label: 'Jan' }, { value: '2', label: 'Fev' }, { value: '3', label: 'Mar' },
  { value: '4', label: 'Abr' }, { value: '5', label: 'Mai' }, { value: '6', label: 'Jun' },
  { value: '7', label: 'Jul' }, { value: '8', label: 'Ago' }, { value: '9', label: 'Set' },
  { value: '10', label: 'Out' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dez' },
];

export function formatarMesAno(mes?: number | null, ano?: number | null): string | null {
  if (!ano) return null;
  const nomeMes = mes ? MESES.find((m) => m.value === String(mes))?.label : null;
  return nomeMes ? `${nomeMes}/${ano}` : String(ano);
}

/** Chave ordenável (mês+ano) pra comparar duas datas parciais — usada em "jogados recentemente". */
export function chaveMesAno(mes?: number | null, ano?: number | null): number {
  if (!ano) return -1;
  return ano * 12 + (mes ?? 0);
}

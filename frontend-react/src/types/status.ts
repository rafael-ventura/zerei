/** Eixo de engajamento — mutuamente exclusivo. Zerado/Platinado/Abandonado são flags à parte (ver BadgeInfo). */
export enum StatusJogo {
  QueroJogar = 0,
  Jogando = 1,
  Jogado = 2,
}

export interface StatusInfo {
  valor: StatusJogo;
  label: string;
  cor: string;
  icone: string;
}

export const STATUS_LISTA: StatusInfo[] = [
  { valor: StatusJogo.QueroJogar, label: 'Quero jogar', cor: '#8b93a7', icone: 'bookmark' },
  { valor: StatusJogo.Jogando, label: 'Jogando', cor: '#4f9cff', icone: 'player-play' },
  { valor: StatusJogo.Jogado, label: 'Jogado', cor: '#8b93a7', icone: 'device-gamepad-2' },
];

const STATUS_MAP = new Map<number, StatusInfo>(STATUS_LISTA.map((s) => [s.valor, s]));

export function statusInfo(valor: number | null | undefined): StatusInfo {
  return STATUS_MAP.get(valor ?? 0) ?? STATUS_LISTA[0];
}

export interface BadgeInfo {
  label: string;
  cor: string;
  icone: string;
}

/**
 * Zerado/Platinado/Abandonado não se excluem do status — são flags que convivem com "Jogado".
 * Essa função escolhe o selo mais forte pra mostrar num card/lista: Platinado > Zerado > Abandonado
 * > Jogando > Quero jogar. "Jogado" simples (sem nenhuma flag) não ganha selo — é o estado neutro.
 */
export function badgeInfo(
  status: number,
  zerado: boolean,
  platinado: boolean,
  abandonado: boolean,
): BadgeInfo | null {
  if (platinado) return { label: 'Platinado', cor: '#f5c518', icone: 'trophy' };
  if (zerado) return { label: 'Zerado', cor: '#36c98e', icone: 'check' };
  if (abandonado) return { label: 'Abandonado', cor: '#ef5b6b', icone: 'circle-x' };
  if (status === StatusJogo.Jogando) return { label: 'Jogando', cor: '#4f9cff', icone: 'player-play' };
  if (status === StatusJogo.QueroJogar) return { label: 'Quero jogar', cor: '#8b93a7', icone: 'bookmark' };
  return null;
}

/**
 * A API serializa StatusJogo como string (ex.: "Jogado"). Normaliza de volta pra número
 * na borda (hooks de api/), pra todo o resto do app continuar comparando por número.
 */
const NOME_PARA_VALOR: Record<string, StatusJogo> = {
  QueroJogar: StatusJogo.QueroJogar,
  Jogando: StatusJogo.Jogando,
  Jogado: StatusJogo.Jogado,
};

export function normalizarStatus(valor: number | string): number {
  return typeof valor === 'string' ? (NOME_PARA_VALOR[valor] ?? 0) : valor;
}

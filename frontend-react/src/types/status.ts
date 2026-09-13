export enum StatusJogo {
  QueroJogar = 0,
  Jogando = 1,
  Jogado = 2,
  Zerado = 3,
  CemPorcento = 4,
  Platinado = 5,
  Abandonado = 6,
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
  { valor: StatusJogo.Jogado, label: 'Jogado', cor: '#14b8a6', icone: 'check' },
  { valor: StatusJogo.Zerado, label: 'Zerado', cor: '#36c98e', icone: 'flag' },
  { valor: StatusJogo.CemPorcento, label: '100%', cor: '#22d3ee', icone: 'chart-pie' },
  { valor: StatusJogo.Platinado, label: 'Platinado', cor: '#f5c518', icone: 'trophy' },
  { valor: StatusJogo.Abandonado, label: 'Abandonado', cor: '#ef5b6b', icone: 'circle-x' },
];

const STATUS_MAP = new Map<number, StatusInfo>(STATUS_LISTA.map((s) => [s.valor, s]));

export function statusInfo(valor: number | null | undefined): StatusInfo {
  return STATUS_MAP.get(valor ?? 0) ?? STATUS_LISTA[0];
}

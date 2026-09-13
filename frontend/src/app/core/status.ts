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
  { valor: StatusJogo.QueroJogar, label: 'Quero jogar', cor: '#8b93a7', icone: 'pi-bookmark' },
  { valor: StatusJogo.Jogando, label: 'Jogando', cor: '#4f9cff', icone: 'pi-play' },
  { valor: StatusJogo.Jogado, label: 'Jogado', cor: '#14b8a6', icone: 'pi-check' },
  { valor: StatusJogo.Zerado, label: 'Zerado', cor: '#36c98e', icone: 'pi-flag-fill' },
  { valor: StatusJogo.CemPorcento, label: '100%', cor: '#22d3ee', icone: 'pi-chart-pie' },
  { valor: StatusJogo.Platinado, label: 'Platinado', cor: '#f5c518', icone: 'pi-trophy' },
  { valor: StatusJogo.Abandonado, label: 'Abandonado', cor: '#ef5b6b', icone: 'pi-times-circle' },
];

const STATUS_MAP = new Map<number, StatusInfo>(STATUS_LISTA.map((s) => [s.valor, s]));

export function statusInfo(valor: number): StatusInfo {
  return STATUS_MAP.get(valor) ?? STATUS_LISTA[0];
}

/**
 * A API agora serializa StatusJogo como string (ex.: "Zerado"), não mais como número.
 * Isso muda o formato só na resposta — o corpo enviado em requisições continua aceitando número.
 * Essa função normaliza de volta pra número na borda (services), pra nada mais no Angular precisar mudar.
 */
const NOME_PARA_VALOR: Record<string, StatusJogo> = {
  QueroJogar: StatusJogo.QueroJogar,
  Jogando: StatusJogo.Jogando,
  Jogado: StatusJogo.Jogado,
  Zerado: StatusJogo.Zerado,
  CemPorcento: StatusJogo.CemPorcento,
  Platinado: StatusJogo.Platinado,
  Abandonado: StatusJogo.Abandonado,
};

export function normalizarStatus(valor: number | string): number {
  return typeof valor === 'string' ? (NOME_PARA_VALOR[valor] ?? 0) : valor;
}

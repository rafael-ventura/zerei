export interface UsuarioResumo {
  id: number;
  nome: string;
  username: string;
  email: string;
  fotoUrl?: string | null;
  bio?: string | null;
}

export interface AuthResponse {
  token: string;
  usuario: UsuarioResumo;
}

export interface Genero { id: number; nome: string; slug: string; }
export interface Plataforma { id: number; nome: string; slug: string; familia: string; }

export interface DlcResumo {
  id: number;
  nome: string;
  capaUrl?: string | null;
}

export interface Jogo {
  id: number;
  nome: string;
  ano?: number | null;
  capaUrl?: string | null;
  generos: string[];
  metacritic?: number | null;
  tempoMedioHoras?: number | null;
  plataformasDisponiveis: string[];
  dlcs: DlcResumo[];
}

export interface Jogatina {
  id: number;
  plataformaId?: number | null;
  plataforma?: string | null;
  ano?: number | null;
  horas?: number | null;
  status: number;
  zerado: boolean;
  platinado: boolean;
  abandonado: boolean;
  ehRejogada: boolean;
  observacao?: string | null;
}

export interface UsuarioJogo {
  id: number;
  jogo: Jogo;
  status: number;
  zerado: boolean;
  platinado: boolean;
  abandonado: boolean;
  nota?: number | null;
  favorito: boolean;
  resenha?: string | null;
  jogatinas: Jogatina[];
}

export interface DistribuicaoItem { rotulo: string; quantidade: number; }

export interface Estatisticas {
  totalJogos: number;
  jogando: number;
  zerados: number;
  platinados: number;
  abandonados: number;
  queroJogar: number;
  totalHoras: number;
  notaMedia?: number | null;
  plataformaFavorita?: string | null;
  generoFavorito?: string | null;
  porFamiliaPlataforma: DistribuicaoItem[];
  porStatus: DistribuicaoItem[];
}

export interface Perfil {
  usuario: UsuarioResumo;
  estatisticas: Estatisticas;
  favoritos: UsuarioJogo[];
}

export interface UsuarioPublico {
  id: number;
  nome: string;
  username: string;
  fotoUrl?: string | null;
  bio?: string | null;
}

export interface PerfilPublico {
  usuario: UsuarioPublico;
  estatisticas: Estatisticas;
  favoritos: UsuarioJogo[];
  seguidores: number;
  seguindo: number;
  voceSegue: boolean;
}

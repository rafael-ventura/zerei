import {
  IconBookmark, IconCheck, IconCircleX, IconPlayerPlay, IconTrophy, type Icon,
} from '@tabler/icons-react';
import { badgeInfo } from '../types/status';

const ICONES: Record<string, Icon> = {
  bookmark: IconBookmark,
  'player-play': IconPlayerPlay,
  check: IconCheck,
  trophy: IconTrophy,
  'circle-x': IconCircleX,
};

interface Props {
  status: number;
  zerado?: boolean;
  platinado?: boolean;
  abandonado?: boolean;
  size?: number;
}

/** Selo do estado "mais forte" do jogo: Platinado > Zerado > Abandonado > Jogando > Quero jogar. Nada pra "Jogado" simples. */
export function StatusIcon({ status, zerado = false, platinado = false, abandonado = false, size = 14 }: Props) {
  const info = badgeInfo(status, zerado, platinado, abandonado);
  if (!info) return null;
  const Cmp = ICONES[info.icone] ?? IconCheck;
  return <Cmp size={size} color={info.cor} />;
}

import {
  IconBookmark, IconChartPie, IconCheck, IconCircleX, IconFlag, IconPlayerPlay, IconTrophy, type Icon,
} from '@tabler/icons-react';
import { statusInfo } from '../types/status';

const ICONES: Record<string, Icon> = {
  bookmark: IconBookmark,
  'player-play': IconPlayerPlay,
  check: IconCheck,
  flag: IconFlag,
  'chart-pie': IconChartPie,
  trophy: IconTrophy,
  'circle-x': IconCircleX,
};

export function StatusIcon({ status, size = 14 }: { status: number; size?: number }) {
  const info = statusInfo(status);
  const Cmp = ICONES[info.icone] ?? IconCheck;
  return <Cmp size={size} color={info.cor} />;
}

import type { GameMode, Rank } from '../types/tournament';
import { cn } from '../lib/utils';

const rankFolderMap = {
  bronze: 'Bronzo',
  silver: 'Argento',
  gold: 'Oro',
  platinum: 'Platino',
  diamond: 'Diamante',
  onyx: 'Onice',
} as const;

const rankFilePrefixMap = {
  bronze: 'bronzo',
  silver: 'argento',
  gold: 'oro',
  platinum: 'platino',
  diamond: 'diamante',
} as const;

const modeAssetMap: Record<GameMode, string> = {
  slayer: '/Icone%20modalit%C3%A0/slayer%20logo.svg',
  ctf: '/Icone%20modalit%C3%A0/ctf.svg',
  oddball: '/Icone%20modalit%C3%A0/oddball.svg',
  koth: '/Icone%20modalit%C3%A0/koh.svg',
};

export function getRankIconSrc(rank: Rank): string {
  if (rank.tier === 'onyx') {
    return '/Onice/onice.png';
  }

  const level = Math.min(6, Math.max(1, rank.level));
  const folder = rankFolderMap[rank.tier];
  const prefix = rankFilePrefixMap[rank.tier];

  return `/${folder}/${prefix}%20%20(${level}).png`;
}

export function getGameModeIconSrc(mode: GameMode): string {
  return modeAssetMap[mode];
}

interface RankIconProps {
  rank: Rank;
  className?: string;
}

export function RankIcon({ rank, className }: RankIconProps) {
  return (
    <img
      src={getRankIconSrc(rank)}
      alt={`${rank.tier} ${rank.level}`}
      className={cn('h-5 w-5 rounded-sm object-contain', className)}
      loading="lazy"
    />
  );
}

interface ModeIconProps {
  mode: GameMode;
  className?: string;
}

export function ModeIcon({ mode, className }: ModeIconProps) {
  return (
    <img
      src={getGameModeIconSrc(mode)}
      alt={mode}
      className={cn('h-4 w-4 object-contain', className)}
      loading="lazy"
    />
  );
}

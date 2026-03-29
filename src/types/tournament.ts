


// Types for Halo Tournament Generator

export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'onyx';

export interface Rank {
  tier: RankTier;
  level: number; // 1-6 for all tiers, actual number for Onyx (1500+)
}

export interface Player {
  id: string;
  name: string;
  rank: Rank;
  strengthValue: number; // Calculated numeric value for balancing
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  totalStrength: number;
}

export type TournamentType = 'slayer' | 'ranked';
export type TeamMode = '1v1' | '2v2' | '3v3' | '4v4';
export type MatchDuration = 'single' | 'bo3' | 'bo5';
export type TeamCreationMode = 'manual' | 'automatic' | 'random';

export interface TournamentConfig {
  type: TournamentType;
  teamMode: TeamMode;
  matchDuration: MatchDuration;
  teamCreationMode: TeamCreationMode;
  killLimit: number;
}

export type GameMode = 'slayer' | 'ctf' | 'oddball' | 'koth';

export interface Map {
  name: string;
  modes: GameMode[];
}

export interface SeriesScore {
  team1: number;
  team2: number;
}

// Game details for different modes
export interface SlayerGameScore {
  team1PlayerKills: Record<string, number>; // playerId -> kills
  team2PlayerKills: Record<string, number>; // playerId -> kills
  team1TotalKills: number;  // Calculated sum
  team2TotalKills: number;  // Calculated sum
}

export interface ObjectiveGameScore {
  team1Score: number;
  team2Score: number;
}

export interface OddballGameScore {
  team1Rounds: number;
  team2Rounds: number;
}

export type GameScore = SlayerGameScore | ObjectiveGameScore | OddballGameScore;

export interface Game {
  gameNumber: number; // 1, 2, 3, 4, or 5
  mode: GameMode;
  map: string;
  score?: GameScore; // Score details based on mode
  winner?: 1 | 2; // 1 for team1, 2 for team2
}

export interface Match {
  id: string;
  roundIndex: number;
  matchIndex: number;
  team1?: Team;
  team2?: Team;
  winner?: Team;
  map: string;
  mode?: GameMode; // Only for Ranked
  seriesScore?: SeriesScore; // For Bo3 and Bo5
  games?: Game[]; // Individual games in the series
}

export interface Round {
  index: number;
  name: string;
  matches: Match[];
  map: string;
  mode?: GameMode; // Only for Ranked
}

export interface Tournament {
  id: string;
  config: TournamentConfig;
  teams: Team[];
  rounds: Round[];
  winner?: Team;
}

// Map pools
export const SLAYER_MAPS: string[] = [
  'Live Fire',
  'Origin',
  'Recharge',
  'Solitude',
  'Streets',
  'Vacancy'
];

export const RANKED_MAPS: Map[] = [
  { name: 'Live Fire', modes: ['slayer', 'oddball', 'koth'] },
  { name: 'Origin', modes: ['slayer', 'ctf'] },
  { name: 'Recharge', modes: ['slayer', 'oddball'] },
  { name: 'Solitude', modes: ['slayer'] },
  { name: 'Streets', modes: ['slayer'] },
  { name: 'Vacancy', modes: ['slayer', 'koth'] },
  { name: 'Aquarius', modes: ['ctf'] },
  { name: 'Empyrean', modes: ['ctf'] },
  { name: 'Lattice', modes: ['oddball', 'koth'] }
];

// Game mode rotation for Ranked (fixed order)
// Order: Slayer → Oddball → CTF → King of the Hill
export const RANKED_MODE_ROTATION: GameMode[] = ['slayer', 'oddball', 'ctf', 'koth'];




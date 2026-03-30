import type { Player, Team, Tournament, TournamentConfig } from '../types/tournament';

export type SavedStep = 'players' | 'config' | 'teams' | 'bracket';

export interface SavedTournament {
  step: SavedStep;
  players: Player[];
  config: TournamentConfig | null;
  teams: Team[];
  tournament: Tournament | null;
  savedAt: string;
}

const STORAGE_KEY = 'halo_tournament_state';
const DEFAULT_KILL_LIMIT = 50;

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function saveTournamentState(
  step: SavedStep,
  players: Player[],
  config: TournamentConfig | null,
  teams: Team[],
  tournament: Tournament | null
): void {
  if (!isBrowser()) return;

  try {
    const state: SavedTournament = {
      step,
      players,
      config,
      teams,
      tournament,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving tournament state:', error);
  }
}

export function loadTournamentState(): SavedTournament | null {
  if (!isBrowser()) return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as Partial<SavedTournament>;

    return {
      step: parsed.step ?? (parsed.tournament ? 'bracket' : parsed.teams?.length ? 'teams' : parsed.config ? 'config' : 'players'),
      players: parsed.players ?? [],
      config: parsed.config
        ? {
            ...parsed.config,
            killLimit: parsed.config.killLimit ?? DEFAULT_KILL_LIMIT,
          }
        : null,
      teams: parsed.teams ?? [],
      tournament: parsed.tournament
        ? {
            ...parsed.tournament,
            config: {
              ...parsed.tournament.config,
              killLimit:
                parsed.tournament.config?.killLimit ??
                parsed.config?.killLimit ??
                DEFAULT_KILL_LIMIT,
            },
          }
        : null,
      savedAt: parsed.savedAt ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error loading tournament state:', error);
    return null;
  }
}

export function clearTournamentState(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing tournament state:', error);
  }
}

export function hasSavedTournament(): boolean {
  if (!isBrowser()) return false;

  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

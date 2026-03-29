import type { Player, Team, Tournament, TournamentConfig } from '../types/tournament';

export interface SavedTournament {
  players: Player[];
  config: TournamentConfig;
  teams: Team[];
  tournament: Tournament;
  savedAt: string;
}

const STORAGE_KEY = 'halo_tournament_state';
const DEFAULT_KILL_LIMIT = 50;

// 🔥 FIX: check se siamo nel browser
function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function saveTournamentState(
  players: Player[],
  config: TournamentConfig,
  teams: Team[],
  tournament: Tournament
): void {
  if (!isBrowser()) return;

  try {
    const state: SavedTournament = {
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
    
    const parsed = JSON.parse(saved) as SavedTournament;

    return {
      ...parsed,
      config: {
        ...parsed.config,
        killLimit: parsed.config?.killLimit ?? DEFAULT_KILL_LIMIT,
      },
      tournament: {
        ...parsed.tournament,
        config: {
          ...parsed.tournament.config,
          killLimit: parsed.tournament.config?.killLimit ?? parsed.config?.killLimit ?? DEFAULT_KILL_LIMIT,
        },
      },
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

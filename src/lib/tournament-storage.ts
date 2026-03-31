import type { Player, Team, Tournament, TournamentConfig } from '../types/tournament';
import { saveTournamentRecordToSupabase } from './supabase-storage';

export type SavedStep = 'players' | 'config' | 'teams' | 'bracket';
export type SavedTournamentStatus = 'active' | 'completed';

export interface SavedTournament {
  step: SavedStep;
  players: Player[];
  config: TournamentConfig | null;
  teams: Team[];
  tournament: Tournament | null;
  savedAt: string;
}

export interface SavedTournamentRecord extends SavedTournament {
  id: string;
  name: string;
  status: SavedTournamentStatus;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string | null;
}

interface SaveNamedTournamentInput {
  id?: string | null;
  name: string;
  step: SavedStep;
  players: Player[];
  config: TournamentConfig | null;
  teams: Team[];
  tournament: Tournament | null;
}

const STORAGE_KEY = 'halo_tournament_state';
const SAVED_TOURNAMENTS_KEY = 'halo_tournament_library';
const DEFAULT_KILL_LIMIT = 50;
const COMPLETED_RETENTION_DAYS = 30;

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function buildSavedTournament(
  step: SavedStep,
  players: Player[],
  config: TournamentConfig | null,
  teams: Team[],
  tournament: Tournament | null,
  savedAt = new Date().toISOString()
): SavedTournament {
  return {
    step,
    players,
    config,
    teams,
    tournament,
    savedAt,
  };
}

function normalizeSavedTournament(parsed: Partial<SavedTournament>): SavedTournament {
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
}

function normalizeSavedTournamentRecord(parsed: Partial<SavedTournamentRecord>): SavedTournamentRecord {
  const normalized = normalizeSavedTournament(parsed);
  return {
    id: parsed.id ?? `saved-${Date.now()}`,
    name: parsed.name?.trim() || 'Tournament',
    status: parsed.status ?? (normalized.tournament?.winner ? 'completed' : 'active'),
    createdAt: parsed.createdAt ?? normalized.savedAt,
    completedAt: parsed.completedAt ?? null,
    expiresAt: parsed.expiresAt ?? null,
    ...normalized,
  };
}

function getRetentionExpiry(completedAt: string): string {
  const date = new Date(completedAt);
  date.setDate(date.getDate() + COMPLETED_RETENTION_DAYS);
  return date.toISOString();
}

function persistSavedTournamentRecords(records: SavedTournamentRecord[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(SAVED_TOURNAMENTS_KEY, JSON.stringify(records));
}

function readSavedTournamentRecords(): SavedTournamentRecord[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(SAVED_TOURNAMENTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Partial<SavedTournamentRecord>[];
    return parsed.map(normalizeSavedTournamentRecord);
  } catch (error) {
    console.error('Error reading saved tournaments:', error);
    return [];
  }
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildSavedTournament(step, players, config, teams, tournament)));
  } catch (error) {
    console.error('Error saving tournament state:', error);
  }
}

export function loadTournamentState(): SavedTournament | null {
  if (!isBrowser()) return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    return normalizeSavedTournament(JSON.parse(saved) as Partial<SavedTournament>);
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

export function listSavedTournamentRecords(): SavedTournamentRecord[] {
  const now = Date.now();
  const allRecords = readSavedTournamentRecords();
  const validRecords = allRecords.filter((record) => {
    if (record.status !== 'completed' || !record.expiresAt) return true;
    return new Date(record.expiresAt).getTime() > now;
  });

  if (validRecords.length !== allRecords.length) {
    persistSavedTournamentRecords(validRecords);
  }

  return validRecords.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
  });
}

export function loadSavedTournamentRecord(id: string): SavedTournamentRecord | null {
  return listSavedTournamentRecords().find((record) => record.id === id) ?? null;
}

export function saveNamedTournament(input: SaveNamedTournamentInput): SavedTournamentRecord {
  const savedAt = new Date().toISOString();
  const isCompleted = Boolean(input.tournament?.winner);
  const currentRecords = listSavedTournamentRecords();
  const existingRecord = input.id ? currentRecords.find((record) => record.id === input.id) : undefined;
  const completedAt = isCompleted ? existingRecord?.completedAt ?? savedAt : null;

  const nextRecord: SavedTournamentRecord = {
    id: existingRecord?.id ?? `saved-${Date.now()}`,
    name: input.name.trim(),
    status: isCompleted ? 'completed' : 'active',
    createdAt: existingRecord?.createdAt ?? savedAt,
    completedAt,
    expiresAt: completedAt ? getRetentionExpiry(completedAt) : null,
    ...buildSavedTournament(input.step, input.players, input.config, input.teams, input.tournament, savedAt),
  };

  const nextRecords = existingRecord
    ? currentRecords.map((record) => (record.id === existingRecord.id ? nextRecord : record))
    : [nextRecord, ...currentRecords];

  persistSavedTournamentRecords(nextRecords);
  void saveTournamentRecordToSupabase(nextRecord);
  return nextRecord;
}

export function deleteSavedTournamentRecord(id: string): void {
  const currentRecords = listSavedTournamentRecords();
  persistSavedTournamentRecords(currentRecords.filter((record) => record.id !== id));
}

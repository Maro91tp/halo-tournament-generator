import type { Player } from '../types/tournament';
import type { SavedTournamentRecord } from './tournament-storage';
import { resolveSavedStep } from './tournament-storage';
import { isSupabaseConfigured, supabase } from './supabase';
import type { StoredPlayer } from './player-storage';

function toPlayerPayload(player: Player | StoredPlayer) {
  return {
    app_player_id: 'id' in player ? player.id : null,
    name: player.name,
    gamertag: player.gamertag ?? null,
    rank_tier: player.rank.tier,
    rank_level: player.rank.level,
    strength_value: 'strengthValue' in player ? player.strengthValue : null,
    last_used_at: 'lastUsed' in player && player.lastUsed ? new Date(player.lastUsed).toISOString() : new Date().toISOString(),
  };
}

function normalizePlayerFromSupabase(player: any): StoredPlayer {
  return {
    name: player.name,
    gamertag: player.gamertag ?? undefined,
    rank: {
      tier: player.rank_tier,
      level: player.rank_level,
    },
    lastUsed: player.last_used_at ? new Date(player.last_used_at).getTime() : Date.now(),
  };
}

export async function syncPlayerToSupabase(player: Player | StoredPlayer): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase.from('players').upsert(toPlayerPayload(player), {
    onConflict: 'name',
  });

  if (error) {
    console.error('Error syncing player to Supabase:', error);
    throw error;
  }
}

export async function syncPlayersToSupabase(players: Array<Player | StoredPlayer>): Promise<void> {
  if (!isSupabaseConfigured || !supabase || players.length === 0) return;

  const payload = players.map(toPlayerPayload);
  const { error } = await supabase.from('players').upsert(payload, {
    onConflict: 'name',
  });

  if (error) {
    console.error('Error syncing players to Supabase:', error);
  }
}

export async function saveTournamentRecordToSupabase(record: SavedTournamentRecord): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  const payload = {
    id: record.id,
    name: record.name,
    status: record.status,
    step: record.step,
    config: record.config,
    players: record.players,
    teams: record.teams,
    tournament: record.tournament,
    created_at: record.createdAt,
    saved_at: record.savedAt,
    completed_at: record.completedAt,
    expires_at: record.expiresAt,
  };

  const { error } = await supabase.from('tournaments').upsert(payload, {
    onConflict: 'id',
  });

  if (error) {
    console.error('Error syncing tournament to Supabase:', error);
  }
}

export async function listPlayersFromSupabase(): Promise<StoredPlayer[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error loading players from Supabase:', error);
    throw error;
  }

  return (data ?? []).map(normalizePlayerFromSupabase);
}

function normalizeTournamentRecordFromSupabase(record: any): SavedTournamentRecord {
  return {
    id: record.id,
    name: record.name?.trim() || 'Tournament',
    status: record.status === 'completed' ? 'completed' : 'active',
    step: resolveSavedStep({
      step: record.step,
      config: record.config ?? null,
      teams: Array.isArray(record.teams) ? record.teams : [],
      tournament: record.tournament ?? null,
    }),
    config: record.config ?? null,
    players: Array.isArray(record.players) ? record.players : [],
    teams: Array.isArray(record.teams) ? record.teams : [],
    tournament: record.tournament ?? null,
    createdAt: record.created_at ?? record.saved_at ?? new Date().toISOString(),
    savedAt: record.saved_at ?? new Date().toISOString(),
    completedAt: record.completed_at ?? null,
    expiresAt: record.expires_at ?? null,
  };
}

export async function listTournamentRecordsFromSupabase(): Promise<SavedTournamentRecord[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('saved_at', { ascending: false });

  if (error) {
    console.error('Error loading tournaments from Supabase:', error);
    throw error;
  }

  return (data ?? []).map(normalizeTournamentRecordFromSupabase);
}

export async function loadTournamentRecordFromSupabase(id: string): Promise<SavedTournamentRecord | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error loading tournament from Supabase:', error);
    throw error;
  }

  return data ? normalizeTournamentRecordFromSupabase(data) : null;
}

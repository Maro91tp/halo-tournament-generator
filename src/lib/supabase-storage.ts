import type { Player } from '../types/tournament';
import type { SavedTournamentRecord } from './tournament-storage';
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

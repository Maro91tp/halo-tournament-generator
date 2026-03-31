import type { Player, Rank, RankTier } from '../types/tournament';
import bundledPlayersText from '../../players.txt?raw';
import { syncPlayerToSupabase, syncPlayersToSupabase } from './supabase-storage';

const STORAGE_KEY = 'halo_tournament_players';

export interface StoredPlayer {
  name: string;
  gamertag?: string;
  rank: Rank;
  lastUsed: number;
}

function sortPlayersAlphabetically(players: StoredPlayer[]): StoredPlayer[] {
  return [...players].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

function parseRank(text: string): Rank | null {
  const normalized = text.trim().toLowerCase();
  const match = normalized.match(/^(bronzo|bronze|argento|silver|oro|gold|platino|platinum|diamante|diamond|onice|onyx)\s+(\d+)$/);

  if (!match) return null;

  const tierMap: Record<string, RankTier> = {
    bronzo: 'bronze',
    bronze: 'bronze',
    argento: 'silver',
    silver: 'silver',
    oro: 'gold',
    gold: 'gold',
    platino: 'platinum',
    platinum: 'platinum',
    diamante: 'diamond',
    diamond: 'diamond',
    onice: 'onyx',
    onyx: 'onyx',
  };

  const tier = tierMap[match[1]];
  const level = Number.parseInt(match[2], 10);

  return { tier, level };
}

function parseBundledPlayers(text: string): StoredPlayer[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed: StoredPlayer[] = [];

  for (let i = 0; i < lines.length; i += 2) {
    const name = lines[i];
    const rank = parseRank(lines[i + 1] ?? '');

    if (!name || !rank) continue;

    parsed.push({
      name,
      rank,
      lastUsed: 0,
    });
  }

  return parsed;
}

export function getBundledPlayers(): StoredPlayer[] {
  return sortPlayersAlphabetically(parseBundledPlayers(bundledPlayersText));
}

export async function syncBundledPlayers(): Promise<StoredPlayer[]> {
  if (typeof window === 'undefined') return [];

  try {
    const bundledPlayers = getBundledPlayers();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bundledPlayers));
    void syncPlayersToSupabase(bundledPlayers);
    return sortPlayersAlphabetically(bundledPlayers);
  } catch (error) {
    console.error('Error syncing bundled players:', error);
    return getStoredPlayers();
  }
}

/**
 * Get all stored players from localStorage
 */
export function getStoredPlayers(): StoredPlayer[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const players: StoredPlayer[] = JSON.parse(stored);
    return sortPlayersAlphabetically(players);
  } catch (error) {
    console.error('Error loading stored players:', error);
    return [];
  }
}

/**
 * Save or update a player in localStorage
 */
export async function savePlayer(player: Player): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = getStoredPlayers();
    
    // Check if player already exists
    const existingIndex = stored.findIndex(
      p => p.name.toLowerCase() === player.name.toLowerCase()
    );
    
    const storedPlayer: StoredPlayer = {
      name: player.name,
      gamertag: player.gamertag,
      rank: player.rank,
      lastUsed: Date.now()
    };
    
    if (existingIndex >= 0) {
      // Update existing
      stored[existingIndex] = storedPlayer;
    } else {
      // Add new
      stored.push(storedPlayer);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    await syncPlayerToSupabase(player);
    return true;
  } catch (error) {
    console.error('Error saving player:', error);
    return false;
  }
}

/**
 * Search stored players by name (for autocomplete)
 */
export function searchPlayers(query: string): StoredPlayer[] {
  if (!query || query.length < 2) return [];
  
  const stored = getStoredPlayers();
  const normalizedQuery = query.toLowerCase();
  
  return stored.filter(p => 
    p.name.toLowerCase().includes(normalizedQuery)
  ).slice(0, 5); // Max 5 suggestions
}

/**
 * Get a specific player by name
 */
export function getPlayerByName(name: string): StoredPlayer | undefined {
  const stored = getStoredPlayers();
  return stored.find(p => p.name.toLowerCase() === name.toLowerCase());
}

/**
 * Clear all stored players (for debugging/reset)
 */
export function clearStoredPlayers(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

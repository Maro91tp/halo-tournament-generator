const STORAGE_PREFIX = 'halo_tournament_password_';

function hasSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function getTournamentPassword(tournamentId: string): string | null {
  if (!hasSessionStorage()) return null;
  try {
    return window.sessionStorage.getItem(STORAGE_PREFIX + tournamentId);
  } catch {
    return null;
  }
}

export function setTournamentPassword(tournamentId: string, password: string): void {
  if (!hasSessionStorage()) return;
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + tournamentId, password);
  } catch {
    // ignore storage quota / privacy errors
  }
}

export function clearTournamentPassword(tournamentId: string): void {
  if (!hasSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(STORAGE_PREFIX + tournamentId);
  } catch {
    // ignore
  }
}

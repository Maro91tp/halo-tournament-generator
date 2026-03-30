import type {
  Player,
  Rank,
  Team,
  Tournament,
  TournamentConfig,
  Round,
  Match,
  GameMode,
  SeriesScore,
  Game,
} from '../types/tournament';
import { SLAYER_MAPS, RANKED_MAPS, RANKED_MODE_ROTATION } from '../types/tournament';
import type { Language } from './language';

/**
 * Convert rank to numeric strength value for balancing
 *
 * Scale:
 * Bronze 1-6 = 1-6
 * Silver 1-6 = 7-12
 * Gold 1-6 = 13-18
 * Platinum 1-6 = 19-24
 * Diamond 1-6 = 25-30
 * Onyx = starts at 1500, continuous growth
 */
export function calculateStrengthValue(rank: Rank): number {
  const tierBaseValues: Record<string, number> = {
    bronze: 0,
    silver: 6,
    gold: 12,
    platinum: 18,
    diamond: 24,
  };

  if (rank.tier === 'onyx') {
    return Math.floor((rank.level - 1500) / 10) + 31;
  }

  return tierBaseValues[rank.tier] + rank.level;
}

/**
 * Generate balanced teams automatically
 * Algorithm:
 * 1. Sort players by strength (highest to lowest)
 * 2. Assign each player to the team with the lowest total strength
 */
export function generateBalancedTeams(players: Player[], teamSize: number, language: Language = 'it'): Team[] {
  const sortedPlayers = [...players].sort((a, b) => b.strengthValue - a.strengthValue);
  const numTeams = Math.floor(players.length / teamSize);
  const teams: Team[] = [];

  for (let i = 0; i < numTeams; i++) {
    teams.push({
      id: `team-${i + 1}`,
      name: language === 'en' ? `Team ${i + 1}` : `Squadra ${i + 1}`,
      players: [],
      totalStrength: 0,
    });
  }

  for (const player of sortedPlayers) {
    const availableTeams = teams.filter((team) => team.players.length < teamSize);
    if (availableTeams.length === 0) break;

    const weakestTeam = availableTeams.reduce((min, team) =>
      team.totalStrength < min.totalStrength ? team : min
    );

    weakestTeam.players.push(player);
    weakestTeam.totalStrength += player.strengthValue;
  }

  return teams;
}

/**
 * Generate random teams
 * Algorithm:
 * 1. Shuffle players randomly
 * 2. Distribute them evenly across teams
 */
export function generateRandomTeams(players: Player[], teamSize: number, language: Language = 'it'): Team[] {
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  const numTeams = Math.floor(players.length / teamSize);
  const teams: Team[] = [];

  for (let i = 0; i < numTeams; i++) {
    teams.push({
      id: `team-${i + 1}`,
      name: language === 'en' ? `Team ${i + 1}` : `Squadra ${i + 1}`,
      players: [],
      totalStrength: 0,
    });
  }

  shuffledPlayers.forEach((player, index) => {
    const teamIndex = index % numTeams;
    teams[teamIndex].players.push(player);
    teams[teamIndex].totalStrength += player.strengthValue;
  });

  return teams;
}

function getRandomSlayerMap(usedMaps: string[] = []): string {
  const availableMaps = SLAYER_MAPS.filter((map) => !usedMaps.includes(map));
  const mapsToUse = availableMaps.length > 0 ? availableMaps : SLAYER_MAPS;
  return mapsToUse[Math.floor(Math.random() * mapsToUse.length)];
}

function getRandomRankedMap(mode: GameMode, usedMaps: string[] = []): string {
  const availableMaps = RANKED_MAPS.filter((map) => map.modes.includes(mode))
    .filter((map) => !usedMaps.includes(map.name))
    .map((map) => map.name);

  const mapsToUse =
    availableMaps.length > 0
      ? availableMaps
      : RANKED_MAPS.filter((map) => map.modes.includes(mode)).map((map) => map.name);

  return mapsToUse[Math.floor(Math.random() * mapsToUse.length)];
}

/**
 * Generate tournament bracket
 */
export function generateTournament(teams: Team[], config: TournamentConfig, language: Language = 'it'): Tournament {
  const numTeams = teams.length;
  const numRounds = Math.ceil(Math.log2(numTeams));
  const rounds: Round[] = [];
  const usedMaps: string[] = [];
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

  const firstRoundMatches: Match[] = [];
  const firstRoundMode = config.type === 'ranked' ? RANKED_MODE_ROTATION[0] : undefined;
  const firstRoundMap =
    config.type === 'ranked'
      ? getRandomRankedMap(firstRoundMode!, usedMaps)
      : getRandomSlayerMap(usedMaps);

  usedMaps.push(firstRoundMap);

  for (let i = 0; i < shuffledTeams.length; i += 2) {
    if (i + 1 < shuffledTeams.length) {
      firstRoundMatches.push({
        id: `match-0-${i / 2}`,
        roundIndex: 0,
        matchIndex: i / 2,
        team1: shuffledTeams[i],
        team2: shuffledTeams[i + 1],
        map: firstRoundMap,
        mode: firstRoundMode,
      });
    } else {
      firstRoundMatches.push({
        id: `match-0-${i / 2}`,
        roundIndex: 0,
        matchIndex: i / 2,
        team1: shuffledTeams[i],
        winner: shuffledTeams[i],
        map: firstRoundMap,
        mode: firstRoundMode,
      });
    }
  }

  rounds.push({
    index: 0,
    name: getRoundName(0, numRounds, language),
    matches: firstRoundMatches,
    map: firstRoundMap,
    mode: firstRoundMode,
  });

  for (let roundIndex = 1; roundIndex < numRounds; roundIndex++) {
    const numMatches = Math.ceil(firstRoundMatches.length / Math.pow(2, roundIndex));
    const matches: Match[] = [];
    const roundMode =
      config.type === 'ranked'
        ? RANKED_MODE_ROTATION[roundIndex % RANKED_MODE_ROTATION.length]
        : undefined;
    const roundMap =
      config.type === 'ranked'
        ? getRandomRankedMap(roundMode!, usedMaps)
        : getRandomSlayerMap(usedMaps);

    usedMaps.push(roundMap);

    for (let matchIndex = 0; matchIndex < numMatches; matchIndex++) {
      matches.push({
        id: `match-${roundIndex}-${matchIndex}`,
        roundIndex,
        matchIndex,
        map: roundMap,
        mode: roundMode,
      });
    }

    rounds.push({
      index: roundIndex,
      name: getRoundName(roundIndex, numRounds, language),
      matches,
      map: roundMap,
      mode: roundMode,
    });
  }

  resolveAutomaticAdvancements(rounds);

  return {
    id: `tournament-${Date.now()}`,
    config,
    teams,
    rounds,
    winner: rounds[rounds.length - 1]?.matches[0]?.winner,
  };
}

function getRoundName(roundIndex: number, totalRounds: number, language: Language = 'it'): string {
  const roundsFromEnd = totalRounds - roundIndex;

  if (language === 'en') {
    if (roundsFromEnd === 1) return 'Final';
    if (roundsFromEnd === 2) return 'Semifinal';
    if (roundsFromEnd === 3) return 'Quarterfinal';
    if (roundsFromEnd === 4) return 'Round of 16';
    return `Round ${roundIndex + 1}`;
  }

  if (roundsFromEnd === 1) return 'Finale';
  if (roundsFromEnd === 2) return 'Semifinale';
  if (roundsFromEnd === 3) return 'Quarti di finale';
  if (roundsFromEnd === 4) return 'Ottavi di finale';

  return `Round ${roundIndex + 1}`;
}

/**
 * Update tournament with match result
 */
export function updateMatchResult(
  tournament: Tournament,
  matchId: string,
  winnerId: string,
  seriesScore?: SeriesScore,
  games?: Game[]
): Tournament {
  const updatedRounds = [...tournament.rounds];

  for (const round of updatedRounds) {
    const match = round.matches.find((candidate) => candidate.id === matchId);
    if (!match) continue;

    const winner = match.team1?.id === winnerId ? match.team1 : match.team2;
    match.winner = winner;

    if (seriesScore) {
      match.seriesScore = seriesScore;
    }

    if (games) {
      match.games = games;
    }

    break;
  }

  resolveAutomaticAdvancements(updatedRounds);

  return {
    ...tournament,
    rounds: updatedRounds,
    winner: updatedRounds[updatedRounds.length - 1]?.matches[0]?.winner,
  };
}

function resolveAutomaticAdvancements(rounds: Round[]) {
  let hasChanges = true;

  while (hasChanges) {
    hasChanges = false;

    for (let roundIndex = 1; roundIndex < rounds.length; roundIndex++) {
      const previousRound = rounds[roundIndex - 1];
      const currentRound = rounds[roundIndex];

      currentRound.matches.forEach((match, matchIndex) => {
        const sourceMatch1 = previousRound.matches[matchIndex * 2];
        const sourceMatch2 = previousRound.matches[matchIndex * 2 + 1];

        if (sourceMatch1?.winner && match.team1?.id !== sourceMatch1.winner.id) {
          match.team1 = sourceMatch1.winner;
          hasChanges = true;
        }

        if (sourceMatch2?.winner && match.team2?.id !== sourceMatch2.winner.id) {
          match.team2 = sourceMatch2.winner;
          hasChanges = true;
        }

        const autoWinner =
          sourceMatch1?.winner && !sourceMatch2
            ? sourceMatch1.winner
            : sourceMatch2?.winner && !sourceMatch1
            ? sourceMatch2.winner
            : undefined;

        if (autoWinner && match.winner?.id !== autoWinner.id) {
          match.winner = autoWinner;
          hasChanges = true;
        }
      });
    }
  }
}

/**
 * Get rank display string
 */
export function getRankDisplay(rank: Rank, language: Language = 'it'): string {
  const tierNames: Record<string, string> = language === 'en'
    ? {
        bronze: 'Bronze',
        silver: 'Silver',
        gold: 'Gold',
        platinum: 'Platinum',
        diamond: 'Diamond',
        onyx: 'Onyx',
      }
    : {
        bronze: 'Bronzo',
        silver: 'Argento',
        gold: 'Oro',
        platinum: 'Platino',
        diamond: 'Diamante',
        onyx: 'Onice',
      };

  if (rank.tier === 'onyx') {
    return `${tierNames.onyx} ${rank.level}`;
  }

  return `${tierNames[rank.tier]} ${rank.level}`;
}

/**
 * Generate games for a match based on config and round
 * Each game gets its own mode and map
 */
export function generateGamesForMatch(
  config: TournamentConfig,
  roundIndex: number,
  numGames: number
): Game[] {
  const games: Game[] = [];
  const usedMaps: string[] = [];

  for (let i = 0; i < numGames; i++) {
    let mode: GameMode;
    let map: string;

    if (config.type === 'slayer') {
      mode = 'slayer';
      map = getRandomSlayerMap(usedMaps);
    } else {
      mode = RANKED_MODE_ROTATION[(roundIndex + i) % RANKED_MODE_ROTATION.length];
      map = getRandomRankedMap(mode, usedMaps);
    }

    usedMaps.push(map);

    games.push({
      gameNumber: i + 1,
      mode,
      map,
      winner: undefined,
      score: undefined,
    });
  }

  return games;
}

export function getGameModeDisplay(mode: GameMode, language: Language = 'it'): string {
  const modeNames: Record<GameMode, string> = language === 'en'
    ? {
        slayer: 'Slayer',
        ctf: 'Capture the Flag',
        oddball: 'Oddball',
        koth: 'King of the Hill',
      }
    : {
        slayer: 'Massacro',
        ctf: 'Ruba la bandiera',
        oddball: 'Teschio',
        koth: 'Re della collina',
      };

  return modeNames[mode];
}

export function getMatchDurationDisplay(duration: string, language: Language = 'it'): string {
  if (duration === 'single') return language === 'en' ? 'Bo1' : 'Bo1';
  if (duration === 'bo3') return 'Bo3';
  if (duration === 'bo5') return 'Bo5';
  return duration;
}

export function validatePlayerCount(playerCount: number, teamMode: string): boolean {
  const teamSize = parseInt(teamMode.charAt(0));
  return playerCount >= teamSize * 2 && playerCount % teamSize === 0;
}

export function validateSeriesScore(score: SeriesScore, matchDuration: string): boolean {
  const { team1, team2 } = score;

  if (matchDuration === 'single') {
    return (team1 === 1 && team2 === 0) || (team1 === 0 && team2 === 1);
  }

  if (matchDuration === 'bo3') {
    const total = team1 + team2;
    const winner = Math.max(team1, team2);
    return winner === 2 && total >= 2 && total <= 3;
  }

  if (matchDuration === 'bo5') {
    const total = team1 + team2;
    const winner = Math.max(team1, team2);
    return winner === 3 && total >= 3 && total <= 5;
  }

  return false;
}

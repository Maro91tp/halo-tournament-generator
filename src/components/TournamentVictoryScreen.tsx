import type { ReactNode } from 'react';
import { Crown, Medal, RefreshCcw, Sparkles, Swords, Trophy } from 'lucide-react';
import type { Game, Match, Player, Team, Tournament } from '../types/tournament';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { getGameModeDisplay, getMatchDurationDisplay } from '../lib/tournament-utils';
import { RankIcon } from './TournamentIcons';

interface TournamentVictoryScreenProps {
  tournament: Tournament;
  onReplay: () => void;
  onReset: () => void;
}

interface PlayerSummary {
  player: Player;
  kills: number;
  gameWins: number;
  appearances: number;
}

interface WinnerStats {
  seriesWins: number;
  gameWins: number;
  totalKills: number;
  objectivePoints: number;
  mvp: PlayerSummary;
  playerSummaries: PlayerSummary[];
}

export default function TournamentVictoryScreen({
  tournament,
  onReplay,
  onReset,
}: TournamentVictoryScreenProps) {
  if (!tournament.winner) return null;

  const completedMatches = tournament.rounds.flatMap((round) => round.matches).filter((match) => match.winner);
  const winnerStats = getWinnerStats(tournament.winner, completedMatches);
  const heroSubtitle = getHeroSubtitle(tournament.winner.name, winnerStats);

  return (
    <div className="w-full space-y-8">
      <section className="relative overflow-hidden rounded-[40px] border border-cyan-300/30 bg-[radial-gradient(circle_at_top,rgba(80,220,255,0.34),transparent_36%),linear-gradient(180deg,rgba(6,24,54,0.96)_0%,rgba(6,14,40,0.98)_100%)] px-6 py-12 shadow-[0_0_80px_rgba(34,211,238,0.24)] md:px-12 md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-full border border-cyan-300/45 bg-cyan-300/10 shadow-[0_0_44px_rgba(34,211,238,0.32)] motion-safe:animate-pulse">
            <img
              src="/halo-cup.svg"
              alt="Coppa Halo"
              className="h-16 w-16 object-contain drop-shadow-[0_0_26px_rgba(34,211,238,0.38)]"
            />
          </div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
            <Sparkles className="h-4 w-4" />
            <span>Campione del torneo</span>
          </div>
          <h1 className="text-5xl font-bold font-heading text-white drop-shadow-[0_0_26px_rgba(34,211,238,0.16)] md:text-7xl">
            {tournament.winner.name}
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-medium text-cyan-50/88 md:text-xl">
            {heroSubtitle}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 text-white/80">
            <HeroChip icon={<Trophy className="h-4 w-4 text-cyan-200" />} text={`${winnerStats.seriesWins} match vinti`} />
            <HeroChip icon={<Swords className="h-4 w-4 text-cyan-200" />} text={`${winnerStats.gameWins} game vinti`} />
            <HeroChip icon={<Crown className="h-4 w-4 text-cyan-200" />} text={getMatchDurationDisplay(tournament.config.matchDuration)} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <Card className="p-6 md:p-8">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/68">
            <Trophy className="h-4 w-4 text-primary" />
            <span>Statistiche finali</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <StatTile label="Kill totali" value={String(winnerStats.totalKills)} highlight />
            <StatTile label="Match vinti" value={String(winnerStats.seriesWins)} />
            <StatTile label="Game vinti" value={String(winnerStats.gameWins)} />
            <StatTile label="Giocatori" value={String(tournament.winner.players.length)} />
          </div>

          <div className="mt-6 rounded-[30px] border border-cyan-300/32 bg-[linear-gradient(180deg,rgba(95,220,255,0.22)_0%,rgba(95,220,255,0.08)_100%)] p-6 shadow-[0_0_36px_rgba(34,211,238,0.16)]">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100/90">
              <Medal className="h-5 w-5 text-cyan-200 motion-safe:animate-pulse" />
              <span>MVP</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/36 bg-black/18 shadow-[0_0_20px_rgba(34,211,238,0.16)]">
                <RankIcon rank={winnerStats.mvp.player.rank} className="h-10 w-10" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{winnerStats.mvp.player.name}</div>
                <div className="mt-1 text-sm text-white/72">
                  {winnerStats.mvp.kills} kill • {winnerStats.mvp.gameWins} game vinti
                </div>
              </div>
              <div className="ml-auto rounded-full border border-cyan-300/45 bg-cyan-300/18 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.18em] text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.22)]">
                MVP
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/68">
            <Crown className="h-4 w-4 text-primary" />
            <span>Roster campione</span>
          </div>
          <div className="space-y-3">
            {winnerStats.playerSummaries.map((summary) => (
              <div
                key={summary.player.id}
                className={`rounded-[22px] border px-4 py-4 ${
                  summary.player.id === winnerStats.mvp.player.id
                    ? 'border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_22px_rgba(34,211,238,0.12)]'
                    : 'border-white/10 bg-black/10'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <RankIcon rank={summary.player.rank} className="h-6 w-6" />
                      <div className="truncate text-lg font-semibold text-white">{summary.player.name}</div>
                    </div>
                    <div className="mt-2 text-sm text-white/70">
                      {summary.kills} kill • {summary.gameWins} game vinti • {summary.appearances} presenze
                    </div>
                  </div>
                  {summary.player.id === winnerStats.mvp.player.id && (
                    <div className="rounded-full border border-cyan-300/40 bg-cyan-300/16 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.18)]">
                      MVP
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className="p-6 md:p-8">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/68">
          <Swords className="h-4 w-4 text-primary" />
          <span>Percorso torneo</span>
        </div>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          {tournament.rounds.map((round) => (
            <div
              key={round.index}
              className={`rounded-[24px] border p-4 ${
                round.index === tournament.rounds.length - 1
                  ? 'border-cyan-300/28 bg-[linear-gradient(180deg,rgba(95,220,255,0.10)_0%,rgba(10,20,45,0.74)_100%)] shadow-[0_0_24px_rgba(34,211,238,0.12)]'
                  : 'border-white/10 bg-black/10'
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-white">{round.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/50">
                    {round.mode ? getGameModeDisplay(round.mode) : 'Round'} {round.map ? `• ${round.map}` : ''}
                  </div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/72">
                  {round.matches.length} match
                </div>
              </div>
              <div className="space-y-3">
                {round.matches.map((match) => (
                  <MiniMatchCard key={match.id} match={match} championId={tournament.winner?.id} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button onClick={onReplay} variant="outline" size="lg" className="text-white/86">
          <RefreshCcw className="h-4 w-4" />
          Rigioca stesso torneo
        </Button>
        <Button onClick={onReset} size="lg" className="shadow-[0_0_28px_rgba(34,211,238,0.20)]">
          <RefreshCcw className="h-4 w-4" />
          Nuovo torneo
        </Button>
      </div>

      <div className="text-center text-xs text-white/55">
        Questo progetto e un fan project non ufficiale. Halo e un marchio registrato di Microsoft.
      </div>
      <div className="text-center text-sm font-semibold tracking-[0.1em] text-cyan-100/80">
        Made by MrMarozzo
      </div>
    </div>
  );
}

function getHeroSubtitle(teamName: string, winnerStats: WinnerStats): string {
  if (winnerStats.seriesWins >= 3) return `${teamName} ha dominato il torneo`;
  if (winnerStats.gameWins >= 3) return 'Abbiamo un vincitore';
  return 'Campioni del torneo';
}

function getWinnerStats(winner: Team, matches: Match[]): WinnerStats {
  const playerStats = new Map<string, PlayerSummary>();
  winner.players.forEach((player) => {
    playerStats.set(player.id, {
      player,
      kills: 0,
      gameWins: 0,
      appearances: 0,
    });
  });

  let seriesWins = 0;
  let gameWins = 0;
  let totalKills = 0;
  let objectivePoints = 0;

  matches.forEach((match) => {
    const winnerWasTeam1 = match.winner?.id === winner.id && match.team1?.id === winner.id;
    const winnerWasTeam2 = match.winner?.id === winner.id && match.team2?.id === winner.id;
    if (!winnerWasTeam1 && !winnerWasTeam2) return;

    seriesWins += 1;

    match.games?.forEach((game) => {
      if (game.winner === (winnerWasTeam1 ? 1 : 2)) {
        gameWins += 1;
      }

      const summary = winnerWasTeam1 ? readTeamOneGameStats(game) : readTeamTwoGameStats(game);

      totalKills += summary.kills;
      objectivePoints += summary.points;

      Object.entries(summary.playerKills).forEach(([playerId, kills]) => {
        const current = playerStats.get(playerId);
        if (!current) return;
        current.kills += kills;
        current.appearances += 1;
        if (game.winner === (winnerWasTeam1 ? 1 : 2)) {
          current.gameWins += 1;
        }
      });
    });
  });

  const playerSummaries = Array.from(playerStats.values()).sort((a, b) => {
    if (b.kills !== a.kills) return b.kills - a.kills;
    if (b.gameWins !== a.gameWins) return b.gameWins - a.gameWins;
    return b.appearances - a.appearances;
  });

  return {
    seriesWins,
    gameWins,
    totalKills,
    objectivePoints,
    mvp: playerSummaries[0],
    playerSummaries,
  };
}

function readTeamOneGameStats(game: Game) {
  if (!game.score) return { kills: 0, points: 0, playerKills: {} as Record<string, number> };

  if ('team1PlayerKills' in game.score) {
    return {
      kills: game.score.team1TotalKills,
      points: 0,
      playerKills: game.score.team1PlayerKills,
    };
  }

  if ('team1Rounds' in game.score) {
    return {
      kills: 0,
      points: game.score.team1Rounds,
      playerKills: {},
    };
  }

  if ('team1Score' in game.score) {
    return {
      kills: 0,
      points: game.score.team1Score,
      playerKills: {},
    };
  }

  return { kills: 0, points: 0, playerKills: {} as Record<string, number> };
}

function readTeamTwoGameStats(game: Game) {
  if (!game.score) return { kills: 0, points: 0, playerKills: {} as Record<string, number> };

  if ('team2PlayerKills' in game.score) {
    return {
      kills: game.score.team2TotalKills,
      points: 0,
      playerKills: game.score.team2PlayerKills,
    };
  }

  if ('team2Rounds' in game.score) {
    return {
      kills: 0,
      points: game.score.team2Rounds,
      playerKills: {},
    };
  }

  if ('team2Score' in game.score) {
    return {
      kills: 0,
      points: game.score.team2Score,
      playerKills: {},
    };
  }

  return { kills: 0, points: 0, playerKills: {} as Record<string, number> };
}

function HeroChip({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function StatTile({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[22px] border p-4 ${
        highlight
          ? 'border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
          : 'border-white/10 bg-black/10'
      }`}
    >
      <div className={`text-xs font-semibold uppercase tracking-[0.16em] ${highlight ? 'text-cyan-100/85' : 'text-white/50'}`}>
        {label}
      </div>
      <div className={`mt-2 font-bold ${highlight ? 'text-4xl text-white' : 'text-3xl text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function MiniMatchCard({ match, championId }: { match: Match; championId?: string }) {
  const team1Score = match.seriesScore?.team1 ?? 0;
  const team2Score = match.seriesScore?.team2 ?? 0;
  const hasGames = Boolean(match.games && match.games.length > 0);
  const winnerTeam = match.winner;
  const loserTeam =
    winnerTeam?.id === match.team1?.id
      ? match.team2
      : winnerTeam?.id === match.team2?.id
      ? match.team1
      : undefined;
  const winnerIsChampion = winnerTeam?.id === championId;

  return (
    <div
      className={`rounded-[18px] border p-4 ${
        match.roundIndex === 0
          ? 'border-white/10 bg-slate-950/28'
          : 'border-cyan-300/18 bg-[linear-gradient(180deg,rgba(34,211,238,0.08)_0%,rgba(2,6,23,0.34)_100%)] shadow-[0_0_22px_rgba(34,211,238,0.10)]'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">
          Match {match.matchIndex + 1}
        </div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/36">
          {hasGames ? `${match.games?.length ?? 0} game` : winnerTeam ? 'Serie completata' : 'In attesa'}
        </div>
      </div>

      <div className="flex flex-wrap items-stretch gap-3">
        <div
          className={`min-w-[220px] flex-1 rounded-[16px] border px-4 py-3 ${
            winnerIsChampion
              ? 'border-cyan-300/30 bg-cyan-300/12 shadow-[0_0_20px_rgba(34,211,238,0.14)]'
              : 'border-white/10 bg-white/[0.05]'
          }`}
        >
          <div className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/70">Vincitore</div>
          <div className="mt-1 text-xl font-bold text-white">
            {winnerTeam?.name ?? match.team1?.name ?? match.team2?.name ?? 'TBD'}
          </div>
          {winnerTeam && (
            <div className="mt-1 text-sm text-white/70">
              {winnerTeam.players.map((player) => player.name).join(', ')}
            </div>
          )}
        </div>

        <div className="min-w-[190px] shrink-0 rounded-[16px] border border-white/10 bg-black/16 px-5 py-4 text-center">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Risultato finale</div>
          <div className="mt-2 text-3xl font-bold text-white">
            {team1Score} <span className="mx-2 text-white/35">-</span> {team2Score}
          </div>
          <div className="mt-1 text-xs text-white/55">
            {(match.team1?.name ?? 'Team 1')} vs {(match.team2?.name ?? 'Team 2')}
          </div>
        </div>

        <div className="min-w-[220px] flex-1 rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">Avversario</div>
          <div className="mt-1 text-lg font-semibold text-white/86">
            {loserTeam?.name ?? (winnerTeam ? 'Bye' : match.team2?.name ?? match.team1?.name ?? 'TBD')}
          </div>
          {loserTeam && (
            <div className="mt-1 text-sm text-white/58">
              {loserTeam.players.map((player) => player.name).join(', ')}
            </div>
          )}
        </div>
      </div>

      {hasGames && (
        <div className="mt-4 rounded-[16px] border border-white/8 bg-black/12 p-4">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/48">
            Dettaglio game
          </div>
          <div className="space-y-2">
            {match.games?.map((game) => {
              const modeLabel = getGameModeDisplay(game.mode);
              const mapLabel = game.map?.trim() ? game.map : null;
              const scoreLabel = formatGameScore(game);

              return (
                <div
                  key={game.gameNumber}
                  className="grid gap-2 rounded-[14px] border border-white/8 bg-white/[0.03] px-3 py-3 text-sm md:grid-cols-[auto_1fr_auto]"
                >
                  <div className="font-semibold text-white/90">Game {game.gameNumber}</div>
                  <div className="min-w-0 text-white/68">
                    <span>{modeLabel}</span>
                    {mapLabel && <span className="mx-2 text-white/28">•</span>}
                    {mapLabel && <span>{mapLabel}</span>}
                  </div>
                  <div className="font-semibold text-cyan-100">{scoreLabel}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function formatGameScore(game: Game): string {
  if (!game.score) return '-';

  if ('team1PlayerKills' in game.score) {
    return `${game.score.team1TotalKills}-${game.score.team2TotalKills}`;
  }

  if ('team1Rounds' in game.score) {
    return `${game.score.team1Rounds}-${game.score.team2Rounds}`;
  }

  if ('team1Score' in game.score) {
    return `${game.score.team1Score}-${game.score.team2Score}`;
  }

  return '-';
}

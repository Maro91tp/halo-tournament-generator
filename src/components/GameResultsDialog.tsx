import { useEffect, useState } from 'react';
import { AlertTriangle, Crown, Minus, Plus } from 'lucide-react';
import type {
  Game,
  Match,
  MatchDuration,
  ObjectiveGameScore,
  OddballGameScore,
  SlayerGameScore,
  Team,
  TournamentConfig,
} from '../types/tournament';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { generateGamesForMatch, getGameModeDisplay } from '../lib/tournament-utils';
import { ModeIcon } from './TournamentIcons';

interface GameResultsDialogProps {
  open: boolean;
  match: Match | null;
  matchDuration: MatchDuration;
  config: TournamentConfig;
  onClose: () => void;
  onSubmit: (matchId: string, winnerId: string, games: Game[]) => void;
}

export default function GameResultsDialog({
  open,
  match,
  matchDuration,
  config,
  onClose,
  onSubmit,
}: GameResultsDialogProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState('');
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const killLimit = config.killLimit ?? 50;

  useEffect(() => {
    if (!open || !match) return;

    setError('');
    setCurrentGameIndex(0);

    if (match.games && match.games.length > 0) {
      setGames(match.games.map(cloneGame));
      return;
    }

    const gamesToCreate = matchDuration === 'single' ? 1 : matchDuration === 'bo3' ? 3 : 5;
    const generatedGames = generateGamesForMatch(config, match.roundIndex, gamesToCreate);

    const initialGames = generatedGames.map((game) => {
      if (game.mode === 'slayer') {
        const score: SlayerGameScore = {
          team1PlayerKills: {},
          team2PlayerKills: {},
          team1TotalKills: 0,
          team2TotalKills: 0,
        };

        match.team1?.players.forEach((player) => {
          score.team1PlayerKills[player.id] = 0;
        });

        match.team2?.players.forEach((player) => {
          score.team2PlayerKills[player.id] = 0;
        });

        return { ...game, score };
      }

      if (game.mode === 'ctf' || game.mode === 'koth') {
        return {
          ...game,
          score: {
            team1Score: 0,
            team2Score: 0,
          } satisfies ObjectiveGameScore,
        };
      }

      if (game.mode === 'oddball') {
        return {
          ...game,
          score: {
            team1Score: 0,
            team2Score: 0,
          } as ObjectiveGameScore,
        };
      }

      return game;
    });

    setGames(initialGames.map(cloneGame));
  }, [open, match, matchDuration, config]);

  if (!match || !match.team1 || !match.team2) return null;

  const updateSlayerKills = (
    gameIndex: number,
    teamKey: 'team1PlayerKills' | 'team2PlayerKills',
    playerId: string,
    value: number
  ) => {
    setGames((currentGames) => {
      const nextGames = [...currentGames];
      const game = cloneGame(nextGames[gameIndex]);
      nextGames[gameIndex] = game;
      const existingScore = (game.score as SlayerGameScore | undefined) ?? {
        team1PlayerKills: {},
        team2PlayerKills: {},
        team1TotalKills: 0,
        team2TotalKills: 0,
      };

      const score: SlayerGameScore = {
        team1PlayerKills: { ...existingScore.team1PlayerKills },
        team2PlayerKills: { ...existingScore.team2PlayerKills },
        team1TotalKills: 0,
        team2TotalKills: 0,
      };

      const teamKills = score[teamKey];
      const otherPlayersTotal = Object.entries(teamKills).reduce(
        (sum, [currentPlayerId, kills]) => sum + (currentPlayerId === playerId ? 0 : (kills || 0)),
        0
      );
      const maxAllowedKills = Math.max(0, killLimit - otherPlayersTotal);

      teamKills[playerId] = Math.min(maxAllowedKills, Math.max(0, value));
      score.team1TotalKills = Object.values(score.team1PlayerKills).reduce((sum, kills) => sum + (kills || 0), 0);
      score.team2TotalKills = Object.values(score.team2PlayerKills).reduce((sum, kills) => sum + (kills || 0), 0);

      game.score = score;
      game.winner = undefined;

      return nextGames;
    });

    setError('');
  };

  const updateObjectiveScore = (
    gameIndex: number,
    teamKey: 'team1Score' | 'team2Score',
    value: number
  ) => {
    setGames((currentGames) => {
      const nextGames = [...currentGames];
      const game = cloneGame(nextGames[gameIndex]);
      nextGames[gameIndex] = game;
      const currentScore = (game.score as ObjectiveGameScore | undefined) ?? { team1Score: 0, team2Score: 0 };

      game.score = {
        ...currentScore,
        [teamKey]: Math.max(0, value),
      };
      game.winner = undefined;

      return nextGames;
    });

    setError('');
  };

  const updateOddballScore = (
    gameIndex: number,
    teamKey: 'team1Rounds' | 'team2Rounds',
    value: number
  ) => {
    setGames((currentGames) => {
      const nextGames = [...currentGames];
      const game = cloneGame(nextGames[gameIndex]);
      const currentScore = (game.score as OddballGameScore | undefined) ?? { team1Rounds: 0, team2Rounds: 0 };

      game.score = {
        ...currentScore,
        [teamKey]: Math.min(2, Math.max(0, value)),
      };
      game.winner = undefined;
      nextGames[gameIndex] = game;
      return nextGames;
    });

    setError('');
  };

  const confirmGameResult = (gameIndex: number) => {
    const game = games[gameIndex];

    if (game.mode === 'slayer') {
      const score = game.score as SlayerGameScore | undefined;
      const team1Total = score?.team1TotalKills ?? 0;
      const team2Total = score?.team2TotalKills ?? 0;

      if (team1Total === team2Total) {
        setError(`Game ${game.gameNumber}: il punteggio non puo essere in parita.`);
        return;
      }

      if (team1Total < killLimit && team2Total < killLimit) {
        setError(`Game ${game.gameNumber}: una squadra deve raggiungere almeno ${killLimit} kill.`);
        return;
      }

      setGames((currentGames) => {
        const nextGames = [...currentGames];
        const gameToUpdate = cloneGame(nextGames[gameIndex]);
        gameToUpdate.winner = team1Total > team2Total ? 1 : 2;
        nextGames[gameIndex] = gameToUpdate;
        return nextGames;
      });
      setError('');
      setCurrentGameIndex((current) => Math.min(current + 1, games.length - 1));
      return;
    }

    if (game.mode === 'oddball') {
      const score = game.score as OddballGameScore | undefined;

      const team1Rounds = score?.team1Rounds ?? 0;
      const team2Rounds = score?.team2Rounds ?? 0;

      if (team1Rounds === team2Rounds) {
        setError(`Game ${game.gameNumber}: il punteggio non puo essere in parita.`);
        return;
      }

      if (team1Rounds < 2 && team2Rounds < 2) {
        setError(`Game ${game.gameNumber}: una squadra deve vincere almeno 2 round su 3.`);
        return;
      }

      setGames((currentGames) => {
        const nextGames = [...currentGames];
        const gameToUpdate = cloneGame(nextGames[gameIndex]);
        gameToUpdate.winner = team1Rounds > team2Rounds ? 1 : 2;
        nextGames[gameIndex] = gameToUpdate;
        return nextGames;
      });
      setError('');
      setCurrentGameIndex((current) => Math.min(current + 1, games.length - 1));
      return;
    }

    const score = game.score as ObjectiveGameScore | undefined;
    const team1Score = score?.team1Score ?? 0;
    const team2Score = score?.team2Score ?? 0;

    if (team1Score === team2Score) {
      setError(`Game ${game.gameNumber}: inserisci un punteggio valido senza parita.`);
      return;
    }

    setGames((currentGames) => {
      const nextGames = [...currentGames];
      const gameToUpdate = cloneGame(nextGames[gameIndex]);
      gameToUpdate.winner = team1Score > team2Score ? 1 : 2;
      nextGames[gameIndex] = gameToUpdate;
      return nextGames;
    });
    setError('');
    setCurrentGameIndex((current) => Math.min(current + 1, games.length - 1));
  };

  const requiredWins = matchDuration === 'single' ? 1 : matchDuration === 'bo3' ? 2 : 3;

  const calculateSeriesWinner = (): { winnerId: string; team1Wins: number; team2Wins: number } | null => {
    let team1Wins = 0;
    let team2Wins = 0;

    games.forEach((game) => {
      if (game.winner === 1) team1Wins++;
      if (game.winner === 2) team2Wins++;
    });

    if (team1Wins >= requiredWins) {
      return { winnerId: match.team1.id, team1Wins, team2Wins };
    }

    if (team2Wins >= requiredWins) {
      return { winnerId: match.team2.id, team1Wins, team2Wins };
    }

    return null;
  };

  const handleSubmit = () => {
    const result = calculateSeriesWinner();

    if (!result) {
      setError(`Una squadra deve vincere almeno ${requiredWins} game per chiudere la serie.`);
      return;
    }

    const playedGames = games.slice(0, result.team1Wins + result.team2Wins);
    const allConfirmed = playedGames.every((game) => game.winner !== undefined);

    if (!allConfirmed) {
      setError('Conferma i risultati dei game giocati prima di chiudere la serie.');
      return;
    }

    onSubmit(match.id, result.winnerId, playedGames);
  };

  const seriesResult = calculateSeriesWinner();
  const team1Wins = games.filter((game) => game.winner === 1).length;
  const team2Wins = games.filter((game) => game.winner === 2).length;
  const visibleGames = games.filter((game, index) => {
    if (matchDuration === 'single') return index === 0;
    if (matchDuration === 'bo3') return index < 3;
    return index < 5;
  });
  const safeGameIndex = Math.min(currentGameIndex, Math.max(visibleGames.length - 1, 0));
  const activeGame = visibleGames[safeGameIndex];
  const canGoBackGame = safeGameIndex > 0;
  const canGoForwardGame = safeGameIndex < visibleGames.length - 1 && !seriesResult;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!top-4 !w-[calc(100vw-1rem)] sm:!w-full sm:!max-w-[calc(100vw-1.5rem)] !translate-y-0 max-h-[calc(100vh-2rem)] overflow-y-auto border-cyan-300/55 bg-[linear-gradient(180deg,rgba(235,248,255,0.98)_0%,rgba(220,240,252,0.96)_100%)] p-4 sm:p-6 shadow-[0_20px_70px_rgba(20,140,220,0.22)]">
        <DialogHeader className="gap-3 pb-1">
          <DialogTitle className="flex items-center gap-2 text-slate-950">
            <ModeIcon mode={match.mode ?? 'slayer'} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
            <span>Risultati match</span>
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {match.team1.name} vs {match.team2.name}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-[24px] border border-cyan-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(243,251,255,0.78)_100%)] p-3 sm:rounded-[30px] sm:p-6 md:p-8 shadow-[0_16px_44px_rgba(70,170,240,0.14)] backdrop-blur-sm">
          <div className="mb-6 sm:mb-8">
            <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
              <TeamSideSummary team={match.team1} wins={team1Wins} align="right" />
              <div className="text-center">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Serie</div>
                <div className="mt-2 text-[clamp(2rem,1.5rem+3vw,4.5rem)] font-bold tracking-tight text-slate-950 drop-shadow-[0_3px_10px_rgba(255,255,255,0.45)] md:text-7xl">
                  {team1Wins} <span className="text-slate-400">-</span> {team2Wins}
                </div>
              </div>
              <TeamSideSummary team={match.team2} wins={team2Wins} align="left" />
            </div>
          </div>

          {activeGame && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-[22px] border border-cyan-100/80 bg-white/72 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-sm sm:tracking-[0.18em]">
                  Game {activeGame.gameNumber} di {visibleGames.length}
                </div>
                <div className="flex flex-wrap gap-2">
                  {visibleGames.map((game, index) => (
                    <button
                      key={game.gameNumber}
                      type="button"
                      onClick={() => setCurrentGameIndex(index)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition sm:px-3 sm:py-1.5 sm:text-xs ${
                        index === safeGameIndex
                          ? 'border-cyan-400/70 bg-cyan-200/35 text-slate-950 shadow-[0_0_16px_rgba(30,190,255,0.22)]'
                          : game.winner
                          ? 'border-cyan-300/80 bg-cyan-100/90 text-slate-800'
                          : 'border-cyan-100/80 bg-white/78 text-slate-600 hover:border-cyan-300/70 hover:text-slate-900'
                      }`}
                    >
                      Game {game.gameNumber}
                    </button>
                  ))}
                </div>
              </div>

              <GameSection
                game={activeGame}
                team1={match.team1}
                team2={match.team2}
                killLimit={killLimit}
                onAdjustSlayerKills={updateSlayerKills}
                onAdjustObjectiveScore={updateObjectiveScore}
                onAdjustOddballScore={updateOddballScore}
                onConfirmResult={confirmGameResult}
                gameIndex={safeGameIndex}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentGameIndex((current) => Math.max(current - 1, 0))}
                  disabled={!canGoBackGame}
                  className="w-full text-slate-700 hover:bg-cyan-100/70 hover:text-slate-950 sm:w-auto"
                >
                  Indietro
                </Button>

                <div className="text-center text-[clamp(0.8rem,0.76rem+0.18vw,0.94rem)] text-slate-600 sm:text-left">
                  {seriesResult
                    ? 'Serie completata, puoi confermare il risultato finale.'
                    : `Servono ancora ${requiredWins - Math.max(team1Wins, team2Wins)} vittorie per chiudere la serie.`}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentGameIndex((current) => Math.min(current + 1, visibleGames.length - 1))}
                  disabled={!canGoForwardGame}
                  className="w-full text-slate-700 hover:bg-cyan-100/70 hover:text-slate-950 sm:w-auto"
                >
                  Avanti
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-red-300 bg-red-50 px-4 py-3 text-[clamp(0.8rem,0.76rem+0.18vw,0.94rem)] text-red-700 shadow-sm">
              <AlertTriangle className="mt-0.5 h-[15px] w-[15px] shrink-0 sm:h-4 sm:w-4" />
              <span>{error}</span>
            </div>
          )}

          {seriesResult && (
            <div className="mt-6 rounded-[20px] border border-primary/25 bg-[linear-gradient(180deg,rgba(120,190,255,0.18)_0%,rgba(100,180,255,0.08)_100%)] px-4 py-3 text-center shadow-[0_0_24px_rgba(100,180,255,0.12)] sm:rounded-[24px] sm:px-5 sm:py-4">
              <div className="mb-1 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 sm:text-xs sm:tracking-[0.18em]">
                <Crown className="h-4 w-4 text-primary" />
                <span>Vincitore serie</span>
              </div>
              <div className="text-[clamp(1rem,0.94rem+0.38vw,1.2rem)] font-bold text-slate-950 sm:text-xl">
                {seriesResult.winnerId === match.team1.id ? match.team1.name : match.team2.name}
              </div>
              <div className="mt-1 text-xs text-slate-600 sm:text-sm">
                {seriesResult.team1Wins} - {seriesResult.team2Wins}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2 flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={onClose} className="text-slate-700 hover:bg-slate-900/6 hover:text-slate-950">
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!seriesResult}
            size="lg"
            className="w-full shadow-[0_0_28px_rgba(30,190,255,0.26)] hover:shadow-[0_0_34px_rgba(30,190,255,0.34)] sm:w-auto"
          >
            Conferma risultati serie
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeamSideSummary({
  team,
  wins,
  align,
}: {
  team: Team;
  wins: number;
  align: 'left' | 'right';
}) {
  return (
    <div className={align === 'right' ? 'space-y-1 text-center md:text-right' : 'space-y-1 text-center md:text-left'}>
      <div className="text-lg font-semibold text-slate-950 sm:text-xl">{team.name}</div>
      <div className="text-xs text-slate-600 break-words sm:text-sm">{team.players.map((player) => player.name).join(', ')}</div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{wins} game vinti</div>
    </div>
  );
}

function cloneGame(game: Game): Game {
  return {
    ...game,
    score: game.score
      ? typeof game.score === 'object'
        ? JSON.parse(JSON.stringify(game.score))
        : game.score
      : undefined,
  };
}

interface GameSectionProps {
  game: Game;
  gameIndex: number;
  team1: Team;
  team2: Team;
  killLimit: number;
  onAdjustSlayerKills: (
    gameIndex: number,
    teamKey: 'team1PlayerKills' | 'team2PlayerKills',
    playerId: string,
    value: number
  ) => void;
  onAdjustObjectiveScore: (gameIndex: number, teamKey: 'team1Score' | 'team2Score', value: number) => void;
  onAdjustOddballScore: (
    gameIndex: number,
    teamKey: 'team1Rounds' | 'team2Rounds',
    value: number
  ) => void;
  onConfirmResult: (gameIndex: number) => void;
}

function GameSection({
  game,
  gameIndex,
  team1,
  team2,
  killLimit,
  onAdjustSlayerKills,
  onAdjustObjectiveScore,
  onAdjustOddballScore,
  onConfirmResult,
}: GameSectionProps) {
  const slayerScore = game.mode === 'slayer' ? (game.score as SlayerGameScore | undefined) : undefined;
  const objectiveScore =
    game.mode === 'ctf' || game.mode === 'koth' ? (game.score as ObjectiveGameScore | undefined) : undefined;
  const oddballRounds = game.mode === 'oddball' ? (game.score as OddballGameScore | undefined) : undefined;

  const team1Current =
    game.mode === 'slayer'
      ? slayerScore?.team1TotalKills ?? 0
      : game.mode === 'oddball'
      ? oddballRounds?.team1Rounds ?? 0
      : objectiveScore?.team1Score ?? 0;

  const team2Current =
    game.mode === 'slayer'
      ? slayerScore?.team2TotalKills ?? 0
      : game.mode === 'oddball'
      ? oddballRounds?.team2Rounds ?? 0
      : objectiveScore?.team2Score ?? 0;

  const leader =
    team1Current === team2Current ? undefined : team1Current > team2Current ? 1 : 2;
  const team1Progress = game.mode === 'slayer' ? Math.min(100, Math.round((team1Current / killLimit) * 100)) : undefined;
  const team2Progress = game.mode === 'slayer' ? Math.min(100, Math.round((team2Current / killLimit) * 100)) : undefined;

  return (
    <section className="rounded-[22px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(239,247,255,0.76)_100%)] p-3 sm:rounded-[28px] sm:p-5 md:p-6 shadow-[0_10px_32px_rgba(90,150,220,0.08)]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-sm sm:tracking-[0.18em]">Game {game.gameNumber}</div>
          <div className="inline-flex flex-wrap items-center gap-1.5 rounded-[16px] border border-cyan-200/70 bg-[linear-gradient(180deg,rgba(235,250,255,0.96)_0%,rgba(222,245,255,0.88)_100%)] px-2.5 py-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-800 shadow-[0_8px_20px_rgba(30,190,255,0.10)] sm:gap-2 sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-base sm:tracking-[0.12em] md:text-lg">
            <ModeIcon mode={game.mode} className="h-4 w-4" />
            <span>{getGameModeDisplay(game.mode)}</span>
            {game.mode === 'slayer' && <span>• Limite: {killLimit}</span>}
            <span>• {game.map}</span>
          </div>
          <div className="hidden mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {getGameModeDisplay(game.mode)} {game.mode === 'slayer' ? `• Limite: ${killLimit}` : ''} • {game.map}
          </div>
        </div>
        {game.winner && (
          <div className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-800">
            Confermato
          </div>
        )}
      </div>

      <div className="mb-6 grid items-center gap-4 md:mb-7 md:grid-cols-[1fr_auto_1fr]">
        <div />
        <div className="text-center">
          {game.mode === 'slayer' && (
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Obiettivo kill
            </div>
          )}
          <div className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
            {team1Current}
            {game.mode === 'slayer' && <span className="text-lg text-slate-400 sm:text-2xl md:text-3xl">/{killLimit}</span>}
            <span className="mx-3 text-slate-400">-</span>
            {team2Current}
            {game.mode === 'slayer' && <span className="text-lg text-slate-400 sm:text-2xl md:text-3xl">/{killLimit}</span>}
          </div>
          {game.mode === 'slayer' && (
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/80">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.95)_0%,rgba(59,130,246,0.95)_100%)] transition-all"
                style={{ width: `${Math.max(team1Progress ?? 0, team2Progress ?? 0)}%` }}
              />
            </div>
          )}
        </div>
        <div />
      </div>

      {game.mode === 'slayer' && slayerScore && (
        <div className="grid gap-5 md:grid-cols-2">
          <TeamEditor
            team={team1}
            values={slayerScore.team1PlayerKills}
            total={slayerScore.team1TotalKills}
            isLeading={leader === 1}
            target={killLimit}
            progress={team1Progress ?? 0}
            onChange={(playerId, nextValue) =>
              onAdjustSlayerKills(gameIndex, 'team1PlayerKills', playerId, nextValue)
            }
          />
          <TeamEditor
            team={team2}
            values={slayerScore.team2PlayerKills}
            total={slayerScore.team2TotalKills}
            isLeading={leader === 2}
            target={killLimit}
            progress={team2Progress ?? 0}
            onChange={(playerId, nextValue) =>
              onAdjustSlayerKills(gameIndex, 'team2PlayerKills', playerId, nextValue)
            }
          />
        </div>
      )}

      {(game.mode === 'ctf' || game.mode === 'koth') && (
        <div className="grid gap-5 md:grid-cols-2">
          <ObjectiveEditor
            team={team1}
            value={objectiveScore?.team1Score ?? 0}
            label={game.mode === 'ctf' ? 'Bandiere' : 'Punti'}
            isLeading={leader === 1}
            onChange={(nextValue) => onAdjustObjectiveScore(gameIndex, 'team1Score', nextValue)}
          />
          <ObjectiveEditor
            team={team2}
            value={objectiveScore?.team2Score ?? 0}
            label={game.mode === 'ctf' ? 'Bandiere' : 'Punti'}
            isLeading={leader === 2}
            onChange={(nextValue) => onAdjustObjectiveScore(gameIndex, 'team2Score', nextValue)}
          />
        </div>
      )}

      {game.mode === 'oddball' && (
        <div className="grid gap-5 md:grid-cols-2">
          <ObjectiveEditor
            team={team1}
            value={oddballRounds?.team1Rounds ?? 0}
            label="Round vinti"
            isLeading={leader === 1}
            max={2}
            onChange={(nextValue) => onAdjustOddballScore(gameIndex, 'team1Rounds', nextValue)}
          />
          <ObjectiveEditor
            team={team2}
            value={oddballRounds?.team2Rounds ?? 0}
            label="Round vinti"
            isLeading={leader === 2}
            max={2}
            onChange={(nextValue) => onAdjustOddballScore(gameIndex, 'team2Rounds', nextValue)}
          />
        </div>
      )}

      <div className="mt-7 flex justify-center">
        <Button
          onClick={() => onConfirmResult(gameIndex)}
          size="lg"
          className="w-full justify-center text-base shadow-[0_0_30px_rgba(100,180,255,0.28)] sm:min-w-[300px] sm:w-auto"
        >
            Conferma risultato
          </Button>
      </div>
    </section>
  );
}

function TeamEditor({
  team,
  values,
  total,
  isLeading,
  target,
  progress,
  onChange,
}: {
  team: Team;
  values: Record<string, number>;
  total: number;
  isLeading: boolean;
  target: number;
  progress: number;
  onChange: (playerId: string, nextValue: number) => void;
}) {
  const isHot = progress >= 70;
  const isMatchPoint = progress >= 90 || target - total <= 5;

  return (
    <div
      className={`rounded-[18px] border p-3 sm:rounded-[22px] sm:p-4 ${
        isLeading
          ? 'border-cyan-400/55 bg-[linear-gradient(180deg,rgba(95,220,255,0.18)_0%,rgba(95,220,255,0.08)_100%)]'
          : 'border-cyan-100/80 bg-white/72'
      }`}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="text-sm font-semibold text-slate-950 sm:text-base">{team.name}</div>
        <div className="text-left sm:text-right">
          <div className="text-xl font-bold text-slate-950 sm:text-2xl">
            {total}
            <span className="ml-1 text-sm font-semibold text-slate-400">/ {target}</span>
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Kill</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80">
          <div
            className={`h-full rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.95)_0%,rgba(59,130,246,0.95)_100%)] transition-all ${
              isHot ? 'shadow-[0_0_18px_rgba(34,211,238,0.35)]' : ''
            } ${isMatchPoint ? 'shadow-[0_0_24px_rgba(34,211,238,0.48)] brightness-110' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {team.players.map((player) => (
          <div
            key={player.id}
            className="grid gap-4 rounded-[18px] border border-cyan-100/80 bg-white px-4 py-3.5 shadow-sm transition hover:border-cyan-300/80 hover:shadow-[0_8px_18px_rgba(30,190,255,0.14)] sm:grid-cols-[minmax(160px,1fr)_auto] sm:items-center"
          >
            <div className="min-w-0 pr-2">
              <div className="text-sm font-semibold leading-tight text-slate-950 sm:text-base">{player.name}</div>
            </div>
            <div className="flex justify-start sm:justify-end">
              <Stepper
                value={values[player.id] ?? 0}
                max={Math.max(0, target - (total - (values[player.id] ?? 0)))}
                compact
                onChange={(nextValue) => onChange(player.id, nextValue)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectiveEditor({
  team,
  value,
  label,
  isLeading,
  max,
  onChange,
}: {
  team: Team;
  value: number;
  label: string;
  isLeading: boolean;
  max?: number;
  onChange: (nextValue: number) => void;
}) {
  return (
    <div
      className={`rounded-[18px] border p-4 sm:rounded-[22px] sm:p-5 ${
        isLeading
          ? 'border-cyan-400/55 bg-[linear-gradient(180deg,rgba(95,220,255,0.18)_0%,rgba(95,220,255,0.08)_100%)]'
          : 'border-cyan-100/80 bg-white/72'
      }`}
    >
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-950 sm:text-base">{team.name}</div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      </div>
      <div className="flex justify-center">
        <Stepper value={value} onChange={onChange} large max={max} />
      </div>
    </div>
  );
}

function Stepper({
  value,
  onChange,
  large = false,
  compact = false,
  min = 0,
  max,
}: {
  value: number;
  onChange: (nextValue: number) => void;
  large?: boolean;
  compact?: boolean;
  min?: number;
  max?: number;
}) {
  const clampValue = (nextValue: number) => {
    const lowerBound = Math.max(min, nextValue);
    return max !== undefined ? Math.min(max, lowerBound) : lowerBound;
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border border-cyan-300/80 bg-[linear-gradient(180deg,#ffffff_0%,#e9fbff_100%)] shadow-[0_10px_24px_rgba(30,190,255,0.14)] ${
        large ? 'px-1.5 py-1.5 sm:px-2 sm:py-2' : compact ? 'px-1 py-1' : 'px-1 py-1 sm:px-1.5 sm:py-1.5'
      }`}
    >
      <StepperButton onClick={() => onChange(clampValue(value - 1))} ariaLabel="Diminuisci valore">
        <Minus className={large ? 'h-4 w-4' : compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </StepperButton>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clampValue(Number.parseInt(e.target.value || '0', 10) || 0))}
        className={`bg-transparent text-center font-bold text-slate-950 outline-none ${
          large ? 'w-12 text-xl sm:w-16 sm:text-2xl' : compact ? 'w-9 text-sm sm:w-10 sm:text-base' : 'w-12 text-base sm:w-16 sm:text-lg'
        }`}
      />
      <StepperButton onClick={() => onChange(clampValue(value + 1))} ariaLabel="Aumenta valore">
        <Plus className={large ? 'h-4 w-4' : compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </StepperButton>
    </div>
  );
}

function StepperButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/80 bg-[linear-gradient(180deg,#f4fdff_0%,#dff7ff_100%)] text-slate-800 transition hover:border-cyan-400 hover:bg-white hover:text-slate-950 hover:shadow-[0_0_18px_rgba(30,190,255,0.24)] focus-visible:border-cyan-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/25 sm:h-8 sm:w-8"
    >
      {children}
    </button>
  );
}

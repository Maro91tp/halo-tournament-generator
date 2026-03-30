import { X } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import type { Tournament, Game, Match } from '../types/tournament';
import { getGameModeDisplay, getMatchDurationDisplay } from '../lib/tournament-utils';
import { useLanguage } from './LanguageContext';

interface BracketPrintViewProps {
  open: boolean;
  onClose: () => void;
  tournament: Tournament;
}

export default function BracketPrintView({ open, onClose, tournament }: BracketPrintViewProps) {
  const language = useLanguage();
  const copy = language === 'en'
    ? {
        winner: 'TOURNAMENT WINNER',
        map: 'MAP',
        mode: 'MODE',
        autoAdvance: 'Advances automatically (bye)',
        gameDetails: 'Game details',
        generatedWith: 'Generated with Halo Tournament Generator',
        printHint: 'Use Cmd/Ctrl + P to print or capture a screenshot',
        slayer: 'Slayer',
        ranked: 'Ranked',
      }
    : {
        winner: 'VINCITORE DEL TORNEO',
        map: 'MAPPA',
        mode: 'MODALITA',
        autoAdvance: 'Avanza automaticamente (bye)',
        gameDetails: 'Dettagli game',
        generatedWith: 'Generato con Halo Tournament Generator',
        printHint: 'Usa Cmd/Ctrl + P per stampare o catturare uno screenshot',
        slayer: 'Slayer',
        ranked: 'Ranked',
      };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] max-w-[95vw] overflow-auto p-0">
        <div className="bg-white p-8 text-black" id="bracket-print-view">
          <div className="mb-8 border-b-2 border-black pb-6 text-center">
            <h1 className="mb-2 text-4xl font-bold">HALO TOURNAMENT</h1>
            <p className="text-lg text-gray-600">
              {tournament.config.type === 'slayer' ? copy.slayer : copy.ranked} - {tournament.config.teamMode} -{' '}
              {getMatchDurationDisplay(tournament.config.matchDuration, language)}
            </p>
          </div>

          {tournament.winner && (
            <div className="mb-8 rounded-lg bg-black p-6 text-center text-white">
              <div className="mb-2 text-2xl font-bold">{copy.winner}</div>
              <div className="text-3xl font-bold">{tournament.winner.name}</div>
              <div className="mt-2 text-lg">{tournament.winner.players.map((player) => player.name).join(', ')}</div>
            </div>
          )}

          <div className="flex gap-8 overflow-x-auto">
            {tournament.rounds.map((round) => (
              <div key={round.index} className="flex-shrink-0" style={{ minWidth: '320px' }}>
                <div className="mb-4 rounded-lg border-2 border-black bg-gray-100 p-4">
                  <h3 className="mb-2 text-xl font-bold">{round.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div>{copy.map}: <strong>{round.map}</strong></div>
                    {tournament.config.type === 'ranked' && round.mode && (
                      <div>{copy.mode}: <strong>{getGameModeDisplay(round.mode, language)}</strong></div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {round.matches.map((match) => {
                    const isBye = match.team1 && !match.team2;

                    return (
                      <div
                        key={match.id}
                        className={`rounded-lg border-2 border-black p-4 ${isBye ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        {isBye ? (
                          <div className="py-2 text-center">
                            <div className="text-lg font-bold">{match.team1!.name}</div>
                            <div className="mt-1 text-sm text-gray-600">{copy.autoAdvance}</div>
                          </div>
                        ) : (
                          <>
                            <PrintTeamRow
                              team={match.team1?.name || 'TBD'}
                              players={match.team1?.players.map((player) => player.name).join(', ')}
                              score={getDisplaySeriesScore(match).team1}
                              isWinner={match.winner?.id === match.team1?.id}
                              dimmed={!!match.winner && match.winner?.id !== match.team1?.id}
                            />

                            <div className="my-1 text-center text-sm font-bold text-gray-500">VS</div>

                            <PrintTeamRow
                              team={match.team2?.name || 'TBD'}
                              players={match.team2?.players.map((player) => player.name).join(', ')}
                              score={getDisplaySeriesScore(match).team2}
                              isWinner={match.winner?.id === match.team2?.id}
                              dimmed={!!match.winner && match.winner?.id !== match.team2?.id}
                            />

                            {match.games && match.games.length > 0 && match.winner && (
                              <div className="mt-3 border-t-2 border-gray-300 pt-3">
                                <div className="mb-2 text-xs font-semibold text-gray-700">{copy.gameDetails}</div>
                                <div className="space-y-2">
                                  {match.games.map((game) => (
                                    <div key={game.gameNumber} className="rounded bg-gray-50 px-2 py-2">
                                      <div className="mb-1 flex items-center justify-between text-xs">
                                        <span className="font-semibold text-gray-600">
                                          Game {game.gameNumber}: {getGameModeDisplay(game.mode, language)}
                                        </span>
                                        <span className="font-bold">{formatGameScorePrint(game, match)}</span>
                                      </div>

                                      {game.mode === 'slayer' && game.score && (
                                        <div className="mt-1 grid grid-cols-2 gap-3 border-t border-gray-300 pt-1 text-[10px]">
                                          <div>
                                            <div className="mb-1 font-semibold text-gray-700">{match.team1?.name}</div>
                                            {match.team1?.players.map((player) => {
                                              const kills = (game.score as any)?.team1PlayerKills?.[player.id] || 0;
                                              return (
                                                <div key={player.id} className="flex justify-between">
                                                  <span className="text-gray-600">{player.name}</span>
                                                  <span className="font-semibold">{kills} kill</span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                          <div>
                                            <div className="mb-1 font-semibold text-gray-700">{match.team2?.name}</div>
                                            {match.team2?.players.map((player) => {
                                              const kills = (game.score as any)?.team2PlayerKills?.[player.id] || 0;
                                              return (
                                                <div key={player.id} className="flex justify-between">
                                                  <span className="text-gray-600">{player.name}</span>
                                                  <span className="font-semibold">{kills} kill</span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t-2 border-black pt-6 text-center text-sm text-gray-600">
            <p>{copy.generatedWith} - {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'it-IT')}</p>
          </div>
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          size="icon"
          className="absolute right-4 top-4 bg-white hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black px-4 py-2 text-sm text-white">
          {copy.printHint}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getDisplaySeriesScore(match: Match) {
  if (match.seriesScore) {
    return {
      team1: match.seriesScore.team1,
      team2: match.seriesScore.team2,
    };
  }

  if (match.winner?.id === match.team1?.id) {
    return { team1: 1, team2: 0 };
  }

  if (match.winner?.id === match.team2?.id) {
    return { team1: 0, team2: 1 };
  }

  return { team1: 0, team2: 0 };
}
function PrintTeamRow({
  team,
  players,
  score,
  isWinner,
  dimmed,
}: {
  team: string;
  players?: string;
  score?: number;
  isWinner: boolean;
  dimmed: boolean;
}) {
  return (
    <div
      className={`mb-2 rounded border-2 p-3 ${
        isWinner ? 'border-green-500 bg-green-100' : dimmed ? 'border-gray-300 bg-gray-100' : 'border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold">{team}</div>
          {players && <div className="text-xs text-gray-600">{players}</div>}
        </div>
        <div className="flex items-center gap-2">
          {score !== undefined && <span className="text-2xl font-bold">{score}</span>}
          {isWinner && <span className="text-sm font-bold uppercase tracking-[0.16em] text-green-700">Win</span>}
        </div>
      </div>
    </div>
  );
}

function formatGameScorePrint(game: Game, match: Match): string {
  if (game.mode === 'slayer') {
    const score = game.score as any;
    if (score?.team1TotalKills !== undefined && score?.team2TotalKills !== undefined) {
      return `${score.team1TotalKills}-${score.team2TotalKills}`;
    }
  } else if (game.mode === 'ctf' || game.mode === 'koth') {
    const score = game.score as any;
    if (score?.team1Score !== undefined && score?.team2Score !== undefined) {
      return `${score.team1Score}-${score.team2Score}`;
    }
  } else if (game.mode === 'oddball') {
    const score = game.score as any;
    if (score?.winnerTeamIndex) {
      const winnerName = score.winnerTeamIndex === 1 ? match.team1?.name : match.team2?.name;
      return `Vinto da ${winnerName}`;
    }
  }

  return game.winner ? (game.winner === 1 ? match.team1?.name || 'Team 1' : match.team2?.name || 'Team 2') : '-';
}

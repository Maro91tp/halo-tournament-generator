import { createElement, isValidElement, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crown,
  MapPinned,
  PlayCircle,
  RefreshCcw,
  Swords,
  TimerReset,
  Trophy,
} from 'lucide-react';
import type { Tournament, Match, Team, SeriesScore, Game } from '../types/tournament';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { getGameModeDisplay, getMatchDurationDisplay } from '../lib/tournament-utils';
import { cn } from '@/lib/utils';
import GameResultsDialog from './GameResultsDialog';
import { ModeIcon } from './TournamentIcons';
import TournamentVictoryScreen from './TournamentVictoryScreen';

interface TournamentBracketProps {
  tournament: Tournament;
  onMatchResult: (matchId: string, winnerId: string, seriesScore?: SeriesScore, games?: Game[]) => void;
  onReplay: () => void;
  onReset: () => void;
  onBack: () => void;
}

export default function TournamentBracket({
  tournament,
  onMatchResult,
  onReplay,
  onReset,
  onBack,
}: TournamentBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const allMatches = useMemo(
    () => tournament.rounds.flatMap((round) => round.matches),
    [tournament.rounds]
  );
  const completedMatches = allMatches.filter((match) => !!match.winner).length;
  const totalMatches = allMatches.length;
  const playableMatches = allMatches.filter((match) => match.team1 && match.team2 && !match.winner);
  const nextPlayableMatch = playableMatches[0];
  const completionPercent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  const handleMatchClick = (match: Match) => {
    if (match.team1 && match.team2 && !match.winner) {
      setSelectedMatch(match);
    }
  };

  const handleGameResultsSubmit = (matchId: string, winnerId: string, games: Game[]) => {
    const team1Wins = games.filter((game) => game.winner === 1).length;
    const team2Wins = games.filter((game) => game.winner === 2).length;

    onMatchResult(
      matchId,
      winnerId,
      {
        team1: team1Wins,
        team2: team2Wins,
      },
      games
    );
    setSelectedMatch(null);
  };

  if (tournament.winner) {
    return (
      <TournamentVictoryScreen
        tournament={tournament}
        onReplay={onReplay}
        onReset={onReset}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h2 className="mb-2 flex items-center gap-3 text-2xl font-bold font-heading">
            <Trophy className="h-7 w-7 text-primary" />
            <span>Bracket torneo</span>
          </h2>
          <p className="text-muted-foreground">
            Segui il tabellone, registra i risultati disponibili e completa il torneo senza perdere il
            filo del round successivo.
          </p>
        </div>

        {tournament.winner && (
          <div className="rounded-[26px] border border-primary/35 bg-primary/14 px-6 py-4 text-center text-primary-foreground shadow-[0_0_34px_rgba(100,180,255,0.24)]">
            <div className="mb-1 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              <Crown className="h-4 w-4 text-primary" />
              <span>Campione</span>
            </div>
            <div className="text-xl font-bold text-white">{tournament.winner.name}</div>
          </div>
        )}
      </div>

      <Card className="p-6 md:p-7">
        <div className="grid gap-4 md:grid-cols-[1.35fr_1fr]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <InfoStat
                label="Tipo"
                value={tournament.config.type === 'slayer' ? 'Slayer' : 'Ranked'}
                icon={tournament.config.type === 'slayer' ? <ModeIcon mode="slayer" className="h-4 w-4" /> : <Trophy className="h-4 w-4 text-primary" />}
              />
              <InfoStat label="Modalita" value={tournament.config.teamMode} icon={Swords} />
              <InfoStat
                label="Formato"
                value={getMatchDurationDisplay(tournament.config.matchDuration)}
                icon={TimerReset}
              />
              <InfoStat label="Squadre" value={String(tournament.teams.length)} icon={Swords} />
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/10 p-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-white">Avanzamento torneo</span>
                <span className="text-white/72">{completedMatches}/{totalMatches} match</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-white/68">{completionPercent}% completato</div>
            </div>
          </div>

          <div className="rounded-[24px] border border-primary/20 bg-primary/8 p-5 shadow-[0_0_24px_rgba(100,180,255,0.12)]">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <PlayCircle className="h-4 w-4 text-primary" />
              <span>Prossimo passo</span>
            </div>

            {nextPlayableMatch ? (
              <>
                <div className="text-lg font-semibold text-white">
                  {nextPlayableMatch.team1?.name} vs {nextPlayableMatch.team2?.name}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/72">
                  <Pill icon={MapPinned} text={nextPlayableMatch.map} />
                  {nextPlayableMatch.mode && <Pill icon={<ModeIcon mode={nextPlayableMatch.mode} className="h-3.5 w-3.5" />} text={getGameModeDisplay(nextPlayableMatch.mode)} />}
                  <Pill icon={TimerReset} text={getMatchDurationDisplay(tournament.config.matchDuration)} />
                </div>
                <Button
                  onClick={() => handleMatchClick(nextPlayableMatch)}
                  size="lg"
                  className="mt-4 w-full justify-center"
                >
                  Registra risultato
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="text-base font-semibold text-white">
                  {tournament.winner ? 'Torneo completato' : 'Nessun match pronto'}
                </div>
                <p className="text-sm text-white/68">
                  {tournament.winner
                    ? 'Hai gia un vincitore finale. Puoi tornare indietro o iniziare un nuovo torneo.'
                    : 'Completa i match gia aperti per sbloccare i round successivi.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {tournament.config.type === 'ranked' && (
        <Card className="p-5 md:p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Trophy className="h-4 w-4 text-primary" />
            <span>Rotazione ranked</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
            <Pill icon={<ModeIcon mode="slayer" className="h-3.5 w-3.5" />} text="Massacro" />
            <ChevronRight className="h-4 w-4 text-primary/80" />
            <Pill icon={<ModeIcon mode="oddball" className="h-3.5 w-3.5" />} text="Teschio" />
            <ChevronRight className="h-4 w-4 text-primary/80" />
            <Pill icon={<ModeIcon mode="ctf" className="h-3.5 w-3.5" />} text="Ruba la bandiera" />
            <ChevronRight className="h-4 w-4 text-primary/80" />
            <Pill icon={<ModeIcon mode="koth" className="h-3.5 w-3.5" />} text="Re della collina" />
          </div>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Tabellone attivo</div>
            <p className="text-sm text-white/68">
              I match evidenziati sono pronti. Quelli in attesa restano secondari finche il round non si sblocca.
            </p>
          </div>
          <div className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/78">
            {playableMatches.length > 0 ? `${playableMatches.length} match disponibili` : 'In attesa dei risultati'}
          </div>
        </div>

        <div id="tournament-bracket" className="overflow-x-auto pb-2">
          <div className="inline-flex min-w-full gap-5">
            {tournament.rounds.map((round) => {
              const roundCompletedMatches = round.matches.filter((match) => !!match.winner).length;

              return (
                <div
                  key={round.index}
                  className="flex min-w-[320px] max-w-[340px] flex-1 flex-col rounded-[28px] border border-white/10 bg-black/10 p-4 backdrop-blur-sm"
                >
                  <div className="mb-4 rounded-[20px] border border-white/8 bg-slate-950/36 px-4 py-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-white">{round.name}</h3>
                      <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/72">
                        {roundCompletedMatches}/{round.matches.length}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-white/72">
                      <Pill icon={MapPinned} text={round.map} />
                      {round.mode && <Pill icon={<ModeIcon mode={round.mode} className="h-3.5 w-3.5" />} text={getGameModeDisplay(round.mode)} />}
                      <Pill icon={TimerReset} text={getMatchDurationDisplay(tournament.config.matchDuration)} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {round.matches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onClick={() => handleMatchClick(match)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <GameResultsDialog
        open={!!selectedMatch}
        match={selectedMatch}
        matchDuration={tournament.config.matchDuration}
        config={tournament.config}
        onClose={() => setSelectedMatch(null)}
        onSubmit={handleGameResultsSubmit}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button onClick={onBack} variant="ghost" size="lg" className="text-white/74">
          <ArrowLeft className="h-4 w-4" />
          Modifica squadre
        </Button>
        <Button onClick={onReset} variant="outline" size="lg" className="text-white/74">
          <RefreshCcw className="h-4 w-4" />
          Nuovo torneo
        </Button>
      </div>
    </div>
  );
}

function InfoStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }> | ReactNode;
}) {
  const iconNode = isValidElement(Icon)
    ? Icon
    : createElement(Icon as ComponentType<{ className?: string }>, { className: 'h-3.5 w-3.5 text-primary' });

  return (
    <div className="rounded-[20px] border border-white/10 bg-black/8 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/50">
        {iconNode}
        <span>{label}</span>
      </div>
      <div className="text-base font-semibold text-white">{value}</div>
    </div>
  );
}

function Pill({
  icon,
  text,
}: {
  icon: ComponentType<{ className?: string }> | ReactNode;
  text: string;
}) {
  const iconNode = isValidElement(icon)
    ? icon
    : createElement(icon as ComponentType<{ className?: string }>, { className: 'h-3.5 w-3.5 text-primary' });

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/10 px-3 py-1.5">
      {iconNode}
      <span>{text}</span>
    </span>
  );
}

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

function MatchCard({ match, onClick }: MatchCardProps) {
  const isPlayable = !!match.team1 && !!match.team2 && !match.winner;
  const isBye = !!match.team1 && !match.team2 && !!match.winner;
  const isWaiting = !match.team1 || !match.team2;

  const status = match.winner
    ? { label: isBye ? 'Bye' : 'Completato', icon: CheckCircle2, className: 'border-primary/20 bg-primary/10 text-white' }
    : isPlayable
    ? { label: 'Da giocare', icon: PlayCircle, className: 'border-primary/20 bg-primary/10 text-white' }
    : { label: 'In attesa', icon: Clock3, className: 'border-white/10 bg-white/6 text-white/70' };

  return (
    <Card
      className={cn(
        'p-4 transition-all',
        isPlayable && 'cursor-pointer border-primary/20 shadow-[0_0_18px_rgba(100,180,255,0.10)] hover:border-primary hover:shadow-[0_0_28px_rgba(100,180,255,0.18)]',
        !isPlayable && 'shadow-none',
        match.winner && !isBye && 'border-white/10 bg-black/10',
        isWaiting && 'opacity-80'
      )}
      onClick={isPlayable ? onClick : undefined}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.16em] text-white/45">
          Match {match.matchIndex + 1}
        </div>
        <div className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium', status.className)}>
          <status.icon className="h-3.5 w-3.5" />
          <span>{status.label}</span>
        </div>
      </div>

      {isBye ? (
        <div className="rounded-[22px] border border-primary/20 bg-primary/10 px-4 py-4 text-center">
          <div className="text-base font-semibold text-white">{match.team1?.name}</div>
          <div className="mt-1 text-sm text-white/65">Avanza automaticamente al round successivo</div>
        </div>
      ) : isWaiting && !match.team1 && !match.team2 ? (
        <div className="rounded-[22px] border border-white/10 bg-black/8 px-4 py-6 text-center text-sm text-white/60">
          In attesa dei risultati del round precedente
        </div>
      ) : (
        <div className="space-y-2.5">
          <TeamDisplay
            team={match.team1}
            isWinner={match.winner?.id === match.team1?.id}
            isLoser={!!match.winner && match.winner.id !== match.team1?.id}
            score={match.seriesScore?.team1}
          />

          <div className="py-0.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
            VS
          </div>

          <TeamDisplay
            team={match.team2}
            isWinner={match.winner?.id === match.team2?.id}
            isLoser={!!match.winner && match.winner.id !== match.team2?.id}
            score={match.seriesScore?.team2}
          />
        </div>
      )}
    </Card>
  );
}

interface TeamDisplayProps {
  team?: Team;
  isWinner: boolean;
  isLoser: boolean;
  score?: number;
}

function TeamDisplay({ team, isWinner, isLoser, score }: TeamDisplayProps) {
  if (!team) {
    return (
      <div className="rounded-[20px] border border-dashed border-white/14 bg-black/8 px-4 py-4 text-center text-sm text-white/50">
        TBD
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-[22px] border px-4 py-3 transition-all',
        isWinner ? 'border-primary/30 bg-primary/14 shadow-[0_0_18px_rgba(100,180,255,0.14)]' : 'border-white/10 bg-black/8',
        isLoser && 'opacity-55'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-white">{team.name}</div>
          <div className="mt-1 text-xs leading-relaxed text-white/62">
            {team.players.map((player) => player.name).join(', ')}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {score !== undefined && <span className="text-lg font-bold text-white">{score}</span>}
          {isWinner && <Trophy className="h-4 w-4 text-primary" />}
        </div>
      </div>
    </div>
  );
}

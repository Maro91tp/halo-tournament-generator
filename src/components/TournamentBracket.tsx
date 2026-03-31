import { createElement, isValidElement, useEffect, useMemo, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleCheckBig,
  RefreshCcw,
  Save,
  Swords,
  TimerReset,
  Trophy,
} from 'lucide-react';
import type { Tournament, Match, Team, SeriesScore, Game } from '../types/tournament';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { generateGamesForMatch, getGameModeDisplay, getMatchDurationDisplay } from '../lib/tournament-utils';
import { cn } from '@/lib/utils';
import GameResultsDialog from './GameResultsDialog';
import { ModeIcon } from './TournamentIcons';
import TournamentVictoryScreen from './TournamentVictoryScreen';
import { useLanguage } from './LanguageContext';

interface TournamentBracketProps {
  tournament: Tournament;
  onMatchResult: (matchId: string, winnerId: string, seriesScore?: SeriesScore, games?: Game[]) => void;
  onReplay: () => void;
  onReset: () => void;
  onBack: () => void;
  onSaveTournament: (name: string) => void;
  currentSavedTournamentName: string | null;
  currentSavedTournamentStatus: 'active' | 'completed' | null;
  currentSavedTournamentSavedAt: string | null;
  currentSavedTournamentTeamMode: string | null;
  currentSavedTournamentType: 'slayer' | 'ranked' | null;
}

export default function TournamentBracket({
  tournament,
  onMatchResult,
  onReplay,
  onReset,
  onBack,
  onSaveTournament,
  currentSavedTournamentName,
  currentSavedTournamentStatus,
  currentSavedTournamentSavedAt,
  currentSavedTournamentTeamMode,
  currentSavedTournamentType,
}: TournamentBracketProps) {
  const language = useLanguage();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [tournamentName, setTournamentName] = useState(currentSavedTournamentName ?? '');
  const [saveFeedbackVisible, setSaveFeedbackVisible] = useState(false);
  const [hasSaveInteraction, setHasSaveInteraction] = useState(false);
  const copy = language === 'en'
    ? {
        title: 'Tournament bracket',
        subtitle: 'Follow the bracket, record available results, and complete the tournament without losing track of the next round.',
        champion: 'Champion',
        type: 'Type',
        mode: 'Mode',
        format: 'Format',
        teams: 'Teams',
        progress: 'Tournament progress',
        match: 'match',
        matches: 'matches',
        completed: 'completed',
        nextStep: 'Next step',
        recordResult: 'Record result',
        completedTournament: 'Tournament completed',
        noMatchReady: 'No match ready',
        winnerHelp: 'You already have a final winner. You can go back or start a new tournament.',
        pendingHelp: 'Complete the currently open matches to unlock the next rounds.',
        rankedRotation: 'Ranked rotation',
        activeBracket: 'Active bracket',
        activeBracketHelp: 'Highlighted matches are ready. Waiting matches stay secondary until the round unlocks.',
        availableMatches: 'available matches',
        waitingResults: 'Waiting for results',
        editTeams: 'Edit teams',
        newTournament: 'New tournament',
        slayer: 'Slayer',
        oddball: 'Oddball',
        ctf: 'Capture the Flag',
        koth: 'King of the Hill',
        ranked: 'Ranked',
        saveTournament: 'Save tournament',
        saveTournamentTitle: 'Save tournament',
        saveTournamentDescription: 'Enter a clear name. It will be saved with date, format and tournament type so you can find it quickly from the home screen.',
        tournamentName: 'Tournament name',
        tournamentNamePlaceholder: 'Example: Friday Scrim 2v2',
        saveTournamentConfirm: 'Save with this name',
        currentSave: 'Current save',
        activeSave: 'Active save',
        completedSave: 'Completed save',
        saveUpdated: 'Tournament saved successfully',
        savedOn: 'Saved on',
        tournamentType: 'Type',
        updateTournament: 'Update tournament status',
        saveInfo: 'Name, date, format and tournament type',
        noNamedSave: 'No named save yet',
        noNamedSaveHelp: 'Save this bracket with a clear name so you can load it again from the home screen.',
      }
    : {
        title: 'Bracket torneo',
        subtitle: 'Segui il tabellone, registra i risultati disponibili e completa il torneo senza perdere il filo del round successivo.',
        champion: 'Campione',
        type: 'Tipo',
        mode: 'Modalita',
        format: 'Formato',
        teams: 'Squadre',
        progress: 'Avanzamento torneo',
        match: 'match',
        matches: 'match',
        completed: 'completato',
        nextStep: 'Prossimo passo',
        recordResult: 'Registra risultato',
        completedTournament: 'Torneo completato',
        noMatchReady: 'Nessun match pronto',
        winnerHelp: 'Hai gia un vincitore finale. Puoi tornare indietro o iniziare un nuovo torneo.',
        pendingHelp: 'Completa i match gia aperti per sbloccare i round successivi.',
        rankedRotation: 'Rotazione ranked',
        activeBracket: 'Tabellone attivo',
        activeBracketHelp: 'I match evidenziati sono pronti. Quelli in attesa restano secondari finche il round non si sblocca.',
        availableMatches: 'match disponibili',
        waitingResults: 'In attesa dei risultati',
        editTeams: 'Modifica squadre',
        newTournament: 'Nuovo torneo',
        slayer: 'Massacro',
        oddball: 'Teschio',
        ctf: 'Ruba la bandiera',
        koth: 'Re della collina',
        ranked: 'Ranked',
        saveTournament: 'Salva torneo',
        saveTournamentTitle: 'Salva torneo',
        saveTournamentDescription: 'Inserisci un nome chiaro. Verra salvato con data, formato e tipo torneo cosi lo ritrovi facilmente dalla home.',
        tournamentName: 'Nome torneo',
        tournamentNamePlaceholder: 'Esempio: Scrim Friday 2v2',
        saveTournamentConfirm: 'Salva con questo nome',
        currentSave: 'Salvataggio corrente',
        activeSave: 'Salvataggio attivo',
        completedSave: 'Salvataggio completato',
        saveUpdated: 'Salvataggio avvenuto con successo',
        savedOn: 'Salvato il',
        tournamentType: 'Tipo',
        updateTournament: 'Aggiorna stato torneo',
        saveInfo: 'Nome, data, formato e tipo torneo',
        noNamedSave: 'Nessun salvataggio nominato',
        noNamedSaveHelp: 'Salva questo bracket con un nome chiaro cosi lo puoi ricaricare facilmente dalla home.',
      };

  const saveStatusLabel = currentSavedTournamentStatus === 'completed' ? copy.completedSave : copy.activeSave;
  const typeLabel = currentSavedTournamentType === 'slayer' ? copy.slayer : copy.ranked;
  const saveButtonLabel = saveFeedbackVisible && currentSavedTournamentName
    ? copy.saveUpdated
    : currentSavedTournamentName
      ? copy.updateTournament
      : copy.saveTournament;
  const formatLabel = getMatchDurationDisplay(tournament.config.matchDuration, language);
  const formatSavedAt = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString(language === 'en' ? 'en-US' : 'it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

  useEffect(() => {
    setTournamentName(currentSavedTournamentName ?? '');
  }, [currentSavedTournamentName]);

  useEffect(() => {
    if (!hasSaveInteraction || !currentSavedTournamentSavedAt) return;
    setSaveFeedbackVisible(true);
    const timeout = window.setTimeout(() => setSaveFeedbackVisible(false), 4500);
    return () => window.clearTimeout(timeout);
  }, [currentSavedTournamentSavedAt, hasSaveInteraction]);

  const handleOpenSaveDialog = () => {
    setTournamentName(currentSavedTournamentName ?? '');
    setSaveDialogOpen(true);
  };

  const handleSaveTournament = () => {
    const trimmedName = tournamentName.trim();
    if (!trimmedName) return;
    setHasSaveInteraction(true);
    onSaveTournament(trimmedName);
    setSaveDialogOpen(false);
  };

  const allMatches = useMemo(
    () => tournament.rounds.flatMap((round) => round.matches),
    [tournament.rounds]
  );
  const completedMatches = allMatches.filter((match) => !!match.winner).length;
  const totalMatches = allMatches.length;
  const playableMatches = allMatches.filter((match) => match.team1 && match.team2 && !match.winner);
  const completionPercent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
  const previewGamesByRound = useMemo(() => {
    const gamesToCreate =
      tournament.config.matchDuration === 'single'
        ? 1
        : tournament.config.matchDuration === 'bo3'
          ? 3
          : 5;

    return tournament.rounds.reduce<Record<number, Game[]>>((accumulator, round) => {
      accumulator[round.index] = generateGamesForMatch(tournament.config, round.index, gamesToCreate);
      return accumulator;
    }, {});
  }, [tournament.config, tournament.rounds]);
  const nextPlayableMatch = playableMatches[0];
  const nextPlayableGame = nextPlayableMatch
    ? getNextPlayableGame(nextPlayableMatch, tournament.config, previewGamesByRound)
    : undefined;

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
        onBack={onBack}
        onReplay={onReplay}
        onReset={onReset}
      />
    );
  }

  return (
    <div className="app-section flex w-full flex-col gap-6">
      <div className="max-w-3xl">
          <h2 className="app-title mb-2 flex items-center gap-2.5 font-bold font-heading sm:gap-3">
            <Trophy className="h-[var(--app-icon-lg)] w-[var(--app-icon-lg)] text-primary" />
            <span>{copy.title}</span>
          </h2>
          <p className="app-subtitle text-muted-foreground">
            {copy.subtitle}
          </p>
      </div>

      <Card className="p-4 sm:p-5 md:p-6">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="grid grid-cols-1 gap-3 text-[clamp(0.78rem,0.75rem+0.16vw,0.9rem)] sm:grid-cols-2 xl:grid-cols-4">
              <InfoStat
                label={copy.type}
                value={tournament.config.type === 'slayer' ? copy.slayer : copy.ranked}
                icon={tournament.config.type === 'slayer' ? <ModeIcon mode="slayer" className="h-4 w-4" /> : <Trophy className="h-4 w-4 text-primary" />}
              />
              <InfoStat label={copy.mode} value={tournament.config.teamMode} icon={Swords} />
              <InfoStat
                label={copy.format}
                value={formatLabel}
                icon={TimerReset}
              />
              <InfoStat label={copy.teams} value={String(tournament.teams.length)} icon={Swords} />
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/55 sm:text-[11px]">
                  {copy.currentSave}
                </div>
                <div className="text-[clamp(0.94rem,0.9rem+0.34vw,1.12rem)] font-bold text-white">
                  {currentSavedTournamentName ?? copy.noNamedSave}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[clamp(0.72rem,0.69rem+0.16vw,0.84rem)] leading-relaxed text-white/76">
                  {currentSavedTournamentName ? (
                    <>
                      <span><span className="font-semibold text-white/88">{copy.savedOn}:</span> {formatSavedAt(currentSavedTournamentSavedAt) ?? '-'}</span>
                      <span><span className="font-semibold text-white/88">{copy.tournamentType}:</span> {typeLabel}</span>
                      {currentSavedTournamentTeamMode && <span className="font-semibold text-white/88">{currentSavedTournamentTeamMode}</span>}
                      <span>{saveStatusLabel}</span>
                    </>
                  ) : (
                    <span>{copy.noNamedSaveHelp}</span>
                  )}
                </div>
              </div>

              <Button
                onClick={handleOpenSaveDialog}
                className={saveFeedbackVisible && currentSavedTournamentName
                  ? 'min-h-10 w-full border-lime-300/70 bg-lime-400 text-slate-950 shadow-[0_0_24px_rgba(163,230,53,0.34)] hover:bg-lime-400 hover:shadow-[0_0_34px_rgba(163,230,53,0.42)] sm:w-[138px]'
                  : currentSavedTournamentName
                    ? 'min-h-10 w-full border-amber-200/60 bg-primary text-primary-foreground shadow-[0_0_28px_rgba(245,180,76,0.28)] hover:shadow-[0_0_38px_rgba(245,180,76,0.36)]'
                  : 'min-h-10 w-full border-white/18 bg-white/6 text-white hover:bg-white/10'}
                variant={saveFeedbackVisible || currentSavedTournamentName ? 'default' : 'outline'}
              >
                {saveFeedbackVisible && currentSavedTournamentName ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saveFeedbackVisible && currentSavedTournamentName ? null : saveButtonLabel}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)]">
              <span className="text-[clamp(0.72rem,0.69rem+0.15vw,0.88rem)] font-semibold text-white sm:text-sm">{copy.progress}</span>
              <span className="text-[clamp(0.72rem,0.69rem+0.15vw,0.88rem)] text-white/72 sm:text-sm">{completedMatches}/{totalMatches} {totalMatches === 1 ? copy.match : copy.matches}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="text-[clamp(0.72rem,0.69rem+0.15vw,0.88rem)] text-white/68 sm:text-sm">{completionPercent}% {copy.completed}</div>
          </div>

          {tournament.config.type === 'ranked' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[clamp(0.98rem,0.94rem+0.24vw,1.08rem)] font-bold text-white">
                <Trophy className="h-4.5 w-4.5 text-primary" />
                <span>{copy.rankedRotation}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 text-sm text-white/86">
                <Pill icon={<ModeIcon mode="slayer" className="h-3.5 w-3.5" />} text={copy.slayer} />
                <ChevronRight className="h-4 w-4 text-primary/80" />
                <Pill icon={<ModeIcon mode="oddball" className="h-3.5 w-3.5" />} text={copy.oddball} />
                <ChevronRight className="h-4 w-4 text-primary/80" />
                <Pill icon={<ModeIcon mode="ctf" className="h-3.5 w-3.5" />} text={copy.ctf} />
                <ChevronRight className="h-4 w-4 text-primary/80" />
                <Pill icon={<ModeIcon mode="koth" className="h-3.5 w-3.5" />} text={copy.koth} />
              </div>
            </div>
          )}

          {saveFeedbackVisible && currentSavedTournamentName && (
            <div className="rounded-[18px] border border-amber-200/35 bg-[linear-gradient(180deg,rgba(245,180,76,0.16)_0%,rgba(245,180,76,0.06)_100%)] px-4 py-3 shadow-[0_0_22px_rgba(245,180,76,0.12)] sm:rounded-[20px] sm:px-5">
              <div className="text-[clamp(0.84rem,0.8rem+0.18vw,0.97rem)] font-semibold text-amber-50">
                {copy.saveUpdated}
              </div>
              <div className="mt-1 text-[clamp(0.78rem,0.74rem+0.18vw,0.9rem)] leading-relaxed text-amber-50/84">
                {copy.saveInfo}: <span className="font-semibold text-white">{currentSavedTournamentName}</span> - {formatSavedAt(currentSavedTournamentSavedAt) ?? '-'} - {typeLabel}{currentSavedTournamentTeamMode ? ` - ${currentSavedTournamentTeamMode}` : ''}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card
        className="relative overflow-hidden p-5 sm:p-6 md:p-7"
        style={getMapCardBackgroundStyle(nextPlayableGame?.map)}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(18,168,209,0.30)_0%,rgba(7,16,43,0.60)_44%,rgba(8,11,36,0.88)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%)]" />
        <div className="relative space-y-4">
          {nextPlayableMatch ? (
            <div className="space-y-5 text-center">
              <div className="text-[clamp(1.65rem,1.4rem+1vw,2.5rem)] font-black leading-tight text-white">
                {nextPlayableGame?.map ?? nextPlayableMatch.map}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/72">
                {nextPlayableGame?.mode
                  ? <Pill icon={<ModeIcon mode={nextPlayableGame.mode} className="h-3.5 w-3.5" />} text={getGameModeDisplay(nextPlayableGame.mode, language)} />
                  : nextPlayableMatch.mode
                    ? <Pill icon={<ModeIcon mode={nextPlayableMatch.mode} className="h-3.5 w-3.5" />} text={getGameModeDisplay(nextPlayableMatch.mode, language)} />
                    : null}
                <Pill icon={TimerReset} text={formatLabel} />
              </div>

              {tournament.config.matchDuration !== 'single' && (
                <div className="mx-auto max-w-full">
                  <SeriesPreview
                    games={getSeriesPreviewGames(nextPlayableMatch, tournament.config, previewGamesByRound)}
                    compact
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-center">
              <div className="text-base font-semibold text-white">
                {tournament.winner ? copy.completedTournament : copy.noMatchReady}
              </div>
              <p className="mx-auto max-w-2xl text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] text-white/68">
                {tournament.winner
                  ? copy.winnerHelp
                  : copy.pendingHelp}
              </p>
            </div>
          )}
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[clamp(0.86rem,0.82rem+0.2vw,1rem)] font-semibold text-white">{copy.activeBracket}</div>
            <p className="text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] text-white/68">
              {copy.activeBracketHelp}
            </p>
          </div>
          <div className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs text-white/78 sm:px-4 sm:py-2 sm:text-sm">
            {playableMatches.length > 0 ? `${playableMatches.length} ${copy.availableMatches}` : copy.waitingResults}
          </div>
        </div>

        {playableMatches.length > 0 ? (
          <div id="tournament-bracket" className="grid gap-4 md:grid-cols-2">
            {playableMatches.map((match) => (
              <AvailableMatchCard
                key={match.id}
                match={match}
                config={tournament.config}
                previewGamesByRound={previewGamesByRound}
                onClick={() => handleMatchClick(match)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-5 text-center text-[clamp(0.8rem,0.76rem+0.18vw,0.92rem)] text-white/62">
            {copy.waitingResults}
          </Card>
        )}
      </section>

      <GameResultsDialog
        open={!!selectedMatch}
        match={selectedMatch}
        matchDuration={tournament.config.matchDuration}
        config={tournament.config}
        onClose={() => setSelectedMatch(null)}
        onSubmit={handleGameResultsSubmit}
      />

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="border-amber-200/35 bg-[linear-gradient(180deg,rgba(15,24,44,0.985)_0%,rgba(9,16,31,0.99)_100%)] text-white shadow-[0_0_46px_rgba(245,180,76,0.14)]">
          <DialogHeader>
            <DialogTitle className="text-white">{copy.saveTournamentTitle}</DialogTitle>
            <DialogDescription className="max-w-[34ch] text-white/78">
              {copy.saveTournamentDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tournament-save-name" className="mb-2 block text-white/92">
                {copy.tournamentName}
              </Label>
              <Input
                id="tournament-save-name"
                value={tournamentName}
                onChange={(event) => setTournamentName(event.target.value)}
                placeholder={copy.tournamentNamePlaceholder}
                className="h-11 rounded-[14px] border-amber-100/45 bg-white/[0.03] text-white placeholder:text-white/38 focus-visible:border-amber-200/70 focus-visible:ring-amber-200/18"
              />
            </div>
            <Button
              onClick={handleSaveTournament}
              disabled={!tournamentName.trim()}
              className="h-11 w-full rounded-[14px] border border-amber-200/60 bg-primary text-[0.95rem] text-primary-foreground shadow-[0_0_30px_rgba(245,180,76,0.24)] hover:shadow-[0_0_40px_rgba(245,180,76,0.34)]"
            >
              {currentSavedTournamentName ? copy.updateTournament : copy.saveTournamentConfirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Button onClick={onBack} variant="ghost" size="lg" className="w-full text-white/60 hover:text-white sm:w-auto">
          <ArrowLeft className="h-4 w-4" />
          {copy.editTeams}
        </Button>
        <Button onClick={onReset} variant="outline" size="lg" className="w-full border-white/18 text-white/70 sm:w-auto">
          <RefreshCcw className="h-4 w-4" />
          {copy.newTournament}
        </Button>
      </div>
    </div>
  );
}

function getMapCardBackgroundStyle(mapName?: string): CSSProperties | undefined {
  if (!mapName) return undefined;

  const mapImageByName: Record<string, string> = {
    Aquarius: '/Maps/Aquarius.png',
    Empyrean: '/Maps/Empyrean.png',
    Lattice: '/Maps/Lattice.png',
    'Live Fire': '/Maps/LiveFire.png',
    Origin: '/Maps/Origin.jpg',
    Recharge: '/Maps/Recharge.jpg',
    Solitude: '/Maps/Solitude.jpg',
    Streets: '/Maps/Streets.png',
    Vacancy: '/Maps/Vacancy.jpg',
  };

  const imageUrl = mapImageByName[mapName];
  if (!imageUrl) return undefined;

  return {
    backgroundImage: `url("${imageUrl}")`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  };
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
    <div className="min-w-0 rounded-[18px] border border-white/10 bg-black/8 px-3 py-2.5 sm:rounded-[20px] sm:px-3.5 sm:py-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-white/50 sm:text-[11px]">
        {iconNode}
        <span>{label}</span>
      </div>
      <div className="text-[clamp(0.9rem,0.87rem+0.22vw,1.02rem)] font-bold text-white sm:text-[0.98rem]">{value}</div>
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
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-[11px] font-medium text-white/86 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs">
      {iconNode}
      <span>{text}</span>
    </span>
  );
}

interface MatchCardProps {
  match: Match;
  config: Tournament['config'];
  previewGamesByRound: Record<number, Game[]>;
  onClick: () => void;
}

function AvailableMatchCard({ match, config, previewGamesByRound, onClick }: MatchCardProps) {
  const language = useLanguage();
  const nextGame = getNextPlayableGame(match, config, previewGamesByRound);
  const actionLabel = language === 'en' ? 'Record this match' : 'Registra questo match';

  return (
    <Card
      className="cursor-pointer p-5 shadow-[0_0_26px_rgba(245,180,76,0.16)] transition-all hover:border-primary hover:shadow-[0_0_34px_rgba(245,180,76,0.22)]"
      onClick={onClick}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/46">
            Match {match.matchIndex + 1}
          </div>
          {nextGame && (
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/46">
              Game {nextGame.gameNumber}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] md:items-start">
          <div className="space-y-2 text-left">
            <div className="text-sm font-bold text-white sm:text-base">
              {match.team1?.name}
            </div>
            <div className="space-y-1.5">
              {match.team1?.players.map((player) => (
                <div key={player.id} className="text-sm leading-relaxed text-white/84 sm:text-[0.95rem]">
                  {player.name}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center self-stretch">
            <div className="text-[1.1rem] font-black uppercase tracking-[0.04em] text-white/78 sm:text-[1.3rem]">
              VS
            </div>
          </div>

          <div className="space-y-2 text-left md:text-right">
            <div className="text-sm font-bold text-white sm:text-base">
              {match.team2?.name}
            </div>
            <div className="space-y-1.5">
              {match.team2?.players.map((player) => (
                <div key={player.id} className="text-sm leading-relaxed text-white/84 sm:text-[0.95rem]">
                  {player.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {nextGame && (
          <div className="space-y-2 border-t border-white/8 pt-4">
            <div className="text-[clamp(0.98rem,0.94rem+0.28vw,1.1rem)] font-bold text-white">
              {nextGame.map}
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-white/72">
              <Pill icon={<ModeIcon mode={nextGame.mode} className="h-3.5 w-3.5" />} text={getGameModeDisplay(nextGame.mode, language)} />
              <Pill icon={TimerReset} text={getMatchDurationDisplay(config.matchDuration, language)} />
            </div>
          </div>
        )}

        <Button
          size="lg"
          className="w-full justify-center shadow-[0_0_30px_rgba(245,180,76,0.28)] hover:shadow-[0_0_40px_rgba(245,180,76,0.4)]"
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function getSeriesPreviewGames(
  match: Match,
  config: Tournament['config'],
  previewGamesByRound?: Record<number, Game[]>
): Game[] {
  if (match.games && match.games.length > 0) {
    return match.games;
  }

  if (previewGamesByRound?.[match.roundIndex]) {
    return previewGamesByRound[match.roundIndex];
  }

  const gamesToCreate = config.matchDuration === 'single' ? 1 : config.matchDuration === 'bo3' ? 3 : 5;
  return generateGamesForMatch(config, match.roundIndex, gamesToCreate);
}

function getNextPlayableGame(
  match: Match,
  config: Tournament['config'],
  previewGamesByRound?: Record<number, Game[]>
): Game | undefined {
  const games = getSeriesPreviewGames(match, config, previewGamesByRound);
  return games.find((game) => !game.winner) ?? games[0];
}

function SeriesPreview({
  games,
  compact = false,
}: {
  games: Game[];
  compact?: boolean;
}) {
  const language = useLanguage();

  return (
    <div className={compact ? 'flex w-full justify-center gap-2 overflow-x-auto pb-1' : 'grid w-full justify-center gap-2'}>
      {games.map((game) => (
        <div
          key={`${game.gameNumber}-${game.map}-${game.mode}`}
          className={cn(
            'min-w-[108px] rounded-[14px] border border-white/8 bg-black/8 px-3 py-2.5 text-center',
            compact ? 'shrink-0' : ''
          )}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/46">
            Game {game.gameNumber}
          </div>
          <div className="mt-1 text-sm font-semibold text-white/92">
            {game.map}
          </div>
          <div className="mt-1 text-[11px] text-white/60">
            {getGameModeDisplay(game.mode, language)}
          </div>
        </div>
      ))}
    </div>
  );
}


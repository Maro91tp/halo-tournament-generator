import { useState, useEffect } from 'react';
import { Check, Gamepad2 } from 'lucide-react';
import { RANKED_MODE_ROTATION } from '../types/tournament';
import type { Player, Team, Tournament, TournamentConfig, SeriesScore, Game } from '../types/tournament';
import PlayerSetup from './PlayerSetup';
import ConfigSetup from './ConfigSetup';
import TeamSetup from './TeamSetup';
import TournamentBracket from './TournamentBracket';
import WelcomeScreen from './WelcomeScreen';
import TournamentPasswordDialog, { type TournamentPasswordDialogMode } from './TournamentPasswordDialog';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { LanguageProvider } from './LanguageContext';
import { generateTournament, updateMatchResult } from '../lib/tournament-utils';
import {
  saveTournamentState,
  loadTournamentState,
  clearTournamentState,
  clearSavedTournamentRecords,
  hasSavedTournament,
  deleteSavedTournamentRecord,
  listSavedTournamentRecords,
  loadSavedTournamentRecord,
  saveNamedTournament,
  type SavedTournamentRecord,
} from '../lib/tournament-storage';
import {
  getTournamentPassword,
  setTournamentPassword,
  clearTournamentPassword,
} from '../lib/tournament-password';
import { LANGUAGE_STORAGE_KEY, type Language } from '../lib/language';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  listTournamentRecordsFromSupabase,
  loadTournamentRecordFromSupabase,
  type TournamentSyncResult,
} from '../lib/supabase-storage';

type Step = 'welcome' | 'players' | 'config' | 'teams' | 'bracket';

const DEV_PLAYERS: Player[] = [
  { id: 'dev-p1', name: 'MrMarozzo', rank: { tier: 'diamond', level: 5 }, strengthValue: 29 },
  { id: 'dev-p2', name: 'La', rank: { tier: 'gold', level: 1 }, strengthValue: 13 },
  { id: 'dev-p3', name: 'LaPanteraBlu', rank: { tier: 'diamond', level: 4 }, strengthValue: 28 },
  { id: 'dev-p4', name: 'Envil', rank: { tier: 'platinum', level: 5 }, strengthValue: 23 },
];

const DEV_CONFIG: TournamentConfig = {
  type: 'ranked',
  teamMode: '2v2',
  matchDuration: 'bo3',
  teamCreationMode: 'automatic',
  killLimit: 50,
  selectedSlayerMaps: [],
  rankedMapSelectionMode: 'random',
  selectedRankedMaps: [],
  selectedRankedModes: [...RANKED_MODE_ROTATION],
};

const DEV_TEAMS: Team[] = [
  {
    id: 'dev-team-1',
    name: 'Squadra 1',
    players: [DEV_PLAYERS[0], DEV_PLAYERS[1]],
    totalStrength: DEV_PLAYERS[0].strengthValue + DEV_PLAYERS[1].strengthValue,
  },
  {
    id: 'dev-team-2',
    name: 'Squadra 2',
    players: [DEV_PLAYERS[2], DEV_PLAYERS[3]],
    totalStrength: DEV_PLAYERS[2].strengthValue + DEV_PLAYERS[3].strengthValue,
  },
];

const DEV_PREVIEW_ENABLED = false;

function upsertSavedTournamentRecord(
  records: SavedTournamentRecord[],
  nextRecord: SavedTournamentRecord
): SavedTournamentRecord[] {
  const withoutCurrent = records.filter((record) => record.id !== nextRecord.id);
  return [nextRecord, ...withoutCurrent].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
  });
}

export default function TournamentApp() {
  const [language, setLanguage] = useState<Language>('it');
  const [step, setStep] = useState<Step>('welcome');
  const [players, setPlayers] = useState<Player[]>([]);
  const [config, setConfig] = useState<TournamentConfig | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [savedTournament, setSavedTournament] = useState<ReturnType<typeof loadTournamentState>>(null);
  const [savedTournaments, setSavedTournaments] = useState<SavedTournamentRecord[]>([]);
  const [currentSavedTournamentId, setCurrentSavedTournamentId] = useState<string | null>(null);
  const [manualSaveFeedbackToken, setManualSaveFeedbackToken] = useState<string | null>(null);
  const [flowErrorMessage, setFlowErrorMessage] = useState<string | null>(null);
  const [passwordDialog, setPasswordDialog] = useState<{
    open: boolean;
    mode: TournamentPasswordDialogMode;
    tournamentId: string | null;
    tournamentName: string | null;
    pendingName: string | null;
    errorMessage: string | null;
    submitting: boolean;
  }>({
    open: false,
    mode: 'create',
    tournamentId: null,
    tournamentName: null,
    pendingName: null,
    errorMessage: null,
    submitting: false,
  });
  const copy = language === 'it'
    ? {
        title: 'Halo Tournament Generator',
        description: 'Crea tornei competitivi di Halo Infinite',
        devPreview: 'Dev Preview',
        goToPlayers: 'Vai a Players',
        goToConfig: 'Vai a Config',
        goToTeams: 'Vai a Teams',
        goToBracket: 'Vai a Bracket',
        missingSavedTournament: 'Torneo non trovato. Potrebbe essere stato cancellato.',
        missingResumeTournament: 'Nessun torneo da riprendere. Potrebbe essere stato cancellato o svuotato.',
        flowErrorTitle: 'Torneo non disponibile',
        flowErrorAction: 'Ho capito',
        passwordInvalid: 'Password errata. Riprova.',
        passwordSyncError: 'Non sono riuscito a salvare il torneo online. Riprova tra poco.',
        stepPlayers: 'Giocatori',
        stepConfig: 'Regole',
        stepTeams: 'Squadre',
        stepBracket: 'Bracket',
      }
    : {
        title: 'Halo Tournament Generator',
        description: 'Create competitive Halo Infinite tournaments',
        devPreview: 'Dev Preview',
        goToPlayers: 'Go to Players',
        goToConfig: 'Go to Config',
        goToTeams: 'Go to Teams',
        goToBracket: 'Go to Bracket',
        missingSavedTournament: 'Tournament not found. It may have been deleted.',
        missingResumeTournament: 'No tournament to resume. It may have been deleted or cleared.',
        flowErrorTitle: 'Tournament unavailable',
        flowErrorAction: 'Got it',
        passwordInvalid: 'Wrong password. Try again.',
        passwordSyncError: 'Could not save the tournament online. Please try again shortly.',
        stepPlayers: 'Players',
        stepConfig: 'Rules',
        stepTeams: 'Teams',
        stepBracket: 'Bracket',
      };

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage === 'it' || storedLanguage === 'en') {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSavedData = async () => {
      if (hasSavedTournament()) {
        const saved = loadTournamentState();
        if (!cancelled) {
          setSavedTournament(saved);
        }
      }

      if (!isSupabaseConfigured) {
        if (!cancelled) {
          setSavedTournaments(listSavedTournamentRecords());
        }
        return;
      }

      clearSavedTournamentRecords();

      try {
        const remoteRecords = await listTournamentRecordsFromSupabase();
        if (!cancelled) {
          setSavedTournaments(remoteRecords);
        }
      } catch {
        if (!cancelled) {
          setSavedTournaments([]);
        }
      }
    };

    void loadSavedData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (step !== 'welcome') {
      saveTournamentState(step, players, config, teams, tournament);
    }
  }, [tournament, step, config, players, teams]);

  useEffect(() => {
    if (!currentSavedTournamentId || step === 'welcome') return;

    const existingRecord = savedTournaments.find((record) => record.id === currentSavedTournamentId)
      ?? (!isSupabaseConfigured ? loadSavedTournamentRecord(currentSavedTournamentId) : null);
    if (!existingRecord) {
      setCurrentSavedTournamentId(null);
      return;
    }

    const storedPassword = getTournamentPassword(existingRecord.id);
    const { record: updatedRecord, syncPromise } = saveNamedTournament({
      id: existingRecord.id,
      name: existingRecord.name,
      step,
      players,
      config,
      teams,
      tournament,
      touchSavedAt: false,
      password: storedPassword,
      persistLocal: !isSupabaseConfigured,
    });

    void syncPromise.then((result) => {
      if (!result.ok && result.reason === 'invalid_password' && storedPassword) {
        clearTournamentPassword(existingRecord.id);
      }
    });

    setSavedTournaments((currentRecords) => (
      isSupabaseConfigured
        ? upsertSavedTournamentRecord(currentRecords, updatedRecord)
        : listSavedTournamentRecords()
    ));
    if (updatedRecord.status === 'completed') {
      setCurrentSavedTournamentId(updatedRecord.id);
    }
  }, [config, currentSavedTournamentId, players, step, teams, tournament]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.title;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [copy.title, language]);

  const handleNewTournament = () => {
    clearTournamentState();
    setSavedTournament(null);
    setCurrentSavedTournamentId(null);
    setManualSaveFeedbackToken(null);
    setStep('players');
    setPlayers([]);
    setConfig(null);
    setTeams([]);
    setTournament(null);
  };

  const handleResumeTournament = () => {
    const saved = loadTournamentState();
    if (!saved) {
      setSavedTournament(null);
      setFlowErrorMessage(copy.missingResumeTournament);
      return;
    }

    setManualSaveFeedbackToken(null);
    setPlayers(saved.players);
    setConfig(saved.config);
    setTeams(saved.teams);
    setTournament(saved.tournament);
    setStep(saved.step);
  };

  const handleLoadSavedTournament = async (id: string) => {
    let saved = isSupabaseConfigured
      ? await loadTournamentRecordFromSupabase(id)
      : loadSavedTournamentRecord(id);

    if (!saved && isSupabaseConfigured) {
      deleteSavedTournamentRecord(id);
      setSavedTournaments(await listTournamentRecordsFromSupabase().catch(() => []));
      if (currentSavedTournamentId === id) {
        setCurrentSavedTournamentId(null);
      }
      setFlowErrorMessage(copy.missingSavedTournament);
      return;
    }

    if (!saved) {
      setSavedTournaments(listSavedTournamentRecords());
      if (currentSavedTournamentId === id) {
        setCurrentSavedTournamentId(null);
      }
      setFlowErrorMessage(copy.missingSavedTournament);
      return;
    }

    setManualSaveFeedbackToken(null);
    setPlayers(saved.players);
    setConfig(saved.config);
    setTeams(saved.teams);
    setTournament(saved.tournament);
    setCurrentSavedTournamentId(saved.id);
    setStep(saved.step);
  };

  const handlePlayersComplete = (completedPlayers: Player[]) => {
    setManualSaveFeedbackToken(null);
    setPlayers(completedPlayers);
    setStep('config');
  };

  const handleConfigComplete = (completedConfig: TournamentConfig) => {
    setManualSaveFeedbackToken(null);
    setConfig(completedConfig);
    setStep('teams');
  };

  const handleTeamsComplete = (completedTeams: Team[]) => {
    setManualSaveFeedbackToken(null);
    setTeams(completedTeams);

    if (config) {
      const newTournament = generateTournament(completedTeams, config, language);
      setTournament(newTournament);
      setStep('bracket');
    }
  };

  const handleMatchResult = (matchId: string, winnerId: string, seriesScore?: SeriesScore, games?: Game[]) => {
    if (tournament) {
      const updatedTournament = updateMatchResult(tournament, matchId, winnerId, seriesScore, games);
      setTournament(updatedTournament);
    }
  };

  const handleReset = () => {
    clearTournamentState();
    setSavedTournament(null);
    setCurrentSavedTournamentId(null);
    setManualSaveFeedbackToken(null);
    if (!isSupabaseConfigured) {
      setSavedTournaments(listSavedTournamentRecords());
    }
    setStep('welcome');
    setPlayers([]);
    setConfig(null);
    setTeams([]);
    setTournament(null);
  };

  const handleReplayTournament = () => {
    if (!config || teams.length === 0) return;

    setManualSaveFeedbackToken(null);
    const replayTournament = generateTournament(teams, config, language);
    setTournament(replayTournament);
    setStep('bracket');
  };

  const handleBack = () => {
    setManualSaveFeedbackToken(null);
    if (step === 'players') setStep('welcome');
    else if (step === 'config') setStep('players');
    else if (step === 'teams') setStep('config');
    else if (step === 'bracket') setStep('teams');
  };

  const handleDevPreview = (targetStep: Exclude<Step, 'welcome'>) => {
    setPlayers(DEV_PLAYERS);

    if (targetStep === 'players') {
      setConfig(null);
      setTeams([]);
      setTournament(null);
      setStep('players');
      return;
    }

    setConfig(DEV_CONFIG);

    if (targetStep === 'config') {
      setTeams([]);
      setTournament(null);
      setStep('config');
      return;
    }

    setTeams(DEV_TEAMS);

    if (targetStep === 'teams') {
      setTournament(null);
      setStep('teams');
      return;
    }

    setTournament(generateTournament(DEV_TEAMS, DEV_CONFIG, language));
    setStep('bracket');
  };

  const handleToggleLanguage = () => {
    setLanguage((current) => (current === 'it' ? 'en' : 'it'));
  };

  const closePasswordDialog = () => {
    setPasswordDialog({
      open: false,
      mode: 'create',
      tournamentId: null,
      tournamentName: null,
      pendingName: null,
      errorMessage: null,
      submitting: false,
    });
  };

  const runTournamentSave = async (
    name: string,
    password: string | null,
    existingId: string | null
  ): Promise<TournamentSyncResult> => {
    if (step === 'welcome') {
      return { ok: false, reason: 'other', message: 'Cannot save from welcome step' };
    }
    const { record, syncPromise } = saveNamedTournament({
      id: existingId,
      name,
      step,
      players,
      config,
      teams,
      tournament,
      password,
      persistLocal: !isSupabaseConfigured,
    });

    setCurrentSavedTournamentId(record.id);
    setSavedTournaments((currentRecords) => (
      isSupabaseConfigured
        ? upsertSavedTournamentRecord(currentRecords, record)
        : listSavedTournamentRecords()
    ));
    setManualSaveFeedbackToken(`${record.id}:${record.savedAt}`);

    if (password) {
      setTournamentPassword(record.id, password);
    }

    const result = await syncPromise;
    if (!result.ok && result.reason === 'invalid_password') {
      clearTournamentPassword(record.id);
    }
    return result;
  };

  const handleSaveNamedTournament = (name: string) => {
    if (step === 'welcome') return;

    if (!isSupabaseConfigured) {
      void runTournamentSave(name, null, currentSavedTournamentId);
      return;
    }

    const existingId = currentSavedTournamentId;
    const storedPassword = existingId ? getTournamentPassword(existingId) : null;

    if (storedPassword) {
      void runTournamentSave(name, storedPassword, existingId).then((result) => {
        if (!result.ok && result.reason === 'invalid_password') {
          setPasswordDialog({
            open: true,
            mode: 'unlock',
            tournamentId: existingId,
            tournamentName: name,
            pendingName: name,
            errorMessage: copy.passwordInvalid,
            submitting: false,
          });
        }
      });
      return;
    }

    setPasswordDialog({
      open: true,
      mode: existingId ? 'unlock' : 'create',
      tournamentId: existingId,
      tournamentName: name,
      pendingName: name,
      errorMessage: null,
      submitting: false,
    });
  };

  const handlePasswordDialogSubmit = async (password: string) => {
    const pendingName = passwordDialog.pendingName;
    if (!pendingName) {
      closePasswordDialog();
      return;
    }

    setPasswordDialog((prev) => ({ ...prev, submitting: true, errorMessage: null }));

    const result = await runTournamentSave(pendingName, password, passwordDialog.tournamentId);

    if (result.ok) {
      closePasswordDialog();
    } else if (result.reason === 'invalid_password') {
      setPasswordDialog((prev) => ({
        ...prev,
        submitting: false,
        errorMessage: copy.passwordInvalid,
      }));
    } else {
      setPasswordDialog((prev) => ({
        ...prev,
        submitting: false,
        errorMessage: copy.passwordSyncError,
      }));
    }
  };

  const currentSavedTournament = currentSavedTournamentId
    ? savedTournaments.find((record) => record.id === currentSavedTournamentId) ?? null
    : null;
  const mobileStepProgress = (
    <MobileStepProgress
      currentStep={step}
      copy={{
        stepPlayers: copy.stepPlayers,
        stepConfig: copy.stepConfig,
        stepTeams: copy.stepTeams,
        stepBracket: copy.stepBracket,
      }}
    />
  );

  if (step === 'welcome') {
    return (
      <LanguageProvider language={language}>
        <>
          <WelcomeScreen
            language={language}
            savedTournament={savedTournament}
            savedTournaments={savedTournaments}
            onNewTournament={handleNewTournament}
            onResumeTournament={handleResumeTournament}
            onLoadSavedTournament={handleLoadSavedTournament}
            onToggleLanguage={handleToggleLanguage}
          />
        </>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider language={language}>
      <div
        className="min-h-screen relative overflow-hidden text-white"
        style={{
          background: '#020B1F',
        }}
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 z-0 bg-slate-950/18" />

        <div className="relative z-10 container mx-auto max-w-7xl px-2 py-2 sm:px-4 sm:py-4">
          <div className="mb-3 hidden text-center sm:mb-4 sm:block">
            <h1 className="mb-1 flex flex-col items-center justify-center gap-2 text-center text-[clamp(1.35rem,1.05rem+1.35vw,1.95rem)] font-bold font-heading sm:flex-row sm:gap-2.5">
              <Gamepad2 className="h-[clamp(1.3rem,1.1rem+0.75vw,1.8rem)] w-[clamp(1.3rem,1.1rem+0.75vw,1.8rem)] text-primary" />
              <span className="text-balance">{copy.title}</span>
            </h1>
            <p className="text-[clamp(0.76rem,0.72rem+0.14vw,0.9rem)] text-muted-foreground">{copy.description}</p>
          </div>

        <div className="mb-3 hidden items-center justify-center gap-1.5 sm:mb-4 sm:flex sm:gap-2">
          <StepIndicator active={step === 'players'} completed={['config', 'teams', 'bracket'].includes(step)} label="1" text={copy.stepPlayers} />
          <div className={`h-px w-8 ${['config', 'teams', 'bracket'].includes(step) ? 'bg-primary/75' : 'bg-white/16'}`} />
          <StepIndicator active={step === 'config'} completed={['teams', 'bracket'].includes(step)} label="2" text={copy.stepConfig} />
          <div className={`h-px w-8 ${['teams', 'bracket'].includes(step) ? 'bg-primary/75' : 'bg-white/16'}`} />
          <StepIndicator active={step === 'teams'} completed={step === 'bracket'} label="3" text={copy.stepTeams} />
          <div className={`h-px w-8 ${step === 'bracket' ? 'bg-primary/75' : 'bg-white/16'}`} />
          <StepIndicator active={step === 'bracket'} completed={false} label="4" text={copy.stepBracket} />
        </div>

        <div className="glass-card flex min-h-[calc(100dvh-1rem)] flex-col items-stretch overflow-hidden sm:min-h-0">
          {step === 'players' && (
            <PlayerSetup onComplete={handlePlayersComplete} onBack={handleBack} initialPlayers={players} mobileStepProgress={mobileStepProgress} />
          )}

          {step === 'config' && (
            <ConfigSetup
              playerCount={players.length}
              onComplete={handleConfigComplete}
              onBack={handleBack}
              initialConfig={config || undefined}
              mobileStepProgress={mobileStepProgress}
            />
          )}

          {step === 'teams' && config && (
            <TeamSetup
              players={players}
              config={config}
              onComplete={handleTeamsComplete}
              onBack={handleBack}
              initialTeams={teams}
              mobileStepProgress={mobileStepProgress}
            />
          )}

          {step === 'bracket' && tournament && (
            <TournamentBracket
              tournament={tournament}
              onMatchResult={handleMatchResult}
              onReplay={handleReplayTournament}
              onReset={handleReset}
              onBack={handleBack}
              onSaveTournament={handleSaveNamedTournament}
              currentSavedTournamentName={currentSavedTournament?.name ?? null}
              currentSavedTournamentStatus={currentSavedTournament?.status ?? null}
              currentSavedTournamentSavedAt={currentSavedTournament?.savedAt ?? null}
              currentSavedTournamentTeamMode={currentSavedTournament?.config?.teamMode ?? null}
              currentSavedTournamentType={currentSavedTournament?.config?.type ?? null}
              saveFeedbackToken={manualSaveFeedbackToken}
              mobileStepProgress={mobileStepProgress}
            />
          )}
        </div>
        </div>
        {import.meta.env.DEV && DEV_PREVIEW_ENABLED && (
          <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 rounded-2xl border border-cyan-200/30 bg-black/35 p-3 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">{copy.devPreview}</div>
            <button
              onClick={() => handleDevPreview('players')}
              className="rounded-full border border-white/20 px-3 py-2 text-left text-xs text-white transition hover:bg-white/10"
            >
              {copy.goToPlayers}
            </button>
            <button
              onClick={() => handleDevPreview('config')}
              className="rounded-full border border-white/20 px-3 py-2 text-left text-xs text-white transition hover:bg-white/10"
            >
              {copy.goToConfig}
            </button>
            <button
              onClick={() => handleDevPreview('teams')}
              className="rounded-full border border-white/20 px-3 py-2 text-left text-xs text-white transition hover:bg-white/10"
            >
              {copy.goToTeams}
            </button>
            <button
              onClick={() => handleDevPreview('bracket')}
              className="rounded-full border border-white/20 px-3 py-2 text-left text-xs text-white transition hover:bg-white/10"
            >
              {copy.goToBracket}
            </button>
          </div>
        )}

        <TournamentPasswordDialog
          open={passwordDialog.open}
          mode={passwordDialog.mode}
          tournamentName={passwordDialog.tournamentName}
          language={language}
          errorMessage={passwordDialog.errorMessage}
          submitting={passwordDialog.submitting}
          onSubmit={handlePasswordDialogSubmit}
          onCancel={closePasswordDialog}
        />

        <Dialog open={Boolean(flowErrorMessage)} onOpenChange={(open) => !open && setFlowErrorMessage(null)}>
          <DialogContent className="max-w-[calc(100%-1.5rem)] border-amber-200/28 bg-[linear-gradient(180deg,rgba(8,18,46,0.96)_0%,rgba(6,14,34,0.98)_100%)] text-white shadow-[0_0_44px_rgba(46,131,255,0.14)] sm:max-w-md">
            <DialogHeader className="text-left">
              <DialogTitle className="text-white">{copy.flowErrorTitle}</DialogTitle>
              <DialogDescription className="max-w-[34ch] text-white/72">
                {flowErrorMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setFlowErrorMessage(null)}
                className="h-11 w-full rounded-[14px] border border-amber-200/60 bg-primary text-primary-foreground shadow-[0_0_24px_rgba(245,180,76,0.22)] hover:shadow-[0_0_34px_rgba(245,180,76,0.3)] sm:w-auto"
              >
                {copy.flowErrorAction}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
    </LanguageProvider>
  );
}

function StepIndicator({ active, completed, label, text }: { active: boolean; completed: boolean; label: string; text: string }) {
  return (
    <div
      className={`flex h-9 min-w-[7rem] items-center gap-2 rounded-[10px] border px-2.5 text-[11px] font-bold uppercase tracking-[0.08em]
        ${completed ? 'border-primary/45 bg-primary/18 text-amber-50' : ''}
        ${active && !completed ? 'border-primary/65 bg-primary text-primary-foreground shadow-[0_0_18px_rgba(245,180,76,0.18)]' : ''}
        ${!active && !completed ? 'border-white/12 bg-white/5 text-white/46' : ''}
      `}
    >
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${completed ? 'bg-primary text-primary-foreground' : active ? 'bg-black/12' : 'bg-white/8'}`}>
        {completed ? <Check className="h-3.5 w-3.5" /> : label}
      </span>
      <span>{text}</span>
    </div>
  );
}

function MobileStepIndicator({ active, completed }: { active: boolean; completed: boolean }) {
  return (
    <div
      className={`h-2.5 w-2.5 rounded-full border transition-all
        ${completed ? 'border-primary bg-primary shadow-[0_0_10px_rgba(245,180,76,0.22)]' : ''}
        ${active && !completed ? 'w-5 border-primary bg-primary shadow-[0_0_14px_rgba(245,180,76,0.32)]' : ''}
        ${!active && !completed ? 'border-white/20 bg-white/12' : ''}
      `}
      aria-hidden="true"
    />
  );
}

function MobileStepProgress({
  currentStep,
  copy,
}: {
  currentStep: Step;
  copy: {
    stepPlayers: string;
    stepConfig: string;
    stepTeams: string;
    stepBracket: string;
  };
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-[10px] border border-white/10 bg-black/10 px-3 py-2 sm:hidden">
      <div className="flex items-center justify-center gap-1.5">
        <MobileStepIndicator active={currentStep === 'players'} completed={['config', 'teams', 'bracket'].includes(currentStep)} />
        <div className={`h-px w-4 rounded-full ${['config', 'teams', 'bracket'].includes(currentStep) ? 'bg-primary/80' : 'bg-white/16'}`} />
        <MobileStepIndicator active={currentStep === 'config'} completed={['teams', 'bracket'].includes(currentStep)} />
        <div className={`h-px w-4 rounded-full ${['teams', 'bracket'].includes(currentStep) ? 'bg-primary/80' : 'bg-white/16'}`} />
        <MobileStepIndicator active={currentStep === 'teams'} completed={currentStep === 'bracket'} />
        <div className={`h-px w-4 rounded-full ${currentStep === 'bracket' ? 'bg-primary/80' : 'bg-white/16'}`} />
        <MobileStepIndicator active={currentStep === 'bracket'} completed={false} />
      </div>
      <div className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/56">
        {currentStep === 'players' && copy.stepPlayers}
        {currentStep === 'config' && copy.stepConfig}
        {currentStep === 'teams' && copy.stepTeams}
        {currentStep === 'bracket' && copy.stepBracket}
      </div>
    </div>
  );
}

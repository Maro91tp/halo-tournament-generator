import { useState, useEffect } from 'react';
import { Check, Gamepad2 } from 'lucide-react';
import type { Player, Team, Tournament, TournamentConfig, SeriesScore, Game } from '../types/tournament';
import PlayerSetup from './PlayerSetup';
import ConfigSetup from './ConfigSetup';
import TeamSetup from './TeamSetup';
import TournamentBracket from './TournamentBracket';
import WelcomeScreen from './WelcomeScreen';
import LanguageToggle from './LanguageToggle';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { LanguageProvider } from './LanguageContext';
import { generateTournament, updateMatchResult } from '../lib/tournament-utils';
import {
  saveTournamentState,
  loadTournamentState,
  clearTournamentState,
  hasSavedTournament,
  deleteSavedTournamentRecord,
  listSavedTournamentRecords,
  loadSavedTournamentRecord,
  saveNamedTournament,
  type SavedTournamentRecord,
} from '../lib/tournament-storage';
import { LANGUAGE_STORAGE_KEY, type Language } from '../lib/language';
import { isSupabaseConfigured } from '../lib/supabase';
import { listTournamentRecordsFromSupabase, loadTournamentRecordFromSupabase } from '../lib/supabase-storage';
import { APP_VERSION_LABEL } from '../lib/app-version';

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
        version: 'Versione',
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
        version: 'Version',
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

      try {
        const remoteRecords = await listTournamentRecordsFromSupabase();
        if (!cancelled) {
          setSavedTournaments(remoteRecords);
        }
      } catch {
        if (!cancelled) {
          setSavedTournaments(listSavedTournamentRecords());
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

    const existingRecord = loadSavedTournamentRecord(currentSavedTournamentId);
    if (!existingRecord) {
      setCurrentSavedTournamentId(null);
      return;
    }

    const updatedRecord = saveNamedTournament({
      id: existingRecord.id,
      name: existingRecord.name,
      step: step === 'welcome' ? 'players' : step,
      players,
      config,
      teams,
      tournament,
      touchSavedAt: false,
    });

    setSavedTournaments(listSavedTournamentRecords());
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
    setStep(saved.step === 'welcome' ? 'players' : saved.step);
  };

  const handleLoadSavedTournament = async (id: string) => {
    let saved = isSupabaseConfigured
      ? await loadTournamentRecordFromSupabase(id)
      : loadSavedTournamentRecord(id);

    if (!saved && isSupabaseConfigured) {
      deleteSavedTournamentRecord(id);
      setSavedTournaments(await listTournamentRecordsFromSupabase().catch(() => listSavedTournamentRecords()));
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
    setSavedTournaments(listSavedTournamentRecords());
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

  const handleSaveNamedTournament = (name: string) => {
    if (step === 'welcome') return;

    const savedRecord = saveNamedTournament({
      id: currentSavedTournamentId,
      name,
      step,
      players,
      config,
      teams,
      tournament,
    });

    setCurrentSavedTournamentId(savedRecord.id);
    setSavedTournaments(listSavedTournamentRecords());
    setManualSaveFeedbackToken(`${savedRecord.id}:${savedRecord.savedAt}`);
  };

  const currentSavedTournament = currentSavedTournamentId
    ? savedTournaments.find((record) => record.id === currentSavedTournamentId) ?? null
    : null;

  if (step === 'welcome') {
    return (
      <LanguageProvider language={language}>
        <>
          <LanguageToggle language={language} onToggle={handleToggleLanguage} />
          <WelcomeScreen
            language={language}
            savedTournament={savedTournament}
            savedTournaments={savedTournaments}
            onNewTournament={handleNewTournament}
            onResumeTournament={handleResumeTournament}
            onLoadSavedTournament={handleLoadSavedTournament}
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

        <div className="relative z-10 container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-8">
          <LanguageToggle language={language} onToggle={handleToggleLanguage} />

          <div className="mb-6 text-center sm:mb-8">
            <h1 className="mb-2 flex flex-col items-center justify-center gap-2 text-center text-[clamp(1.65rem,1.25rem+1.9vw,2.35rem)] font-bold font-heading sm:flex-row sm:gap-3">
              <Gamepad2 className="h-[clamp(1.6rem,1.35rem+1vw,2.2rem)] w-[clamp(1.6rem,1.35rem+1vw,2.2rem)] text-primary" />
              <span className="text-balance">{copy.title}</span>
            </h1>
            <p className="text-[clamp(0.82rem,0.78rem+0.18vw,1rem)] text-muted-foreground">{copy.description}</p>
          </div>

        <div className="mb-6 flex items-center justify-center gap-1.5 sm:mb-8 sm:gap-2">
          <StepIndicator active={step === 'players'} completed={['config', 'teams', 'bracket'].includes(step)} label="1" />
          <div className={`h-1 w-7 sm:w-12 ${['config', 'teams', 'bracket'].includes(step) ? 'bg-primary' : 'bg-muted'}`} />
          <StepIndicator active={step === 'config'} completed={['teams', 'bracket'].includes(step)} label="2" />
          <div className={`h-1 w-7 sm:w-12 ${['teams', 'bracket'].includes(step) ? 'bg-primary' : 'bg-muted'}`} />
          <StepIndicator active={step === 'teams'} completed={step === 'bracket'} label="3" />
          <div className={`h-1 w-7 sm:w-12 ${step === 'bracket' ? 'bg-primary' : 'bg-muted'}`} />
          <StepIndicator active={step === 'bracket'} completed={false} label="4" />
        </div>

        <div className="glass-card flex items-center justify-center overflow-hidden">
          {step === 'players' && (
            <PlayerSetup onComplete={handlePlayersComplete} onBack={handleBack} initialPlayers={players} />
          )}

          {step === 'config' && (
            <ConfigSetup
              playerCount={players.length}
              onComplete={handleConfigComplete}
              onBack={handleBack}
              initialConfig={config || undefined}
            />
          )}

          {step === 'teams' && config && (
            <TeamSetup
              players={players}
              config={config}
              onComplete={handleTeamsComplete}
              onBack={handleBack}
              initialTeams={teams}
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
        <div className="pointer-events-none fixed bottom-3 left-3 z-20 text-[10px] font-medium tracking-[0.08em] text-white/38 sm:bottom-4 sm:left-4 sm:text-[11px]">
          {copy.version} {APP_VERSION_LABEL}
        </div>
        </div>
    </LanguageProvider>
  );
}

function StepIndicator({ active, completed, label }: { active: boolean; completed: boolean; label: string }) {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold sm:h-10 sm:w-10 sm:text-sm
        ${completed ? 'bg-primary text-primary-foreground' : ''}
        ${active && !completed ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : ''}
        ${!active && !completed ? 'bg-muted text-muted-foreground' : ''}
      `}
    >
      {completed ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : label}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Check, Gamepad2 } from 'lucide-react';
import type { Player, Team, Tournament, TournamentConfig, SeriesScore, Game } from '../types/tournament';
import PlayerSetup from './PlayerSetup';
import ConfigSetup from './ConfigSetup';
import TeamSetup from './TeamSetup';
import TournamentBracket from './TournamentBracket';
import WelcomeScreen from './WelcomeScreen';
import AutoSaveIndicator from './AutoSaveIndicator';
import { generateTournament, updateMatchResult } from '../lib/tournament-utils';
import {
  saveTournamentState,
  loadTournamentState,
  clearTournamentState,
  hasSavedTournament,
} from '../lib/tournament-storage';

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
  const [step, setStep] = useState<Step>('welcome');
  const [players, setPlayers] = useState<Player[]>([]);
  const [config, setConfig] = useState<TournamentConfig | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [savedTournament, setSavedTournament] = useState<ReturnType<typeof loadTournamentState>>(null);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();

  useEffect(() => {
    if (hasSavedTournament()) {
      const saved = loadTournamentState();
      setSavedTournament(saved);

      if (saved) {
        setPlayers(saved.players);
        setConfig(saved.config);
        setTeams(saved.teams);
        setTournament(saved.tournament);
        setStep(saved.step);
      }
    }
  }, []);

  useEffect(() => {
    if (step !== 'welcome') {
      saveTournamentState(step, players, config, teams, tournament);
      setLastSaved(new Date());
    }
  }, [tournament, step, config, players, teams]);

  const handleNewTournament = () => {
    clearTournamentState();
    setSavedTournament(null);
    setStep('players');
    setPlayers([]);
    setConfig(null);
    setTeams([]);
    setTournament(null);
  };

  const handleResumeTournament = () => {
    const saved = loadTournamentState();
    if (saved) {
      setPlayers(saved.players);
      setConfig(saved.config);
      setTeams(saved.teams);
      setTournament(saved.tournament);
      setStep('bracket');
    }
  };

  const handlePlayersComplete = (completedPlayers: Player[]) => {
    setPlayers(completedPlayers);
    setStep('config');
  };

  const handleConfigComplete = (completedConfig: TournamentConfig) => {
    setConfig(completedConfig);
    setStep('teams');
  };

  const handleTeamsComplete = (completedTeams: Team[]) => {
    setTeams(completedTeams);

    if (config) {
      const newTournament = generateTournament(completedTeams, config);
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
    setStep('welcome');
    setPlayers([]);
    setConfig(null);
    setTeams([]);
    setTournament(null);
  };

  const handleReplayTournament = () => {
    if (!config || teams.length === 0) return;

    const replayTournament = generateTournament(teams, config);
    setTournament(replayTournament);
    setStep('bracket');
  };

  const handleBack = () => {
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

    setTournament(generateTournament(DEV_TEAMS, DEV_CONFIG));
    setStep('bracket');
  };

  if (step === 'welcome') {
    return (
      <WelcomeScreen
        savedTournament={savedTournament}
        onNewTournament={handleNewTournament}
        onResumeTournament={handleResumeTournament}
      />
    );
  }

  return (
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
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="mb-2 flex flex-col items-center justify-center gap-2 text-center text-[clamp(1.65rem,1.25rem+1.9vw,2.35rem)] font-bold font-heading sm:flex-row sm:gap-3">
            <Gamepad2 className="h-[clamp(1.6rem,1.35rem+1vw,2.2rem)] w-[clamp(1.6rem,1.35rem+1vw,2.2rem)] text-primary" />
            <span className="text-balance">Halo Tournament Generator</span>
          </h1>
          <p className="text-[clamp(0.82rem,0.78rem+0.18vw,1rem)] text-muted-foreground">Crea tornei competitivi di Halo Infinite</p>
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
            />
          )}
        </div>
      </div>

      <AutoSaveIndicator lastSaved={lastSaved} />
      {import.meta.env.DEV && DEV_PREVIEW_ENABLED && (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 rounded-2xl border border-cyan-200/30 bg-black/35 p-3 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Dev Preview</div>
          <button
            onClick={() => handleDevPreview('players')}
            className="rounded-full border border-white/20 px-3 py-2 text-left text-xs text-white transition hover:bg-white/10"
          >
            Vai a Players
          </button>
          <button
            onClick={() => handleDevPreview('config')}
            className="rounded-full border border-white/20 px-3 py-2 text-left text-xs text-white transition hover:bg-white/10"
          >
            Vai a Config
          </button>
          <button
            onClick={() => handleDevPreview('teams')}
            className="rounded-full border border-white/20 px-3 py-2 text-left text-xs text-white transition hover:bg-white/10"
          >
            Vai a Teams
          </button>
          <button
            onClick={() => handleDevPreview('bracket')}
            className="rounded-full border border-white/20 px-3 py-2 text-left text-xs text-white transition hover:bg-white/10"
          >
            Vai a Bracket
          </button>
        </div>
      )}
    </div>
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

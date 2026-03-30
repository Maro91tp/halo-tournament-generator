import { useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Dice3, FileText, Settings2, Shield, Target, TriangleAlert, Trophy, Users2 } from 'lucide-react';
import type { TournamentConfig, TeamMode, TeamCreationMode } from '../types/tournament';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { validatePlayerCount } from '../lib/tournament-utils';
import { ModeIcon } from './TournamentIcons';

interface ConfigSetupProps {
  playerCount: number;
  onComplete: (config: TournamentConfig) => void;
  onBack: () => void;
  initialConfig?: TournamentConfig;
}

export default function ConfigSetup({ playerCount, onComplete, onBack, initialConfig }: ConfigSetupProps) {
  const defaultConfig: TournamentConfig = {
    type: 'slayer',
    teamMode: '2v2',
    matchDuration: 'single',
    teamCreationMode: 'automatic',
    killLimit: 50,
  };

  const [config, setConfig] = useState<TournamentConfig>(
    initialConfig ? { ...defaultConfig, ...initialConfig } : defaultConfig
  );

  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!validatePlayerCount(playerCount, config.teamMode)) {
      const teamSize = parseInt(config.teamMode.charAt(0));
      setError(
        `Il numero di giocatori (${playerCount}) non e compatibile con la modalita ${config.teamMode}. ` +
        `Serve un numero di giocatori divisibile per ${teamSize} e almeno ${teamSize * 2} giocatori.`
      );
      return;
    }

    setError('');
    onComplete(config);
  };

  const updateConfig = <K extends keyof TournamentConfig>(key: K, value: TournamentConfig[K]) => {
    setConfig({ ...config, [key]: value });
    setError('');
  };

  return (
    <div className="app-section flex w-full flex-col">
      <div>
        <h2 className="app-title mb-3 flex items-center gap-2.5 font-bold font-heading sm:gap-3">
          <Settings2 className="h-[var(--app-icon-lg)] w-[var(--app-icon-lg)] text-primary" />
          <span>Configurazione Torneo</span>
        </h2>
        <p className="app-subtitle mb-5 text-muted-foreground sm:mb-6">
          Scegli il tipo di torneo e le modalita di gioco
        </p>
      </div>

      <div>
        <Label className="mb-3 block text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] font-semibold">Tipo di torneo</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <OptionCard
            selected={config.type === 'slayer'}
            onClick={() => updateConfig('type', 'slayer')}
            icon={<ModeIcon mode="slayer" className="h-4 w-4" />}
            title="Slayer"
            description="Modalita Massacro classica"
          />
          <OptionCard
            selected={config.type === 'ranked'}
            onClick={() => updateConfig('type', 'ranked')}
            icon={<Trophy className="h-4 w-4 text-primary" />}
            title="Ranked"
            description="Mix di modalita competitive"
          />
        </div>
      </div>

      <div>
        <Label className="mb-3 block text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] font-semibold">Modalita squadra</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['1v1', '2v2', '3v3', '4v4'] as TeamMode[]).map((mode) => (
            <OptionCard
              key={mode}
              selected={config.teamMode === mode}
              onClick={() => updateConfig('teamMode', mode)}
              title={mode}
              compact
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-3 block text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] font-semibold">Durata match</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <OptionCard
            selected={config.matchDuration === 'single'}
            onClick={() => updateConfig('matchDuration', 'single')}
            title="Partita secca"
            description="Una sola partita"
          />
          <OptionCard
            selected={config.matchDuration === 'bo3'}
            onClick={() => updateConfig('matchDuration', 'bo3')}
            title="Best of 3"
            description="Al meglio di 3"
          />
          <OptionCard
            selected={config.matchDuration === 'bo5'}
            onClick={() => updateConfig('matchDuration', 'bo5')}
            title="Best of 5"
            description="Al meglio di 5"
          />
        </div>
      </div>

      <div>
        <Label className="mb-3 block text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] font-semibold">Limite kill Slayer</Label>
        <div className="glass-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[clamp(0.95rem,0.9rem+0.25vw,1.05rem)] font-semibold">
                <Target className="h-4 w-4 text-primary" />
                <span>{config.killLimit} kill</span>
              </div>
              <p className="mt-1 text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] text-muted-foreground">
                Valido per tutti i game Slayer, anche dentro i tornei Ranked.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[25, 50, 75, 100].map((limit) => (
                <Button
                  key={limit}
                  type="button"
                  variant={config.killLimit === limit ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateConfig('killLimit', limit)}
                >
                  {limit}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label className="mb-3 block text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] font-semibold">Modalita creazione squadre</Label>
        <p className="mb-4 max-w-2xl text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] text-muted-foreground">
          Decidi quanto controllo vuoi avere sulla composizione delle squadre prima di generare il torneo.
        </p>
        <RadioGroup
          value={config.teamCreationMode}
          onValueChange={(value) => updateConfig('teamCreationMode', value as TeamCreationMode)}
          className="grid gap-4 md:grid-cols-3"
        >
          <TeamCreationCard
            id="auto"
            value="automatic"
            selected={config.teamCreationMode === 'automatic'}
            icon={Users2}
            title="Bilanciate"
            description="Squadre generate automaticamente in modo equilibrato"
            detail="Ideale per partire subito con team competitivi."
          />
          <TeamCreationCard
            id="random"
            value="random"
            selected={config.teamCreationMode === 'random'}
            icon={Dice3}
            title="Casuali"
            description="Giocatori distribuiti casualmente nelle squadre"
            detail="Perfetto per lobby veloci e meno prevedibili."
          />
          <TeamCreationCard
            id="manual"
            value="manual"
            selected={config.teamCreationMode === 'manual'}
            icon={Shield}
            title="Manuali"
            description="Scegli tu i giocatori per ogni squadra"
            detail="Massimo controllo per test, scrim o partite custom."
          />
        </RadioGroup>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="flex items-center gap-2 text-[clamp(0.8rem,0.76rem+0.2vw,0.94rem)] font-medium text-destructive">
            <TriangleAlert className="h-4 w-4" />
            <span>{error}</span>
          </p>
        </div>
      )}

      <div className="glass-card rounded-[18px] p-3.5 sm:rounded-[24px] sm:p-4">
        <h3 className="mb-2 flex items-center gap-2 font-semibold">
          <FileText className="h-4 w-4 text-primary" />
          <span>Riepilogo</span>
        </h3>
        <ul className="space-y-1 text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] text-muted-foreground">
          <li>{playerCount} giocatori totali</li>
          <li>Modalita: {config.type === 'slayer' ? 'Slayer' : 'Ranked'}</li>
          <li>Squadre: {config.teamMode}</li>
          <li>Limite kill: {config.killLimit}</li>
          <li>{Math.floor(playerCount / parseInt(config.teamMode.charAt(0)))} squadre</li>
        </ul>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
        <Button onClick={onBack} variant="ghost" size="lg" className="w-full text-white/65 hover:text-white sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Indietro
        </Button>
        <Button onClick={handleSubmit} size="lg" className="w-full shadow-[0_0_28px_rgba(100,180,255,0.3)] hover:shadow-[0_0_38px_rgba(100,180,255,0.4)] sm:min-w-44 sm:w-auto">
          Continua
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  compact?: boolean;
  icon?: ReactNode;
}

function OptionCard({ selected, onClick, title, description, compact, icon }: OptionCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer rounded-[18px] p-4 transition-all hover:scale-[1.01] sm:rounded-[24px] sm:p-6 ${
        selected
          ? 'border-primary border-2 ring-2 ring-primary/20'
          : 'border-border hover:border-primary/50'
      } ${compact ? 'text-center' : ''}`}
    >
      <h3 className={`font-semibold ${compact ? 'text-[clamp(0.82rem,0.78rem+0.18vw,1rem)] sm:text-base' : 'mb-1 text-[clamp(0.95rem,0.9rem+0.25vw,1.1rem)] sm:text-lg'} ${icon ? 'flex items-center gap-2' : ''}`}>
        {icon}
        <span>{title}</span>
      </h3>
      {description && <p className="text-[clamp(0.72rem,0.69rem+0.15vw,0.88rem)] text-muted-foreground sm:text-sm">{description}</p>}
    </Card>
  );
}

interface TeamCreationCardProps {
  id: string;
  value: TeamCreationMode;
  selected: boolean;
  title: string;
  description: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

function TeamCreationCard({ id, value, selected, title, description, detail, icon: Icon }: TeamCreationCardProps) {
  return (
    <Label
      htmlFor={id}
      className={`glass-card flex min-h-[160px] cursor-pointer flex-col justify-between rounded-[18px] p-4 sm:min-h-[210px] sm:rounded-[24px] sm:p-6 transition-all ${
        selected
          ? 'border-primary ring-2 ring-primary/25 shadow-[0_0_0_1px_rgba(255,255,255,0.3),0_0_35px_rgba(100,180,255,0.2)]'
          : 'hover:border-primary/50 hover:shadow-[0_0_24px_rgba(100,180,255,0.14)]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border sm:h-10 sm:w-10 ${
              selected ? 'border-primary bg-primary/15' : 'border-white/20 bg-white/5'
            }`}>
              <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            </div>
            <div className="text-[clamp(0.95rem,0.9rem+0.25vw,1.1rem)] font-semibold sm:text-lg">{title}</div>
          </div>
          <p className="text-[clamp(0.72rem,0.69rem+0.15vw,0.88rem)] leading-relaxed text-muted-foreground sm:text-sm">{description}</p>
        </div>
        <RadioGroupItem value={value} id={id} className="mt-1" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground sm:px-4 sm:py-3 sm:text-xs">
        {detail}
      </div>
    </Label>
  );
}

import { useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Dice3, FileText, Settings2, Shield, Target, TriangleAlert, Trophy, Users2 } from 'lucide-react';
import { SLAYER_MAPS, type TournamentConfig, type TeamMode, type TeamCreationMode } from '../types/tournament';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { validatePlayerCount } from '../lib/tournament-utils';
import { ModeIcon } from './TournamentIcons';
import { useLanguage } from './LanguageContext';

interface ConfigSetupProps {
  playerCount: number;
  onComplete: (config: TournamentConfig) => void;
  onBack: () => void;
  initialConfig?: TournamentConfig;
}

export default function ConfigSetup({ playerCount, onComplete, onBack, initialConfig }: ConfigSetupProps) {
  const language = useLanguage();
  const defaultConfig: TournamentConfig = {
    type: 'slayer',
    teamMode: '2v2',
    matchDuration: 'single',
    teamCreationMode: 'automatic',
    killLimit: 50,
    selectedSlayerMaps: [...SLAYER_MAPS],
  };

  const [config, setConfig] = useState<TournamentConfig>(
    initialConfig ? { ...defaultConfig, ...initialConfig } : defaultConfig
  );

  const [error, setError] = useState('');
  const copy = language === 'en'
    ? {
        title: 'Tournament Setup',
        subtitle: 'Choose the tournament type and game settings',
        tournamentType: 'Tournament type',
        slayerDescription: 'Classic Slayer mode',
        rankedDescription: 'Competitive mode mix',
        teamMode: 'Team mode',
        matchDuration: 'Match duration',
        single: 'Single game',
        singleDescription: 'One game only',
        bo3Description: 'Best of 3',
        bo5Description: 'Best of 5',
        killLimit: 'Slayer kill limit',
        killLabel: 'kills',
        killHelp: 'Used for every Slayer game, including Ranked tournaments.',
        slayerMaps: 'Slayer map pool',
        slayerMapsHelp: 'Choose the maps available for Slayer tournaments. If you leave more than one active, the app will rotate them from your selected pool.',
        mapsSelected: 'maps selected',
        allMaps: 'All maps',
        teamCreation: 'Team creation mode',
        teamCreationHelp: 'Decide how much control you want over team composition before generating the tournament.',
        balanced: 'Balanced',
        balancedDescription: 'Teams generated automatically with balanced strength',
        balancedDetail: 'Best when you want competitive teams right away.',
        random: 'Random',
        randomDescription: 'Players distributed randomly across teams',
        randomDetail: 'Great for quick and less predictable lobbies.',
        manual: 'Manual',
        manualDescription: 'Pick the players for each team yourself',
        manualDetail: 'Maximum control for tests, scrims, or custom matches.',
        summary: 'Summary',
        totalPlayers: `${playerCount} total players`,
        mode: 'Mode',
        teams: 'Teams',
        killSummary: 'Kill limit',
        slayerTitle: 'Slayer',
        rankedTitle: 'Ranked',
        bo3Title: 'Best of 3',
        bo5Title: 'Best of 5',
        teamCount: 'teams',
        back: 'Back',
        continue: 'Continue',
      }
    : {
        title: 'Configurazione Torneo',
        subtitle: 'Scegli il tipo di torneo e le modalita di gioco',
        tournamentType: 'Tipo di torneo',
        slayerDescription: 'Modalita Massacro classica',
        rankedDescription: 'Mix di modalita competitive',
        teamMode: 'Modalita squadra',
        matchDuration: 'Durata match',
        single: 'Partita secca',
        singleDescription: 'Una sola partita',
        bo3Description: 'Al meglio di 3',
        bo5Description: 'Al meglio di 5',
        killLimit: 'Limite kill Slayer',
        killLabel: 'kill',
        killHelp: 'Valido per tutti i game Slayer, anche dentro i tornei Ranked.',
        slayerMaps: 'Pool mappe Slayer',
        slayerMapsHelp: 'Scegli le mappe disponibili per i tornei Massacro. Se ne lasci attiva piu di una, l app ruotera solo nella pool selezionata.',
        mapsSelected: 'mappe selezionate',
        allMaps: 'Tutte le mappe',
        teamCreation: 'Modalita creazione squadre',
        teamCreationHelp: 'Decidi quanto controllo vuoi avere sulla composizione delle squadre prima di generare il torneo.',
        balanced: 'Bilanciate',
        balancedDescription: 'Squadre generate automaticamente in modo equilibrato',
        balancedDetail: 'Ideale per partire subito con team competitivi.',
        random: 'Casuali',
        randomDescription: 'Giocatori distribuiti casualmente nelle squadre',
        randomDetail: 'Perfetto per lobby veloci e meno prevedibili.',
        manual: 'Manuali',
        manualDescription: 'Scegli tu i giocatori per ogni squadra',
        manualDetail: 'Massimo controllo per test, scrim o partite custom.',
        summary: 'Riepilogo',
        totalPlayers: `${playerCount} giocatori totali`,
        mode: 'Modalita',
        teams: 'Squadre',
        killSummary: 'Limite kill',
        slayerTitle: 'Slayer',
        rankedTitle: 'Ranked',
        bo3Title: 'Best of 3',
        bo5Title: 'Best of 5',
        teamCount: 'squadre',
        back: 'Indietro',
        continue: 'Continua',
      };

  const handleSubmit = () => {
    if (!validatePlayerCount(playerCount, config.teamMode)) {
      const teamSize = parseInt(config.teamMode.charAt(0));
      setError(
        language === 'en'
          ? `The player count (${playerCount}) is not compatible with ${config.teamMode}. You need a number divisible by ${teamSize} and at least ${teamSize * 2} players.`
          : `Il numero di giocatori (${playerCount}) non e compatibile con la modalita ${config.teamMode}. Serve un numero di giocatori divisibile per ${teamSize} e almeno ${teamSize * 2} giocatori.`
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

  const toggleSlayerMap = (mapName: string) => {
    const hasMap = config.selectedSlayerMaps.includes(mapName);
    const nextMaps = hasMap
      ? config.selectedSlayerMaps.filter((map) => map !== mapName)
      : [...config.selectedSlayerMaps, mapName];

    updateConfig('selectedSlayerMaps', nextMaps.length > 0 ? nextMaps : [mapName]);
  };

  const sectionTitleClass = 'mb-3 block text-[clamp(1.05rem,1rem+0.42vw,1.28rem)] font-bold tracking-[0.01em] text-white sm:mb-4';

  return (
    <div className="app-section flex w-full flex-col">
      <div>
        <h2 className="app-title mb-3 flex items-center gap-2.5 font-bold font-heading sm:gap-3">
          <Settings2 className="h-[var(--app-icon-lg)] w-[var(--app-icon-lg)] text-primary" />
          <span>{copy.title}</span>
        </h2>
        <p className="app-subtitle mb-5 text-muted-foreground sm:mb-6">
          {copy.subtitle}
        </p>
      </div>

      <div>
        <Label className={sectionTitleClass}>{copy.tournamentType}</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <OptionCard
            selected={config.type === 'slayer'}
            onClick={() => updateConfig('type', 'slayer')}
            icon={<ModeIcon mode="slayer" className="h-4 w-4" />}
            title={copy.slayerTitle}
            description={copy.slayerDescription}
          />
          <OptionCard
            selected={config.type === 'ranked'}
            onClick={() => updateConfig('type', 'ranked')}
            icon={<Trophy className="h-4 w-4 text-primary" />}
            title={copy.rankedTitle}
            description={copy.rankedDescription}
          />
        </div>
      </div>

      <div>
        <Label className={sectionTitleClass}>{copy.teamMode}</Label>
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
        <Label className={sectionTitleClass}>{copy.matchDuration}</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <OptionCard
            selected={config.matchDuration === 'single'}
            onClick={() => updateConfig('matchDuration', 'single')}
            title={copy.single}
            description={copy.singleDescription}
          />
          <OptionCard
            selected={config.matchDuration === 'bo3'}
            onClick={() => updateConfig('matchDuration', 'bo3')}
            title={copy.bo3Title}
            description={copy.bo3Description}
          />
          <OptionCard
            selected={config.matchDuration === 'bo5'}
            onClick={() => updateConfig('matchDuration', 'bo5')}
            title={copy.bo5Title}
            description={copy.bo5Description}
          />
        </div>
      </div>

      <div>
        <Label className={sectionTitleClass}>{copy.killLimit}</Label>
        <div className="glass-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[clamp(0.95rem,0.9rem+0.25vw,1.05rem)] font-semibold">
                <Target className="h-4 w-4 text-primary" />
                <span>{config.killLimit} {copy.killLabel}</span>
              </div>
              <p className="mt-1 text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] text-muted-foreground">
                {copy.killHelp}
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

      {config.type === 'slayer' && (
        <div className="pb-2 sm:pb-3">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <Label className={sectionTitleClass}>{copy.slayerMaps}</Label>
              <p className="max-w-3xl text-[clamp(0.76rem,0.73rem+0.16vw,0.9rem)] text-muted-foreground">
                {copy.slayerMapsHelp}
              </p>
            </div>
            <div className="text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] font-medium text-white/78">
              {config.selectedSlayerMaps.length}/{SLAYER_MAPS.length} {copy.mapsSelected}
            </div>
          </div>

          <div className="glass-card p-4 sm:p-6">
            <div className="flex flex-wrap gap-2.5">
              {SLAYER_MAPS.map((mapName) => {
                const selected = config.selectedSlayerMaps.includes(mapName);

                return (
                  <Button
                    key={mapName}
                    type="button"
                    variant={selected ? 'default' : 'outline'}
                    onClick={() => toggleSlayerMap(mapName)}
                    className={`min-h-11 rounded-full px-4 text-[0.88rem] sm:text-[0.94rem] ${
                      selected
                        ? 'shadow-[0_0_24px_rgba(245,180,76,0.22)]'
                        : 'border-white/18 bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {mapName}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="pt-3 sm:pt-5">
        <Label className={sectionTitleClass}>{copy.teamCreation}</Label>
        <p className="mb-5 max-w-2xl text-[clamp(0.76rem,0.73rem+0.16vw,0.9rem)] text-muted-foreground sm:mb-6">
          {copy.teamCreationHelp}
        </p>
        <RadioGroup
          value={config.teamCreationMode}
          onValueChange={(value) => updateConfig('teamCreationMode', value as TeamCreationMode)}
          className="grid gap-5 md:grid-cols-3"
        >
          <TeamCreationCard
            id="auto"
            value="automatic"
            selected={config.teamCreationMode === 'automatic'}
            icon={Users2}
            title={copy.balanced}
            description={copy.balancedDescription}
            detail={copy.balancedDetail}
          />
          <TeamCreationCard
            id="random"
            value="random"
            selected={config.teamCreationMode === 'random'}
            icon={Dice3}
            title={copy.random}
            description={copy.randomDescription}
            detail={copy.randomDetail}
          />
          <TeamCreationCard
            id="manual"
            value="manual"
            selected={config.teamCreationMode === 'manual'}
            icon={Shield}
            title={copy.manual}
            description={copy.manualDescription}
            detail={copy.manualDetail}
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
        <h3 className="mb-3 flex items-center gap-2 text-[clamp(1.05rem,1rem+0.42vw,1.24rem)] font-bold text-white">
          <FileText className="h-4 w-4 text-primary" />
          <span>{copy.summary}</span>
        </h3>
        <ul className="space-y-1 text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] text-muted-foreground">
          <li>{copy.totalPlayers}</li>
          <li>{copy.mode}: {config.type === 'slayer' ? copy.slayerTitle : copy.rankedTitle}</li>
          <li>{copy.teams}: {config.teamMode}</li>
          <li>{copy.killSummary}: {config.killLimit}</li>
          {config.type === 'slayer' && <li>{copy.slayerMaps}: {config.selectedSlayerMaps.length === SLAYER_MAPS.length ? copy.allMaps : config.selectedSlayerMaps.join(', ')}</li>}
          <li>{Math.floor(playerCount / parseInt(config.teamMode.charAt(0)))} {copy.teamCount}</li>
        </ul>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
        <Button onClick={onBack} variant="ghost" size="lg" className="w-full text-white/65 hover:text-white sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {copy.back}
        </Button>
        <Button onClick={handleSubmit} size="lg" className="w-full shadow-[0_0_28px_rgba(245,180,76,0.28)] hover:shadow-[0_0_38px_rgba(245,180,76,0.38)] sm:min-w-44 sm:w-auto">
          {copy.continue}
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
          ? 'border-primary ring-2 ring-primary/25 shadow-[0_0_0_1px_rgba(255,255,255,0.3),0_0_35px_rgba(245,180,76,0.18)]'
          : 'hover:border-primary/50 hover:shadow-[0_0_24px_rgba(245,180,76,0.12)]'
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

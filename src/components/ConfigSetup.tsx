import { useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Dice3, FileText, Settings2, Shield, Target, TriangleAlert, Trophy, Users2 } from 'lucide-react';
import { RANKED_MAPS, RANKED_MODE_ROTATION, SLAYER_MAPS, type GameMode, type RankedMapSelectionMode, type TournamentConfig, type TeamMode, type TeamCreationMode } from '../types/tournament';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { validatePlayerCount } from '../lib/tournament-utils';
import { ModeIcon } from './TournamentIcons';
import { useLanguage } from './LanguageContext';
import { cn } from '@/lib/utils';

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
    rankedMapSelectionMode: 'random',
    selectedRankedMaps: RANKED_MAPS.map((map) => map.name),
    selectedRankedModes: [...RANKED_MODE_ROTATION],
  };

  const [config, setConfig] = useState<TournamentConfig>(
    initialConfig ? { ...defaultConfig, ...initialConfig } : defaultConfig
  );
  const presetKillLimits = [25, 50, 75, 100];
  const initialIsCustomKillLimit = !presetKillLimits.includes((initialConfig ? { ...defaultConfig, ...initialConfig } : defaultConfig).killLimit);
  const [customKillLimitEnabled, setCustomKillLimitEnabled] = useState(initialIsCustomKillLimit);
  const [openSetting, setOpenSetting] = useState<'type' | 'teamMode' | 'duration' | 'teamCreation' | null>('type');
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
        customKillLimit: 'Custom',
        customKillLimitPlaceholder: 'Enter kill limit',
        slayerMaps: 'Slayer map pool',
        slayerMapsHelp: 'Choose the maps available for Slayer tournaments. If you leave more than one active, the app will rotate them from your selected pool.',
        rankedMaps: 'Ranked map pool',
        rankedMapsHelp: 'Keep the current random rotation or limit Ranked games to the maps you choose. Modes still only use compatible maps.',
        rankedModes: 'Ranked mode pool',
        rankedModesHelp: 'Choose which Ranked modes can appear in the rotation. Leave at least one active.',
        rankedCompatibilityWarning: 'The selected maps are not enabled for: {modes}. Select a compatible map or disable that game mode.',
        rankedMapModeRandom: 'Random rotation',
        rankedMapModeCustom: 'Selected maps',
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
        customKillLimit: 'Personalizzato',
        customKillLimitPlaceholder: 'Inserisci limite kill',
        slayerMaps: 'Pool mappe Slayer',
        slayerMapsHelp: 'Scegli le mappe disponibili per i tornei Massacro. Se ne lasci attiva piu di una, l app ruotera solo nella pool selezionata.',
        rankedMaps: 'Pool mappe Ranked',
        rankedMapsHelp: 'Mantieni la rotazione casuale attuale oppure limita le partite Ranked alle mappe che scegli. Ogni modalita usa comunque solo mappe compatibili.',
        rankedModes: 'Pool modalita Ranked',
        rankedModesHelp: 'Scegli quali modalita Ranked possono apparire nella rotazione. Lasciane almeno una attiva.',
        rankedCompatibilityWarning: 'Le mappe selezionate non sono abilitate per: {modes}. Seleziona una mappa compatibile o disattiva quella modalita di gioco.',
        rankedMapModeRandom: 'Rotazione casuale',
        rankedMapModeCustom: 'Mappe selezionate',
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
    const rankedMapCompatibilityIssues = getRankedMapCompatibilityIssues(config);
    if (config.type === 'ranked' && rankedMapCompatibilityIssues.length > 0) {
      setError(copy.rankedCompatibilityWarning.replace(
        '{modes}',
        rankedMapCompatibilityIssues.map((mode) => getRankedModeLabel(mode, language)).join(', ')
      ));
      return;
    }

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

  const handlePresetKillLimit = (limit: number) => {
    setCustomKillLimitEnabled(false);
    updateConfig('killLimit', limit);
  };

  const handleCustomKillLimitChange = (value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, '');
    if (!digitsOnly) {
      updateConfig('killLimit', 2);
      return;
    }

    updateConfig('killLimit', Math.max(2, Number(digitsOnly)));
  };

  const toggleSlayerMap = (mapName: string) => {
    const hasMap = config.selectedSlayerMaps.includes(mapName);
    const nextMaps = hasMap
      ? config.selectedSlayerMaps.filter((map) => map !== mapName)
      : [...config.selectedSlayerMaps, mapName];

    updateConfig('selectedSlayerMaps', nextMaps.length > 0 ? nextMaps : [mapName]);
  };

  const toggleRankedMap = (mapName: string) => {
    const hasMap = config.selectedRankedMaps.includes(mapName);
    const nextMaps = hasMap
      ? config.selectedRankedMaps.filter((map) => map !== mapName)
      : [...config.selectedRankedMaps, mapName];

    updateConfig('selectedRankedMaps', nextMaps.length > 0 ? nextMaps : [mapName]);
  };

  const toggleRankedMode = (mode: GameMode) => {
    const hasMode = config.selectedRankedModes.includes(mode);
    const nextModes = hasMode
      ? config.selectedRankedModes.filter((candidate) => candidate !== mode)
      : [...config.selectedRankedModes, mode];
    const safeModes = nextModes.length > 0 ? nextModes : [mode];
    const compatibleMaps = RANKED_MAPS
      .filter((map) => map.modes.some((candidate) => safeModes.includes(candidate)))
      .map((map) => map.name);
    const nextSelectedMaps = config.selectedRankedMaps.filter((mapName) => compatibleMaps.includes(mapName));

    setConfig({
      ...config,
      selectedRankedModes: safeModes,
      selectedRankedMaps: nextSelectedMaps.length > 0 ? nextSelectedMaps : compatibleMaps,
    });
    setError('');
  };

  const updateRankedMapSelectionMode = (mode: RankedMapSelectionMode) => {
    updateConfig('rankedMapSelectionMode', mode);
  };

  const sectionTitleClass = 'mb-3 block text-[clamp(1.05rem,1rem+0.42vw,1.28rem)] font-bold tracking-[0.01em] text-white sm:mb-4';
  const selectedTournamentTypeLabel = config.type === 'slayer' ? copy.slayerTitle : copy.rankedTitle;
  const selectedDurationLabel =
    config.matchDuration === 'single'
      ? copy.single
      : config.matchDuration === 'bo3'
        ? copy.bo3Title
        : copy.bo5Title;
  const selectedTeamCreationLabel =
    config.teamCreationMode === 'automatic'
      ? copy.balanced
      : config.teamCreationMode === 'random'
        ? copy.random
        : copy.manual;
  const selectedTeamCreationIcon =
    config.teamCreationMode === 'automatic'
      ? <Users2 />
      : config.teamCreationMode === 'random'
        ? <Dice3 />
        : <Shield />;
  const toggleSetting = (setting: 'type' | 'teamMode' | 'duration' | 'teamCreation') => {
    setOpenSetting((current) => (current === setting ? null : setting));
  };
  const rankedMapsForSelectedModes = RANKED_MAPS.filter((map) =>
    map.modes.some((mode) => config.selectedRankedModes.includes(mode))
  );
  const rankedMapCompatibilityIssues = getRankedMapCompatibilityIssues(config);

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

      <div className="grid gap-3">
        <ExpandableSettingCard
          title={copy.tournamentType}
          selectedValue={selectedTournamentTypeLabel}
          icon={config.type === 'slayer' ? <ModeIcon mode="slayer" /> : <Trophy />}
          isOpen={openSetting === 'type'}
          onToggle={() => toggleSetting('type')}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <OptionCard
            selected={config.type === 'slayer'}
            onClick={() => {
              updateConfig('type', 'slayer');
              setOpenSetting(null);
            }}
            icon={<ModeIcon mode="slayer" className="h-4 w-4" />}
            title={copy.slayerTitle}
            description={copy.slayerDescription}
          />
          <OptionCard
            selected={config.type === 'ranked'}
            onClick={() => {
              updateConfig('type', 'ranked');
              setOpenSetting(null);
            }}
            icon={<Trophy className="h-4 w-4 text-primary" />}
            title={copy.rankedTitle}
            description={copy.rankedDescription}
          />
          </div>
        </ExpandableSettingCard>

        <ExpandableSettingCard
          title={copy.teamMode}
          selectedValue={config.teamMode}
          icon={<Users2 />}
          isOpen={openSetting === 'teamMode'}
          onToggle={() => toggleSetting('teamMode')}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['1v1', '2v2', '3v3', '4v4'] as TeamMode[]).map((mode) => (
            <OptionCard
              key={mode}
              selected={config.teamMode === mode}
              onClick={() => {
                updateConfig('teamMode', mode);
                setOpenSetting(null);
              }}
              title={mode}
              compact
            />
          ))}
          </div>
        </ExpandableSettingCard>

        <ExpandableSettingCard
          title={copy.matchDuration}
          selectedValue={selectedDurationLabel}
          icon={<Target />}
          isOpen={openSetting === 'duration'}
          onToggle={() => toggleSetting('duration')}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <OptionCard
            selected={config.matchDuration === 'single'}
            onClick={() => {
              updateConfig('matchDuration', 'single');
              setOpenSetting(null);
            }}
            title={copy.single}
            description={copy.singleDescription}
          />
          <OptionCard
            selected={config.matchDuration === 'bo3'}
            onClick={() => {
              updateConfig('matchDuration', 'bo3');
              setOpenSetting(null);
            }}
            title={copy.bo3Title}
            description={copy.bo3Description}
          />
          <OptionCard
            selected={config.matchDuration === 'bo5'}
            onClick={() => {
              updateConfig('matchDuration', 'bo5');
              setOpenSetting(null);
            }}
            title={copy.bo5Title}
            description={copy.bo5Description}
          />
          </div>
        </ExpandableSettingCard>
        </div>

      <div>
        <Label className={sectionTitleClass}>{copy.killLimit}</Label>
        <div className="glass-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[clamp(0.95rem,0.9rem+0.25vw,1.05rem)] font-semibold">
                <Target className="h-4 w-4 text-primary" />
                <span>{config.killLimit > 0 ? `${config.killLimit} ${copy.killLabel}` : `0 ${copy.killLabel}`}</span>
              </div>
              <p className="mt-1 text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] text-muted-foreground">
                {copy.killHelp}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {presetKillLimits.map((limit) => (
                <Button
                  key={limit}
                  type="button"
                  variant={!customKillLimitEnabled && config.killLimit === limit ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePresetKillLimit(limit)}
                >
                  {limit}
                </Button>
              ))}
              <Button
                type="button"
                variant={customKillLimitEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCustomKillLimitEnabled(true)}
              >
                {copy.customKillLimit}
              </Button>
            </div>
          </div>
          {customKillLimitEnabled && (
            <div className="mt-4 flex max-w-xs flex-col gap-2">
              <Input
                type="number"
                min="2"
                step="1"
                inputMode="numeric"
                value={config.killLimit >= 2 ? String(config.killLimit) : '2'}
                onChange={(event) => handleCustomKillLimitChange(event.target.value)}
                placeholder={copy.customKillLimitPlaceholder}
                className="h-11 rounded-[14px] border-white/18 bg-white/[0.04] text-white placeholder:text-white/34"
              />
            </div>
          )}
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
                    className={`min-h-10 rounded-full px-3 text-[0.8rem] sm:min-h-11 sm:px-4 sm:text-[0.94rem] ${
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

      {config.type === 'ranked' && (
        <div className="pb-2 sm:pb-3">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <Label className={sectionTitleClass}>{copy.rankedMaps}</Label>
              <p className="max-w-3xl text-[clamp(0.76rem,0.73rem+0.16vw,0.9rem)] text-muted-foreground">
                {copy.rankedMapsHelp}
              </p>
            </div>
            <div className="text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] font-medium text-white/78">
              {config.rankedMapSelectionMode === 'random'
                ? copy.rankedMapModeRandom
                : `${config.selectedRankedMaps.filter((mapName) => rankedMapsForSelectedModes.some((map) => map.name === mapName)).length}/${rankedMapsForSelectedModes.length} ${copy.mapsSelected}`}
            </div>
          </div>

          <div className="glass-card space-y-4 p-4 sm:p-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[clamp(0.9rem,0.84rem+0.24vw,1rem)] font-semibold text-white">
                  {copy.rankedModes}
                </div>
                <div className="text-[clamp(0.72rem,0.69rem+0.15vw,0.86rem)] text-white/62">
                  {config.selectedRankedModes.length}/{RANKED_MODE_ROTATION.length}
                </div>
              </div>
              <p className="mb-3 max-w-3xl text-[clamp(0.76rem,0.73rem+0.16vw,0.9rem)] text-muted-foreground">
                {copy.rankedModesHelp}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {RANKED_MODE_ROTATION.map((mode) => {
                  const selected = config.selectedRankedModes.includes(mode);

                  return (
                    <Button
                      key={mode}
                      type="button"
                      variant={selected ? 'default' : 'outline'}
                      onClick={() => toggleRankedMode(mode)}
                      className={`min-h-10 rounded-full px-3 text-[0.8rem] sm:min-h-11 sm:px-4 sm:text-[0.94rem] ${
                        selected
                          ? 'shadow-[0_0_24px_rgba(245,180,76,0.22)]'
                          : 'border-white/18 bg-white/5 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <ModeIcon mode={mode} className="h-3.5 w-3.5" />
                      {getRankedModeLabel(mode, language)}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/8 pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard
                selected={config.rankedMapSelectionMode === 'random'}
                onClick={() => updateRankedMapSelectionMode('random')}
                icon={<Dice3 className="h-4 w-4 text-primary" />}
                title={copy.rankedMapModeRandom}
                description={copy.rankedMapsHelp}
              />
              <OptionCard
                selected={config.rankedMapSelectionMode === 'custom'}
                onClick={() => updateRankedMapSelectionMode('custom')}
                icon={<Target className="h-4 w-4 text-primary" />}
                title={copy.rankedMapModeCustom}
                description={`${config.selectedRankedMaps.filter((mapName) => rankedMapsForSelectedModes.some((map) => map.name === mapName)).length}/${rankedMapsForSelectedModes.length} ${copy.mapsSelected}`}
              />
            </div>

            {config.rankedMapSelectionMode === 'custom' && (
              <div className="space-y-4 border-t border-white/8 pt-4">
                <div className="flex flex-wrap gap-2.5">
                  {rankedMapsForSelectedModes.map((map) => {
                    const selected = config.selectedRankedMaps.includes(map.name);

                    return (
                      <Button
                        key={map.name}
                        type="button"
                        variant={selected ? 'default' : 'outline'}
                        onClick={() => toggleRankedMap(map.name)}
                        className={`min-h-10 rounded-full px-3 text-[0.8rem] sm:min-h-11 sm:px-4 sm:text-[0.94rem] ${
                          selected
                            ? 'shadow-[0_0_24px_rgba(245,180,76,0.22)]'
                            : 'border-white/18 bg-white/5 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        {map.name}
                      </Button>
                    );
                  })}
                </div>

                {rankedMapCompatibilityIssues.length > 0 && (
                  <div className="rounded-[16px] border border-amber-200/35 bg-[linear-gradient(180deg,rgba(245,180,76,0.16)_0%,rgba(245,180,76,0.06)_100%)] px-4 py-3 text-[clamp(0.76rem,0.73rem+0.16vw,0.9rem)] leading-relaxed text-amber-50 shadow-[0_0_22px_rgba(245,180,76,0.10)]">
                    <div className="flex items-start gap-2">
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        {copy.rankedCompatibilityWarning.replace(
                          '{modes}',
                          rankedMapCompatibilityIssues.map((mode) => getRankedModeLabel(mode, language)).join(', ')
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      <div className="pt-3 sm:pt-5">
        <ExpandableSettingCard
          title={copy.teamCreation}
          selectedValue={selectedTeamCreationLabel}
          icon={selectedTeamCreationIcon}
          isOpen={openSetting === 'teamCreation'}
          onToggle={() => toggleSetting('teamCreation')}
        >
          <p className="mb-4 max-w-2xl text-[clamp(0.76rem,0.73rem+0.16vw,0.9rem)] text-muted-foreground">
            {copy.teamCreationHelp}
          </p>
          <RadioGroup
            value={config.teamCreationMode}
            onValueChange={(value) => {
              updateConfig('teamCreationMode', value as TeamCreationMode);
              setOpenSetting(null);
            }}
            className="grid gap-4 md:grid-cols-3"
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
        </ExpandableSettingCard>
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
          {config.type === 'ranked' && <li>{copy.rankedModes}: {config.selectedRankedModes.map((mode) => getRankedModeLabel(mode, language)).join(', ')}</li>}
          {config.type === 'ranked' && <li>{copy.rankedMaps}: {config.rankedMapSelectionMode === 'random' ? copy.rankedMapModeRandom : config.selectedRankedMaps.join(', ')}</li>}
          <li>{Math.floor(playerCount / parseInt(config.teamMode.charAt(0)))} {copy.teamCount}</li>
        </ul>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
        <Button onClick={onBack} variant="ghost" size="lg" className="w-full text-white/65 hover:text-white sm:w-auto">
          <ArrowLeft className="h-4 w-4" />
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

function getRankedModeLabel(mode: GameMode, language: 'it' | 'en'): string {
  const labels: Record<GameMode, { it: string; en: string }> = {
    slayer: { it: 'Massacro', en: 'Slayer' },
    oddball: { it: 'Teschio', en: 'Oddball' },
    ctf: { it: 'Ruba bandiera', en: 'Capture the Flag' },
    koth: { it: 'Re della collina', en: 'King of the Hill' },
  };

  return labels[mode][language];
}

function getRankedMapCompatibilityIssues(config: TournamentConfig): GameMode[] {
  if (config.type !== 'ranked' || config.rankedMapSelectionMode !== 'custom') {
    return [];
  }

  return config.selectedRankedModes.filter((mode) => {
    return !RANKED_MAPS.some((map) => (
      config.selectedRankedMaps.includes(map.name) && map.modes.includes(mode)
    ));
  });
}

interface ExpandableSettingCardProps {
  title: string;
  selectedValue: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function ExpandableSettingCard({
  title,
  selectedValue,
  icon,
  isOpen,
  onToggle,
  children,
}: ExpandableSettingCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden rounded-[18px] p-0 transition-all duration-300 sm:rounded-[22px]',
        isOpen
          ? 'border-primary/70 bg-[linear-gradient(135deg,rgba(12,184,217,0.64)_0%,rgba(8,34,107,0.84)_48%,rgba(5,10,41,0.94)_100%)] shadow-[0_0_34px_rgba(245,180,76,0.18)]'
          : 'border-cyan-100/18 bg-[linear-gradient(135deg,rgba(15,190,222,0.46)_0%,rgba(8,40,116,0.76)_46%,rgba(4,9,39,0.92)_100%)] shadow-[0_0_22px_rgba(79,194,255,0.10)] hover:border-primary/40 hover:shadow-[0_0_28px_rgba(245,180,76,0.12)]'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex min-h-[78px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.035] focus-visible:ring-2 focus-visible:ring-primary/45 sm:min-h-[86px] sm:px-5"
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border bg-black/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] sm:h-12 sm:w-12',
              '[&_svg]:block [&_svg]:h-5 [&_svg]:w-5 [&_svg]:translate-y-0 [&_svg]:text-primary [&_svg]:opacity-100 sm:[&_svg]:h-5 sm:[&_svg]:w-5',
              isOpen
                ? 'border-primary/55 bg-primary/13 shadow-[0_0_18px_rgba(245,180,76,0.14),inset_0_1px_0_rgba(255,255,255,0.12)]'
                : 'border-cyan-100/20 bg-cyan-100/[0.055]'
            )}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/56 sm:text-[11px]">
              {title}
            </div>
            <div className="mt-1 truncate text-[clamp(1.08rem,0.98rem+0.38vw,1.28rem)] font-black leading-tight text-white">
              {selectedValue}
            </div>
          </div>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white/[0.055] text-white/82 transition-all duration-300',
            isOpen ? 'border-primary/50 shadow-[0_0_18px_rgba(245,180,76,0.16)]' : 'border-white/14'
          )}
        >
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-300 ease-out',
              isOpen ? 'rotate-180 text-primary' : ''
            )}
          />
        </div>
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'border-t border-white/8 px-4 pb-4 pt-3 transition-all duration-300 ease-out sm:px-5 sm:pb-5 sm:pt-4',
              isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </Card>
  );
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

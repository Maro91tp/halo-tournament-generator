import { useState, useEffect, useRef } from 'react';
import type { Player, RankTier } from '../types/tournament';
import { ArrowLeft, ArrowRight, Check, ChevronsUpDown, Circle, CircleCheckBig, Dice3, ExternalLink, Info, Users, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { calculateStrengthValue, getRankDisplay } from '../lib/tournament-utils';
import { getBundledPlayers, getPlayerByName, getStoredPlayers, searchPlayers, savePlayer, syncBundledPlayers, type StoredPlayer } from '../lib/player-storage';
import { cn } from '../lib/utils';
import { RankIcon } from './TournamentIcons';
import { useLanguage } from './LanguageContext';

interface PlayerSetupProps {
  onComplete: (players: Player[]) => void;
  onBack: () => void;
  initialPlayers: Player[];
}

export default function PlayerSetup({ onComplete, onBack, initialPlayers }: PlayerSetupProps) {
  type PlayerSaveState = 'idle' | 'saving' | 'saved' | 'error';
  const language = useLanguage();
  const [playerCount, setPlayerCount] = useState<number>(initialPlayers.length || 4);
  const [players, setPlayers] = useState<Player[]>(
    initialPlayers.length > 0
      ? initialPlayers
      : Array.from({ length: 4 }, (_, i) => createEmptyPlayer(i))
  );
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<StoredPlayer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [comboboxOpen, setComboboxOpen] = useState<boolean>(false);
  const [allStoredPlayers, setAllStoredPlayers] = useState<StoredPlayer[]>([]);
  const [bundledPlayers, setBundledPlayers] = useState<StoredPlayer[]>([]);
  const [playerSaveStates, setPlayerSaveStates] = useState<PlayerSaveState[]>(
    initialPlayers.length > 0
      ? initialPlayers.map(() => 'idle')
      : Array.from({ length: 4 }, () => 'idle')
  );
  const nameInputRef = useRef<HTMLInputElement>(null);

  const copy = language === 'en'
      ? {
        title: 'Player Setup',
        subtitle: 'Enter the player count and their details.',
        playerCount: 'Number of players',
        loadRandom: 'Load random players',
        gamertag: 'Halo gamertag',
        openDataHive: 'Open Data Hive',
        openTracker: 'Open Tracker',
        availableInFile: 'Available players in `players.txt`',
        increaseFile: 'Add more to use random loading.',
        players: 'Players',
        player: 'Player',
        previousPlayer: 'Previous player',
        nextPlayer: 'Next player',
        missingNames: 'All players must have a name!',
        playerName: 'Player name *',
        selectSavedPlayer: 'Select saved player',
        searchPlayer: 'Search player...',
        noPlayerFound: 'No player found.',
        savedPlayers: 'Saved players',
        similarPlayers: 'Similar players',
        typeManually: 'or type manually',
        rank: 'Rank',
        onyxScore: 'Onyx score',
        level: 'Level',
        onyxHelp: 'Onyx score starts at 1500 and can increase freely.',
        playerAlreadySaved: 'Player already saved',
        localArchive: 'Local archive',
        playerSaved: 'Player saved',
        savingPlayer: 'Saving player...',
        saveError: 'Save error',
        saveErrorHelp: 'The local save worked, but Supabase did not confirm the sync. Check the browser console and your env/policies.',
        playerAlreadySavedHelp: 'This player is already stored in the browser local archive and will remain available next time too.',
        unsavedChanges: 'Unsaved changes',
        savePlayer: 'Save player',
        saveThisPlayer: 'Save this player',
        saveChanges: 'Save changes',
        saveNewPlayerHelp: 'If you want to find this player again on the next launch, save them in the browser local archive.',
        saveChangedPlayerHelp: 'You changed this player rank. Click the CTA to update the saved player too, otherwise the change will apply only to this tournament.',
        playerInfo: 'Player info',
        fullRank: 'Full rank',
        strengthValue: 'Strength value',
        continueSetup: 'Continue to setup',
        progress: 'Progress',
        playersCompleted: 'players completed',
        completeAllPlayers: 'Complete all players to unlock the next step.',
        allPlayersReady: 'All players ready!',
        back: 'Back',
      }
    : {
        title: 'Configurazione Giocatori',
        subtitle: 'Inserisci il numero di giocatori e i loro dati.',
        playerCount: 'Numero di giocatori',
        loadRandom: 'Carica player casualmente',
        gamertag: 'Gamertag Halo',
        openDataHive: 'Apri Data Hive',
        openTracker: 'Apri Tracker',
        availableInFile: 'Giocatori disponibili in `players.txt`',
        increaseFile: 'Aumentali per usare il caricamento casuale.',
        players: 'Giocatori',
        player: 'Giocatore',
        previousPlayer: 'Player precedente',
        nextPlayer: 'Player successivo',
        missingNames: 'Tutti i giocatori devono avere un nome!',
        playerName: 'Nome giocatore *',
        selectSavedPlayer: 'Seleziona giocatore salvato',
        searchPlayer: 'Cerca giocatore...',
        noPlayerFound: 'Nessun giocatore trovato.',
        savedPlayers: 'Giocatori salvati',
        similarPlayers: 'Giocatori simili',
        typeManually: 'oppure inserisci manualmente',
        rank: 'Rank',
        onyxScore: 'Punteggio Onice',
        level: 'Livello',
        onyxHelp: 'Il punteggio Onice parte da 1500 e puo aumentare liberamente',
        playerAlreadySaved: 'Giocatore gia salvato',
        localArchive: 'Archivio locale',
        playerSaved: 'Player salvato',
        savingPlayer: 'Salvataggio...',
        saveError: 'Errore salvataggio',
        saveErrorHelp: 'Il salvataggio locale e andato a buon fine, ma Supabase non ha confermato la sincronizzazione. Controlla console del browser, env e policy.',
        playerAlreadySavedHelp: 'Questo player e gia presente nell archivio locale del browser e restera disponibile anche al prossimo avvio.',
        unsavedChanges: 'Modifiche non salvate',
        savePlayer: 'Salva player',
        saveThisPlayer: 'Salva questo giocatore',
        saveChanges: 'Salva modifiche',
        saveNewPlayerHelp: 'Se vuoi ritrovare questo player anche al prossimo avvio, salvalo nell archivio locale del browser.',
        saveChangedPlayerHelp: 'Hai cambiato il rank di questo player. Clicca la CTA per aggiornare anche il player salvato, altrimenti la modifica varra solo per questo torneo.',
        playerInfo: 'Informazioni giocatore',
        fullRank: 'Rank completo',
        strengthValue: 'Valore forza',
        continueSetup: 'Prosegui alla configurazione',
        progress: 'Progresso',
        playersCompleted: 'giocatori completati',
        completeAllPlayers: 'Completa tutti i player per sbloccare il passaggio allo step successivo.',
        allPlayersReady: 'Tutti i giocatori pronti!',
        back: 'Indietro',
      };

  const rankTiers: { value: RankTier; label: string }[] = [
    { value: 'bronze', label: language === 'en' ? 'Bronze' : 'Bronzo' },
    { value: 'silver', label: language === 'en' ? 'Silver' : 'Argento' },
    { value: 'gold', label: language === 'en' ? 'Gold' : 'Oro' },
    { value: 'platinum', label: language === 'en' ? 'Platinum' : 'Platino' },
    { value: 'diamond', label: language === 'en' ? 'Diamond' : 'Diamante' },
    { value: 'onyx', label: language === 'en' ? 'Onyx' : 'Onice' },
  ];

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [selectedPlayerIndex]);

  useEffect(() => {
    setBundledPlayers(getBundledPlayers());
    syncBundledPlayers().then((stored) => {
      setAllStoredPlayers(stored);
    });
  }, []);

  function createEmptyPlayer(index: number): Player {
    return {
      id: `player-${Date.now()}-${index}`,
      name: '',
      gamertag: '',
      rank: { tier: 'gold', level: 1 },
      strengthValue: 13,
    };
  }

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const newPlayers = Array.from({ length: count }, (_, i) => {
      if (i < players.length) {
        return players[i];
      }
      return createEmptyPlayer(i);
    });
    setPlayers(newPlayers);
    setPlayerSaveStates((current) =>
      Array.from({ length: count }, (_, i) => current[i] ?? 'idle')
    );

    if (selectedPlayerIndex >= count) {
      setSelectedPlayerIndex(count - 1);
    }
  };

  const updatePlayer = (index: number, updates: Partial<Player>) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], ...updates };

    if (updates.rank) {
      newPlayers[index].strengthValue = calculateStrengthValue(updates.rank);
    }

    setPlayers(newPlayers);
    setPlayerSaveStates((current) => {
      const next = [...current];
      next[index] = 'idle';
      return next;
    });
  };

  const updateRank = (index: number, field: 'tier' | 'level', value: string | number) => {
    const newPlayers = [...players];
    const currentRank = { ...newPlayers[index].rank };

    if (field === 'tier') {
      currentRank.tier = value as RankTier;
      currentRank.level = currentRank.tier === 'onyx' ? 1500 : 1;
    } else {
      currentRank.level = typeof value === 'string' ? parseInt(value) : value;
    }

    newPlayers[index].rank = currentRank;
    newPlayers[index].strengthValue = calculateStrengthValue(currentRank);
    setPlayers(newPlayers);
    setPlayerSaveStates((current) => {
      const next = [...current];
      next[index] = 'idle';
      return next;
    });
  };

  const handleNameChange = (index: number, name: string) => {
    const currentGamertag = players[index]?.gamertag?.trim() ?? '';
    updatePlayer(index, { name, gamertag: currentGamertag || name });

    if (name.length >= 2) {
      const results = searchPlayers(name);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleLoadRandomPlayers = () => {
    if (bundledPlayers.length < playerCount) {
      alert(language === 'en'
        ? `You need at least ${playerCount} players in players.txt to load them randomly.`
        : `Servono almeno ${playerCount} giocatori in players.txt per caricarli casualmente.`);
      return;
    }

    const shuffledPlayers = [...bundledPlayers].sort(() => Math.random() - 0.5).slice(0, playerCount);
    const randomizedPlayers = shuffledPlayers.map((storedPlayer, index) => ({
      id: players[index]?.id ?? `player-${Date.now()}-${index}`,
      name: storedPlayer.name,
      rank: storedPlayer.rank,
      strengthValue: calculateStrengthValue(storedPlayer.rank),
    }));

    setPlayers(randomizedPlayers);
    setPlayerSaveStates(Array.from({ length: playerCount }, () => 'idle'));
    setSelectedPlayerIndex(0);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const selectSuggestion = (index: number, storedPlayer: StoredPlayer) => {
    updatePlayer(index, {
      name: storedPlayer.name,
      gamertag: storedPlayer.gamertag || storedPlayer.name,
      rank: storedPlayer.rank,
      strengthValue: calculateStrengthValue(storedPlayer.rank),
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const selectFromCombobox = (storedPlayer: StoredPlayer) => {
    updatePlayer(selectedPlayerIndex, {
      name: storedPlayer.name,
      gamertag: storedPlayer.gamertag || storedPlayer.name,
      rank: storedPlayer.rank,
      strengthValue: calculateStrengthValue(storedPlayer.rank),
    });
    setComboboxOpen(false);
    setAllStoredPlayers(getStoredPlayers());
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedPlayerIndex < players.length - 1) {
        handleNext();
        return;
      }

      const firstIncompleteIndex = players.findIndex((player) => !isPlayerComplete(player));
      if (firstIncompleteIndex !== -1) {
        setSelectedPlayerIndex(firstIncompleteIndex);
        setShowSuggestions(false);
        return;
      }

      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const allValid = players.every((p) => p.name.trim() !== '');

    if (!allValid) {
      alert(copy.missingNames);
      return;
    }

    players.forEach((player, index) => {
      const alreadyStored = getPlayerByName(player.name);
      const hasStoredChanges =
        !!alreadyStored &&
        (alreadyStored.rank.tier !== player.rank.tier || alreadyStored.rank.level !== player.rank.level);

      if (alreadyStored && !hasStoredChanges) {
        void savePlayer(player);
      }
    });
    onComplete(players);
  };

  const handleSaveCurrentPlayer = async () => {
    if (!currentPlayer.name.trim()) {
      alert(copy.missingNames);
      return;
    }

    setPlayerSaveStates((current) => {
      const next = [...current];
      next[selectedPlayerIndex] = 'saving';
      return next;
    });

    const saved = await savePlayer(currentPlayer);
    setAllStoredPlayers(getStoredPlayers());
    setPlayerSaveStates((current) => {
      const next = [...current];
      next[selectedPlayerIndex] = saved ? 'saved' : 'error';
      return next;
    });
  };

  const handleOpenHaloDataHive = () => {
    const gamertag = (currentPlayer.gamertag || currentPlayer.name || '').trim();
    if (!gamertag) return;
    const profileUrl = `https://www.halodatahive.com/Player/Infinite/${encodeURIComponent(gamertag)}?route=Search`;
    window.open(profileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenHaloTracker = () => {
    const gamertag = (currentPlayer.gamertag || currentPlayer.name || '').trim();
    if (!gamertag) return;
    const profileUrl = `https://halotracker.com/halo-infinite/profile/xbl/${encodeURIComponent(gamertag)}/overview`;
    window.open(profileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNext = () => {
    if (selectedPlayerIndex < players.length - 1) {
      setSelectedPlayerIndex(selectedPlayerIndex + 1);
      setShowSuggestions(false);
    }
  };

  const handlePrevious = () => {
    if (selectedPlayerIndex > 0) {
      setSelectedPlayerIndex(selectedPlayerIndex - 1);
      setShowSuggestions(false);
    }
  };

  const selectPlayer = (index: number) => {
    setSelectedPlayerIndex(index);
    setShowSuggestions(false);
  };

  const isPlayerComplete = (player: Player) => player.name.trim() !== '';
  const currentPlayer = players[selectedPlayerIndex];
  const currentPlayerAlreadyStored = currentPlayer.name.trim() !== '' ? getPlayerByName(currentPlayer.name) : undefined;
  const currentPlayerHasStoredChanges =
    !!currentPlayerAlreadyStored &&
    (currentPlayerAlreadyStored.rank.tier !== currentPlayer.rank.tier ||
      currentPlayerAlreadyStored.rank.level !== currentPlayer.rank.level);
  const currentPlayerSaveState = playerSaveStates[selectedPlayerIndex] ?? 'idle';
  const completedPlayersCount = players.filter(isPlayerComplete).length;
  const allPlayersComplete = completedPlayersCount === players.length;

  return (
    <div className="app-section flex w-full flex-col">
      <div>
        <h2 className="app-title mb-3 flex items-center gap-2.5 font-bold font-heading sm:gap-3">
          <Users className="h-[var(--app-icon-lg)] w-[var(--app-icon-lg)] text-primary" />
          <span>{copy.title}</span>
        </h2>
        <p className="app-subtitle mb-5 text-muted-foreground sm:mb-6">
          {copy.subtitle}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full sm:w-auto">
            <Label htmlFor="player-count" className="mb-2 block text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] font-semibold">
              {copy.playerCount}
            </Label>
            <Input
              id="player-count"
              type="number"
              min="2"
              max="32"
              value={playerCount}
              onChange={(e) => handlePlayerCountChange(Math.max(2, parseInt(e.target.value) || 2))}
              className="w-full sm:max-w-xs"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleLoadRandomPlayers}
            disabled={bundledPlayers.length < playerCount}
            className="w-full sm:w-auto"
          >
            <Dice3 className="mr-2 h-4 w-4" />
            {copy.loadRandom}
          </Button>
        </div>
        {bundledPlayers.length < playerCount && (
          <p className="mt-2 text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] text-muted-foreground">
            {copy.availableInFile}: {bundledPlayers.length}. {copy.increaseFile}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <Card className="h-fit rounded-[18px] p-3.5 sm:max-h-[600px] sm:overflow-y-auto sm:rounded-[24px] sm:p-6 md:col-span-1">
          <h3 className="app-eyebrow mb-2 font-semibold uppercase text-muted-foreground sm:mb-3 sm:text-sm sm:tracking-normal">
            {copy.players} ({players.filter(isPlayerComplete).length}/{players.length})
          </h3>
          <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:block sm:space-y-1 sm:overflow-visible sm:px-0 sm:pb-0">
            {players.map((player, index) => (
              <button
                key={player.id}
                onClick={() => selectPlayer(index)}
                className={`min-h-11 min-w-[150px] flex-shrink-0 snap-start rounded-[14px] px-3 py-2.5 text-left text-[clamp(0.8rem,0.76rem+0.18vw,0.94rem)] transition-all sm:w-full sm:min-w-0 sm:py-2 ${
                  selectedPlayerIndex === index
                    ? 'bg-primary font-semibold text-primary-foreground'
                    : isPlayerComplete(player)
                    ? 'bg-muted hover:bg-muted/70'
                    : 'border border-dashed hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-[clamp(0.8rem,0.76rem+0.18vw,0.94rem)]">
                    {player.name || `${copy.player} ${index + 1}`}
                  </span>
                  <div className="ml-2 flex flex-shrink-0 items-center gap-1">
                    {isPlayerComplete(player) ? (
                      <CircleCheckBig className="h-[15px] w-[15px] text-primary sm:h-4 sm:w-4" />
                    ) : (
                      <Circle className="h-[15px] w-[15px] opacity-40 sm:h-4 sm:w-4" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="rounded-[18px] p-3.5 sm:rounded-[24px] sm:p-6 xl:col-span-3">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-[clamp(1.1rem,1rem+0.7vw,1.4rem)] font-bold">{copy.player} {selectedPlayerIndex + 1}</h3>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
              <Button onClick={handlePrevious} disabled={selectedPlayerIndex === 0} variant="ghost" size="sm" className="min-h-11 w-full text-white/65 hover:text-white sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {copy.previousPlayer}
              </Button>
              <Button onClick={handleNext} disabled={selectedPlayerIndex === players.length - 1} size="sm" className="min-h-11 w-full shadow-[0_0_20px_rgba(245,180,76,0.22)] hover:shadow-[0_0_28px_rgba(245,180,76,0.34)] sm:w-auto">
                {copy.nextPlayer}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="mb-2 block text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] font-semibold">
                {copy.playerName}
              </Label>

              <div className="flex gap-2">
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={comboboxOpen} className="min-h-11 w-full justify-between">
                      <User className="mr-2 h-4 w-4" />
                      <span className="truncate">{copy.selectSavedPlayer}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[min(400px,calc(100vw-2rem))] p-0">
                    <Command className="rounded-[24px] bg-transparent">
                      <CommandInput
                        placeholder={copy.searchPlayer}
                      />
                      <CommandList>
                        <CommandEmpty>{copy.noPlayerFound}</CommandEmpty>
                        <CommandGroup heading={copy.savedPlayers}>
                          {allStoredPlayers.map((stored, index) => (
                            <CommandItem
                              key={index}
                              value={stored.name}
                              onSelect={() => selectFromCombobox(stored)}
                              className="w-full rounded-sm"
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  currentPlayer.name === stored.name ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <div className="flex flex-1 flex-col">
                                <span className="font-medium">{stored.name}</span>
                                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                  <RankIcon rank={stored.rank} className="h-4 w-4" />
                                  <span>{getRankDisplay(stored.rank)}</span>
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="relative mt-2">
                <Input
                  ref={nameInputRef}
                  id="player-name"
                  value={currentPlayer.name}
                  onChange={(e) => handleNameChange(selectedPlayerIndex, e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  onFocus={() => {
                    if (currentPlayer.name.length >= 2) {
                      const results = searchPlayers(currentPlayer.name);
                      setSuggestions(results);
                      setShowSuggestions(results.length > 0);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  placeholder={copy.typeManually}
                  className="text-[clamp(0.95rem,0.88rem+0.3vw,1.08rem)] sm:text-lg"
                  autoComplete="off"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-[24px] border border-amber-200/45 bg-amber-50/95 shadow-[0_0_30px_rgba(245,180,76,0.16)] backdrop-blur-xl">
                    <div className="border-b border-black/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/55">
                      {copy.similarPlayers}
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {suggestions.map((stored, i) => (
                        <button
                          key={i}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectSuggestion(selectedPlayerIndex, stored)}
                          className="flex w-full items-center justify-between rounded-[16px] px-3 py-2 text-left transition-colors hover:bg-black/8"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-[clamp(0.8rem,0.76rem+0.18vw,0.94rem)] font-semibold text-black">
                              {stored.name}
                            </div>
                            <div className="inline-flex items-center gap-2 text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] text-black/60">
                              <RankIcon rank={stored.rank} className="h-4 w-4" />
                              <span>{getRankDisplay(stored.rank)}</span>
                            </div>
                          </div>
                          <ArrowRight className="ml-3 h-4 w-4 flex-shrink-0 text-black/45 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                <div>
                  <Label htmlFor="player-gamertag" className="mb-2 block text-[clamp(0.82rem,0.78rem+0.18vw,0.95rem)] font-semibold">
                    {copy.gamertag}
                  </Label>
                  <Input
                    id="player-gamertag"
                    value={currentPlayer.gamertag ?? ''}
                    onChange={(e) => updatePlayer(selectedPlayerIndex, { gamertag: e.target.value })}
                    placeholder={currentPlayer.name || copy.gamertag}
                    className="h-11"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenHaloDataHive}
                  disabled={!(currentPlayer.gamertag || currentPlayer.name).trim()}
                  className="h-11 w-full border-white/18 bg-white/6 text-white shadow-[0_0_18px_rgba(100,180,255,0.12)] hover:bg-white/10 hover:shadow-[0_0_26px_rgba(100,180,255,0.18)] sm:self-end"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {copy.openDataHive}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenHaloTracker}
                  disabled={!(currentPlayer.gamertag || currentPlayer.name).trim()}
                  className="h-11 w-full border-white/18 bg-white/6 text-white shadow-[0_0_18px_rgba(100,180,255,0.12)] hover:bg-white/10 hover:shadow-[0_0_26px_rgba(100,180,255,0.18)] sm:self-end"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {copy.openTracker}
                </Button>
              </div>

            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              <div>
                <Label className="mb-2 block text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] font-semibold">{copy.rank}</Label>
                <Select value={currentPlayer.rank.tier} onValueChange={(value) => updateRank(selectedPlayerIndex, 'tier', value)}>
                  <SelectTrigger className="text-[clamp(0.95rem,0.88rem+0.3vw,1.08rem)] sm:text-lg">
                    <SelectValue>
                      <span className="inline-flex items-center gap-2">
                        <RankIcon rank={currentPlayer.rank} className="h-5 w-5" />
                        <span>{rankTiers.find((tier) => tier.value === currentPlayer.rank.tier)?.label}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {rankTiers.map((tier) => (
                      <SelectItem key={tier.value} value={tier.value}>
                        <span className="inline-flex items-center gap-2">
                          <RankIcon rank={{ tier: tier.value, level: tier.value === 'onyx' ? 1500 : 1 }} className="h-5 w-5" />
                          <span>{tier.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="player-level" className="mb-2 block text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] font-semibold">
                  {currentPlayer.rank.tier === 'onyx' ? copy.onyxScore : copy.level}
                </Label>
                {currentPlayer.rank.tier === 'onyx' ? (
                  <div className="space-y-2">
                    <Input
                      id="player-level"
                      type="number"
                      min="1500"
                      value={currentPlayer.rank.level}
                      onChange={(e) => updateRank(selectedPlayerIndex, 'level', Math.max(1500, parseInt(e.target.value) || 1500))}
                      className="text-[clamp(0.95rem,0.88rem+0.3vw,1.08rem)] sm:text-lg"
                    />
                    <p className="text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] text-muted-foreground">
                      {copy.onyxHelp}
                    </p>
                  </div>
                ) : (
                  <Select value={currentPlayer.rank.level.toString()} onValueChange={(value) => updateRank(selectedPlayerIndex, 'level', value)}>
                    <SelectTrigger className="text-[clamp(0.95rem,0.88rem+0.3vw,1.08rem)] sm:text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className={`rounded-[18px] border px-3 py-3 sm:rounded-[20px] sm:px-4 ${
              currentPlayerHasStoredChanges
                ? 'border-amber-200/45 bg-amber-200/10 shadow-[0_0_28px_rgba(245,180,76,0.16)]'
                : 'border-white/10 bg-black/10'
            }`}>
              {currentPlayerAlreadyStored && !currentPlayerHasStoredChanges ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-[clamp(0.82rem,0.78rem+0.18vw,0.95rem)] font-semibold text-white">{copy.playerAlreadySaved}</div>
                    <div className="text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] text-white/65">
                      {copy.playerAlreadySavedHelp}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-2 text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] font-semibold text-white/82">
                    <CircleCheckBig className="h-4 w-4 flex-shrink-0 text-emerald-300" />
                    <span>{copy.playerSaved}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className={`font-semibold ${currentPlayerHasStoredChanges ? 'text-amber-50' : 'text-white'} text-[clamp(0.82rem,0.78rem+0.18vw,0.95rem)]`}>
                      {currentPlayerHasStoredChanges ? copy.unsavedChanges : copy.saveThisPlayer}
                    </div>
                    <div className={`text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] ${currentPlayerHasStoredChanges ? 'text-amber-50/80' : 'text-white/65'}`}>
                      {currentPlayerHasStoredChanges
                        ? copy.saveChangedPlayerHelp
                        : copy.saveNewPlayerHelp}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={currentPlayerSaveState === 'saved' ? 'default' : 'outline'}
                    onClick={() => void handleSaveCurrentPlayer()}
                    disabled={currentPlayerSaveState === 'saving' || !currentPlayer.name.trim()}
                    className={
                      currentPlayerSaveState === 'saved'
                        ? 'min-h-11 w-full border-emerald-300/55 bg-emerald-500 text-white shadow-[0_0_28px_rgba(16,185,129,0.28)] hover:bg-emerald-500 hover:shadow-[0_0_36px_rgba(16,185,129,0.38)] sm:w-auto sm:self-end'
                        : currentPlayerSaveState === 'error'
                          ? 'min-h-11 w-full border-red-300/55 bg-red-500/18 text-red-50 hover:bg-red-500/24 sm:w-auto sm:self-end'
                          : currentPlayerHasStoredChanges
                            ? 'min-h-11 w-full border-amber-200/60 bg-primary text-primary-foreground shadow-[0_0_24px_rgba(245,180,76,0.28)] hover:shadow-[0_0_34px_rgba(245,180,76,0.4)] sm:w-auto sm:self-end'
                            : 'min-h-11 w-full border-white/18 bg-white/6 text-white hover:bg-white/10 sm:w-auto sm:self-end'
                    }
                  >
                    {currentPlayerSaveState === 'saved' ? (
                      <>
                        <CircleCheckBig className="h-4 w-4 text-white" />
                        {copy.playerSaved}
                      </>
                    ) : currentPlayerSaveState === 'saving' ? (
                      copy.savingPlayer
                    ) : currentPlayerSaveState === 'error' ? (
                      copy.saveError
                    ) : currentPlayerHasStoredChanges
                        ? copy.saveChanges
                        : copy.savePlayer}
                  </Button>
                </div>
              )}
            </div>

            {currentPlayerSaveState === 'error' && (
              <div className="rounded-[16px] border border-red-300/30 bg-red-500/10 px-3 py-2 text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] text-red-50/90">
                {copy.saveErrorHelp}
              </div>
            )}

            <Card className="rounded-[18px] p-3.5 sm:rounded-[24px] sm:p-6">
              <h4 className="mb-2 flex items-center gap-2 text-[clamp(0.82rem,0.78rem+0.18vw,1rem)] font-semibold sm:text-base">
                <Info className="h-4 w-4 text-primary" />
                <span>{copy.playerInfo}</span>
              </h4>
              <div className="space-y-1 text-[clamp(0.72rem,0.69rem+0.15vw,0.88rem)] sm:text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <span className="text-muted-foreground">{copy.fullRank}:</span>
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <RankIcon rank={currentPlayer.rank} className="h-5 w-5" />
                    <span>{getRankDisplay(currentPlayer.rank, language)}</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <span className="text-muted-foreground">{copy.strengthValue}:</span>
                  <span className="font-semibold">{currentPlayer.strengthValue}</span>
                </div>
              </div>
            </Card>

            {allPlayersComplete && (
              <div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="group w-full rounded-[20px] border border-amber-200/55 bg-primary px-5 py-3.5 text-center text-[clamp(0.86rem,0.82rem+0.2vw,1rem)] font-semibold text-primary-foreground shadow-[0_0_28px_rgba(245,180,76,0.28)] transition hover:shadow-[0_0_36px_rgba(245,180,76,0.38)] sm:rounded-[24px] sm:py-4 sm:text-base"
                >
                  <span className="inline-flex items-center gap-2">
                    <span>{copy.continueSetup}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="rounded-[18px] p-3.5 sm:rounded-[24px] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-[clamp(0.72rem,0.69rem+0.15vw,0.88rem)] font-semibold uppercase tracking-[0.12em] sm:text-sm sm:tracking-normal">
              {copy.progress}: {completedPlayersCount} / {players.length} {copy.playersCompleted}
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted sm:max-w-[300px]">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{
                  width: `${(completedPlayersCount / players.length) * 100}%`,
                }}
              />
            </div>
            {!allPlayersComplete && (
              <div className="mt-3 text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] text-white/65">
                {copy.completeAllPlayers}
              </div>
            )}
          </div>
          {allPlayersComplete && (
            <div className="flex flex-wrap items-center gap-2 text-[clamp(0.82rem,0.78rem+0.18vw,0.95rem)] font-semibold text-primary">
              <CircleCheckBig className="h-4 w-4" />
              <span>{copy.allPlayersReady}</span>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-start pt-1">
        <Button onClick={onBack} variant="ghost" size="lg" className="min-h-11 w-full text-white/65 hover:text-white sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {copy.back}
        </Button>
      </div>

    </div>
  );
}

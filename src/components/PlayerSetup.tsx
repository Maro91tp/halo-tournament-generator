import { useState, useEffect, useRef } from 'react';
import type { Player, RankTier } from '../types/tournament';
import { ArrowLeft, ArrowRight, Check, ChevronsUpDown, Circle, CircleCheckBig, Dice3, Info, Users, User } from 'lucide-react';
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

interface PlayerSetupProps {
  onComplete: (players: Player[]) => void;
  onBack: () => void;
  initialPlayers: Player[];
}

export default function PlayerSetup({ onComplete, onBack, initialPlayers }: PlayerSetupProps) {
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
  const [saveSelections, setSaveSelections] = useState<boolean[]>(
    initialPlayers.length > 0
      ? initialPlayers.map(() => false)
      : Array.from({ length: 4 }, () => false)
  );

  const nameInputRef = useRef<HTMLInputElement>(null);

  const rankTiers: { value: RankTier; label: string }[] = [
    { value: 'bronze', label: 'Bronzo' },
    { value: 'silver', label: 'Argento' },
    { value: 'gold', label: 'Oro' },
    { value: 'platinum', label: 'Platino' },
    { value: 'diamond', label: 'Diamante' },
    { value: 'onyx', label: 'Onice' },
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
    setSaveSelections((current) =>
      Array.from({ length: count }, (_, i) => current[i] ?? false)
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
  };

  const handleNameChange = (index: number, name: string) => {
    updatePlayer(index, { name });

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
      alert(`Servono almeno ${playerCount} giocatori in players.txt per caricarli casualmente.`);
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
    setSaveSelections(Array.from({ length: playerCount }, () => false));
    setSelectedPlayerIndex(0);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const selectSuggestion = (index: number, storedPlayer: StoredPlayer) => {
    updatePlayer(index, {
      name: storedPlayer.name,
      rank: storedPlayer.rank,
      strengthValue: calculateStrengthValue(storedPlayer.rank),
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const selectFromCombobox = (storedPlayer: StoredPlayer) => {
    updatePlayer(selectedPlayerIndex, {
      name: storedPlayer.name,
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
      alert('Tutti i giocatori devono avere un nome!');
      return;
    }

    players.forEach((player, index) => {
      const alreadyStored = getPlayerByName(player.name);
      const hasStoredChanges =
        !!alreadyStored &&
        (alreadyStored.rank.tier !== player.rank.tier || alreadyStored.rank.level !== player.rank.level);

      if (saveSelections[index] || (alreadyStored && !hasStoredChanges)) {
        savePlayer(player);
      }
    });
    onComplete(players);
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
  const completedPlayersCount = players.filter(isPlayerComplete).length;
  const allPlayersComplete = completedPlayersCount === players.length;

  return (
    <div className="app-section flex w-full flex-col">
      <div>
        <h2 className="app-title mb-3 flex items-center gap-2.5 font-bold font-heading sm:gap-3">
          <Users className="h-[var(--app-icon-lg)] w-[var(--app-icon-lg)] text-primary" />
          <span>Configurazione Giocatori</span>
        </h2>
        <p className="app-subtitle mb-5 text-muted-foreground sm:mb-6">
          Inserisci il numero di giocatori e i loro dati. Usa ENTER per passare al successivo.
        </p>
        <div className="rounded-[18px] border border-white/10 bg-black/10 px-3 py-3 text-[clamp(0.74rem,0.7rem+0.16vw,0.88rem)] text-white/72 sm:px-4">
          I pulsanti "Player precedente" e "Player successivo" cambiano solo la scheda giocatore. Il pulsante per proseguire allo step seguente compare solo quando tutti i player sono completi.
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <Label htmlFor="player-count" className="mb-2 block text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] font-semibold">
              Numero di giocatori
            </Label>
            <Input
              id="player-count"
              type="number"
              min="2"
              max="32"
              value={playerCount}
              onChange={(e) => handlePlayerCountChange(Math.max(2, parseInt(e.target.value) || 2))}
              className="max-w-xs"
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
            Carica player casualmente
          </Button>
        </div>
        {bundledPlayers.length < playerCount && (
          <p className="mt-2 text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] text-muted-foreground">
            Giocatori disponibili in `players.txt`: {bundledPlayers.length}. Aumentali per usare il caricamento casuale.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <Card className="h-fit max-h-[420px] overflow-y-auto rounded-[18px] p-3 sm:max-h-[600px] sm:rounded-[24px] sm:p-6 md:col-span-1">
          <h3 className="app-eyebrow mb-2 font-semibold uppercase text-muted-foreground sm:mb-3 sm:text-sm sm:tracking-normal">
            Giocatori ({players.filter(isPlayerComplete).length}/{players.length})
          </h3>
          <div className="space-y-1">
            {players.map((player, index) => (
              <button
                key={player.id}
                onClick={() => selectPlayer(index)}
                className={`w-full rounded-[14px] px-3 py-2 text-left text-[clamp(0.8rem,0.76rem+0.18vw,0.94rem)] transition-all ${
                  selectedPlayerIndex === index
                    ? 'bg-primary font-semibold text-primary-foreground'
                    : isPlayerComplete(player)
                    ? 'bg-muted hover:bg-muted/70'
                    : 'border border-dashed hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-[clamp(0.8rem,0.76rem+0.18vw,0.94rem)]">
                    {player.name || `Giocatore ${index + 1}`}
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

        <Card className="rounded-[18px] p-4 sm:rounded-[24px] sm:p-6 xl:col-span-3">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-[clamp(1.1rem,1rem+0.7vw,1.4rem)] font-bold">Giocatore {selectedPlayerIndex + 1}</h3>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handlePrevious} disabled={selectedPlayerIndex === 0} variant="ghost" size="sm" className="w-full text-white/65 hover:text-white sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Player precedente
              </Button>
              <Button onClick={handleNext} disabled={selectedPlayerIndex === players.length - 1} size="sm" className="w-full shadow-[0_0_20px_rgba(245,180,76,0.22)] hover:shadow-[0_0_28px_rgba(245,180,76,0.34)] sm:w-auto">
                Player successivo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="mb-2 block text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] font-semibold">
                Nome giocatore *
              </Label>

              <div className="flex gap-2">
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between sm:max-w-[400px]">
                      <User className="mr-2 h-4 w-4" />
                      <span className="truncate">Seleziona giocatore salvato</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[min(400px,calc(100vw-2rem))] p-0">
                    <Command className="rounded-[24px] bg-transparent">
                      <CommandInput
                        placeholder="Cerca giocatore..."
                      />
                      <CommandList>
                        <CommandEmpty>Nessun giocatore trovato.</CommandEmpty>
                        <CommandGroup heading="Giocatori salvati">
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
                  placeholder="oppure inserisci manualmente (premi ENTER per continuare)"
                  className="text-[clamp(0.95rem,0.88rem+0.3vw,1.08rem)] sm:text-lg"
                  autoComplete="off"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-[24px] border border-amber-200/45 bg-amber-50/95 shadow-[0_0_30px_rgba(245,180,76,0.16)] backdrop-blur-xl">
                    <div className="border-b border-black/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/55">
                      Giocatori simili
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

              <div className="mt-3 rounded-[18px] border border-white/10 bg-black/10 px-3 py-3 sm:rounded-[20px] sm:px-4">
                {currentPlayerAlreadyStored && !currentPlayerHasStoredChanges ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-[clamp(0.82rem,0.78rem+0.18vw,0.95rem)] font-semibold text-white">Giocatore già salvato</div>
                      <div className={`text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] text-white/65 ${currentPlayerHasStoredChanges ? 'hidden' : ''}`}>
                        Questo nome è già presente nell'archivio locale e resterà disponibile anche al prossimo avvio.
                      </div>
                    </div>
                    <CircleCheckBig className="h-5 w-5 flex-shrink-0 text-primary" />
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={saveSelections[selectedPlayerIndex] ?? false}
                      onChange={(e) =>
                        setSaveSelections((current) => {
                          const next = [...current];
                          next[selectedPlayerIndex] = e.target.checked;
                          return next;
                        })
                      }
                      className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent accent-cyan-400"
                    />
                    <div>
                      <div className="text-[clamp(0.82rem,0.78rem+0.18vw,0.95rem)] font-semibold text-white">
                        {currentPlayerHasStoredChanges ? 'Salva modifiche' : 'Salva questo giocatore'}
                      </div>
                      {currentPlayerHasStoredChanges && (
                        <div className="mb-1 text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] text-white/65">
                          Se non selezioni questa opzione, il nuovo grado verrà usato solo in questo torneo e il giocatore salvato resterà invariato.
                        </div>
                      )}
                      <div className="text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] text-white/65">
                        Se non selezioni questa opzione, il nome sarà usato per il torneo corrente ma non comparirà tra i giocatori salvati al prossimo avvio.
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] font-semibold">Rank</Label>
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
                {currentPlayer.rank.tier === 'onyx' ? 'Punteggio Onice' : 'Livello'}
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
                    Il punteggio Onice parte da 1500 e puo aumentare liberamente
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

            <Card className="rounded-[18px] p-3.5 sm:rounded-[24px] sm:p-6">
              <h4 className="mb-2 flex items-center gap-2 text-[clamp(0.82rem,0.78rem+0.18vw,1rem)] font-semibold sm:text-base">
                <Info className="h-4 w-4 text-primary" />
                <span>Informazioni giocatore</span>
              </h4>
              <div className="space-y-1 text-[clamp(0.72rem,0.69rem+0.15vw,0.88rem)] sm:text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">Rank completo:</span>
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <RankIcon rank={currentPlayer.rank} className="h-5 w-5" />
                    <span>{getRankDisplay(currentPlayer.rank)}</span>
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">Valore forza:</span>
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
                    <span>Prosegui alla configurazione</span>
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
          <div>
            <div className="text-[clamp(0.72rem,0.69rem+0.15vw,0.88rem)] font-semibold uppercase tracking-[0.14em] sm:text-sm sm:tracking-normal">
              Progresso: {completedPlayersCount} / {players.length} giocatori completati
            </div>
            <div className="mt-2 h-2 w-full max-w-[300px] rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{
                  width: `${(completedPlayersCount / players.length) * 100}%`,
                }}
              />
            </div>
            {!allPlayersComplete && (
              <div className="mt-3 text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] text-white/65">
                Completa tutti i player per sbloccare il passaggio allo step successivo.
              </div>
            )}
          </div>
          {allPlayersComplete && (
            <div className="flex items-center gap-2 text-[clamp(0.82rem,0.78rem+0.18vw,0.95rem)] font-semibold text-primary">
              <CircleCheckBig className="h-4 w-4" />
              <span>Tutti i giocatori pronti!</span>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-start pt-1">
        <Button onClick={onBack} variant="ghost" size="lg" className="w-full text-white/65 hover:text-white sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Indietro
        </Button>
      </div>

    </div>
  );
}

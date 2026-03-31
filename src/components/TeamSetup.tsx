import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Dice3, Eye, Pencil, RefreshCcw, Shield, Users2, X } from 'lucide-react';
import type { Player, Team, TournamentConfig } from '../types/tournament';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { generateBalancedTeams, generateRandomTeams, getRankDisplay } from '../lib/tournament-utils';
import { RankIcon } from './TournamentIcons';
import { useLanguage } from './LanguageContext';

interface TeamSetupProps {
  players: Player[];
  config: TournamentConfig;
  onComplete: (teams: Team[]) => void;
  onBack: () => void;
  initialTeams: Team[];
}

export default function TeamSetup({ players, config, onComplete, onBack, initialTeams }: TeamSetupProps) {
  const language = useLanguage();
  const teamSize = parseInt(config.teamMode.charAt(0));
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [editMode, setEditMode] = useState<boolean>(config.teamCreationMode === 'manual');
  const [playerTeamAssignments, setPlayerTeamAssignments] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (initialTeams.length > 0) {
      setTeams(initialTeams);
      updateAvailablePlayers(initialTeams);
    } else if (config.teamCreationMode === 'automatic') {
      const balancedTeams = generateBalancedTeams(players, teamSize, language);
      setTeams(balancedTeams);
      setAvailablePlayers([]);
    } else if (config.teamCreationMode === 'random') {
      const randomTeams = generateRandomTeams(players, teamSize, language);
      setTeams(randomTeams);
      setAvailablePlayers([]);
    } else {
      const numTeams = Math.floor(players.length / teamSize);
      const emptyTeams: Team[] = [];
      const teamNames = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F', 'Team G', 'Team H'];

      for (let i = 0; i < numTeams; i++) {
        emptyTeams.push({
          id: `team-${i + 1}`,
          name: language === 'en' ? (teamNames[i] || `Team ${String.fromCharCode(65 + i)}`) : `Squadra ${i + 1}`,
          players: [],
          totalStrength: 0,
        });
      }

      setTeams(emptyTeams);
      setAvailablePlayers([...players]);
    }
  }, [config.teamCreationMode, initialTeams, language, players, teamSize]);

  const copy = language === 'en'
    ? {
        balancedTeams: 'Balanced Teams',
        randomTeams: 'Random Teams',
        createTeams: 'Create Teams',
        automaticDescription: 'Teams were generated automatically. You can still edit names and players.',
        randomDescription: 'Teams were generated randomly. You can still edit names and players.',
        manualDescription: 'Assign players to teams manually.',
        regenerate: 'Regenerate teams',
        view: 'View',
        editPlayers: 'Edit players',
        assignPlayers: 'Assign players to teams',
        remaining: 'remaining',
        strength: 'Strength',
        chooseTeam: 'Choose team...',
        availablePlayers: 'Available players',
        selectPlayerForTeam: 'Select a player to add to',
        teamName: 'Team name',
        players: 'Players',
        cancel: 'Cancel',
        addPlayer: '+ Add player',
        confirmTeams: 'Confirm teams',
        confirmHelp: 'Check names, roster, and strength. When you are ready, generate the tournament.',
        generateTournament: 'Generate Tournament',
        back: 'Back',
        teamLimit: `A team can have at most ${teamSize} players!`,
        allTeamsRequired: `All teams must have exactly ${teamSize} players!`,
      }
    : {
        balancedTeams: 'Squadre Bilanciate',
        randomTeams: 'Squadre Casuali',
        createTeams: 'Crea le Squadre',
        automaticDescription: 'Le squadre sono state generate automaticamente. Puoi modificare i nomi e i giocatori.',
        randomDescription: 'Le squadre sono state generate casualmente. Puoi modificare i nomi e i giocatori.',
        manualDescription: 'Assegna i giocatori alle squadre manualmente.',
        regenerate: 'Rigenera squadre',
        view: 'Visualizza',
        editPlayers: 'Modifica giocatori',
        assignPlayers: 'Assegna giocatori alle squadre',
        remaining: 'rimanenti',
        strength: 'Forza',
        chooseTeam: 'Scegli squadra...',
        availablePlayers: 'Giocatori disponibili',
        selectPlayerForTeam: 'Seleziona un giocatore per aggiungerlo a',
        teamName: 'Nome squadra',
        players: 'Giocatori',
        cancel: 'Annulla',
        addPlayer: '+ Aggiungi giocatore',
        confirmTeams: 'Conferma squadre',
        confirmHelp: 'Controlla nomi, composizione e forza dei team. Quando sei pronto puoi generare il torneo.',
        generateTournament: 'Genera Torneo',
        back: 'Indietro',
        teamLimit: `La squadra puo avere massimo ${teamSize} giocatori!`,
        allTeamsRequired: `Tutte le squadre devono avere esattamente ${teamSize} giocatori!`,
      };

  const updateAvailablePlayers = (currentTeams: Team[]) => {
    const assignedPlayerIds = new Set(
      currentTeams.flatMap((team) => team.players.map((p) => p.id))
    );
    setAvailablePlayers(players.filter((p) => !assignedPlayerIds.has(p.id)));
  };

  const updateTeamName = (teamIndex: number, name: string) => {
    const newTeams = [...teams];
    newTeams[teamIndex].name = name;
    setTeams(newTeams);
  };

  const addPlayerToTeam = (teamIndex: number, player: Player) => {
    const newTeams = [...teams];
    const team = newTeams[teamIndex];

    if (team.players.length >= teamSize) {
      alert(copy.teamLimit);
      return;
    }

    team.players.push(player);
    team.totalStrength += player.strengthValue;
    setTeams(newTeams);
    updateAvailablePlayers(newTeams);
    setSelectedTeam(null);
  };

  const removePlayerFromTeam = (teamIndex: number, playerIndex: number) => {
    const newTeams = [...teams];
    const team = newTeams[teamIndex];
    const player = team.players[playerIndex];

    team.players.splice(playerIndex, 1);
    team.totalStrength -= player.strengthValue;
    setTeams(newTeams);
    updateAvailablePlayers(newTeams);
  };

  const assignPlayerToTeam = (playerId: string, teamIndex: number) => {
    const player = availablePlayers.find((p) => p.id === playerId);
    if (!player) return;

    const newTeams = [...teams];
    const team = newTeams[teamIndex];

    if (team.players.length >= teamSize) {
      alert(copy.teamLimit);
      return;
    }

    team.players.push(player);
    team.totalStrength += player.strengthValue;
    setTeams(newTeams);
    updateAvailablePlayers(newTeams);

    const newAssignments = new Map(playerTeamAssignments);
    newAssignments.delete(playerId);
    setPlayerTeamAssignments(newAssignments);
  };

  const handleSubmit = () => {
    const allTeamsComplete = teams.every((team) => team.players.length === teamSize);

    if (!allTeamsComplete) {
      alert(copy.allTeamsRequired);
      return;
    }

    onComplete(teams);
  };

  const handleRegenerate = () => {
    if (config.teamCreationMode === 'automatic') {
      const balancedTeams = generateBalancedTeams(players, teamSize, language);
      setTeams(balancedTeams);
      setAvailablePlayers([]);
      setEditMode(false);
    } else if (config.teamCreationMode === 'random') {
      const randomTeams = generateRandomTeams(players, teamSize, language);
      setTeams(randomTeams);
      setAvailablePlayers([]);
      setEditMode(false);
    }
  };

  const toggleEditMode = () => {
    if (!editMode) {
      updateAvailablePlayers(teams);
    }
    setEditMode(!editMode);
  };

  const isManualMode = config.teamCreationMode === 'manual';
  const isAutoMode = config.teamCreationMode === 'automatic' || config.teamCreationMode === 'random';

  return (
    <div className="app-section flex w-full flex-col">
      <div>
        <h2 className="app-title mb-3 font-bold font-heading">
          {config.teamCreationMode === 'automatic' && (
            <span className="flex items-center gap-3">
              <Users2 className="h-[var(--app-icon-lg)] w-[var(--app-icon-lg)] text-primary" />
              <span>{copy.balancedTeams}</span>
            </span>
          )}
          {config.teamCreationMode === 'random' && (
            <span className="flex items-center gap-3">
              <Dice3 className="h-[var(--app-icon-lg)] w-[var(--app-icon-lg)] text-primary" />
              <span>{copy.randomTeams}</span>
            </span>
          )}
          {config.teamCreationMode === 'manual' && (
            <span className="flex items-center gap-3">
              <Shield className="h-[var(--app-icon-lg)] w-[var(--app-icon-lg)] text-primary" />
              <span>{copy.createTeams}</span>
            </span>
          )}
        </h2>
        <p className="app-subtitle mb-5 text-muted-foreground sm:mb-6">
          {config.teamCreationMode === 'automatic' && copy.automaticDescription}
          {config.teamCreationMode === 'random' && copy.randomDescription}
          {config.teamCreationMode === 'manual' && copy.manualDescription}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {isAutoMode && (
          <>
            <Button onClick={handleRegenerate} variant="ghost" size="sm" className="w-full text-white/75 hover:bg-white/8 hover:text-white sm:w-auto">
              <RefreshCcw className="mr-2 h-4 w-4" />
              {copy.regenerate}
            </Button>
            <Button onClick={toggleEditMode} variant="ghost" size="sm" className="w-full text-white/75 hover:bg-white/8 hover:text-white sm:w-auto">
              {editMode ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  {copy.view}
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  {copy.editPlayers}
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {isManualMode && availablePlayers.length > 0 && (
        <Card className="rounded-[18px] p-3.5 sm:rounded-[24px] sm:p-6">
          <h3 className="mb-3 text-[clamp(0.84rem,0.8rem+0.18vw,1rem)] font-semibold sm:text-base">{copy.assignPlayers} ({availablePlayers.length} {copy.remaining})</h3>
          <div className="grid gap-3">
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                className="glass-card flex flex-col gap-2.5 p-2.5 sm:flex-row sm:items-center sm:justify-between sm:p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-[clamp(0.84rem,0.8rem+0.18vw,1rem)] font-medium sm:text-base">{player.name}</div>
                  <div className="inline-flex items-center gap-2 text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] text-muted-foreground">
                    <RankIcon rank={player.rank} className="h-4 w-4" />
                    <span>{getRankDisplay(player.rank, language)} - {copy.strength}: {player.strengthValue}</span>
                  </div>
                </div>
                <Select
                  value={playerTeamAssignments.get(player.id)?.toString() || ''}
                  onValueChange={(value) => {
                    const teamIndex = parseInt(value);
                    assignPlayerToTeam(player.id, teamIndex);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder={copy.chooseTeam} />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team, idx) => (
                      <SelectItem
                        key={team.id}
                        value={idx.toString()}
                        disabled={team.players.length >= teamSize}
                      >
                        {team.name} ({team.players.length}/{teamSize})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!isManualMode && editMode && availablePlayers.length > 0 && (
        <Card className="rounded-[18px] p-3.5 sm:rounded-[24px] sm:p-6">
          <h3 className="mb-3 text-[clamp(0.84rem,0.8rem+0.18vw,1rem)] font-semibold sm:text-base">{copy.availablePlayers} ({availablePlayers.length})</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                className="glass-card rounded-[16px] p-2 text-[clamp(0.7rem,0.68rem+0.15vw,0.84rem)] sm:text-sm"
              >
                <div className="font-medium">{player.name}</div>
                <div className="inline-flex items-center gap-2 text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] text-muted-foreground">
                  <RankIcon rank={player.rank} className="h-4 w-4" />
                  <span>{getRankDisplay(player.rank, language)}</span>
                </div>
              </div>
            ))}
          </div>
          {selectedTeam !== null && (
            <p className="mt-3 text-[clamp(0.8rem,0.76rem+0.18vw,0.94rem)] font-medium text-primary">
              {copy.selectPlayerForTeam} {teams[selectedTeam].name}
            </p>
          )}
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {teams.map((team, teamIndex) => (
          <Card key={team.id} className="space-y-3 rounded-[18px] p-3.5 sm:rounded-[24px] sm:p-6">
            <div>
              <Label className="mb-1 text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)]">{copy.teamName}</Label>
              <Input
                value={team.name}
                onChange={(e) => updateTeamName(teamIndex, e.target.value)}
                placeholder={copy.teamName}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)]">
                  {copy.players} ({team.players.length}/{teamSize})
                </Label>
                <span className="text-[clamp(0.72rem,0.69rem+0.15vw,0.82rem)] text-muted-foreground">
                  {copy.strength}: {team.totalStrength}
                </span>
              </div>

              <div className="space-y-2">
                {team.players.map((player, playerIndex) => (
                  <div
                    key={player.id}
                    className="flex items-start justify-between gap-3 rounded-[16px] border border-amber-200/20 bg-white/6 px-3 py-2.5 backdrop-blur-md sm:items-center sm:rounded-[22px] sm:px-4 sm:py-3"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="truncate text-[15px] font-semibold leading-tight text-white">{player.name}</div>
                      <div className="mt-1 inline-flex items-center gap-2 text-[11px] leading-tight text-white/65">
                        <RankIcon rank={player.rank} className="h-4 w-4" />
                        <span>{getRankDisplay(player.rank, language)} - {player.strengthValue}</span>
                      </div>
                    </div>
                    {(editMode || isManualMode) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePlayerFromTeam(teamIndex, playerIndex)}
                        className="h-9 w-9 flex-shrink-0 p-0 sm:h-8 sm:w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {!isManualMode && editMode && team.players.length < teamSize && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedTeam(selectedTeam === teamIndex ? null : teamIndex)}
                  >
                    {selectedTeam === teamIndex ? copy.cancel : copy.addPlayer}
                  </Button>
                )}

                {!isManualMode && editMode && selectedTeam === teamIndex && availablePlayers.length > 0 && (
                  <div className="glass-card max-h-48 space-y-1 overflow-y-auto p-2">
                    {availablePlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => addPlayerToTeam(teamIndex, player)}
                        className="w-full rounded-[16px] border border-white/8 bg-white/5 px-3 py-2.5 text-left text-[clamp(0.78rem,0.74rem+0.18vw,0.9rem)] transition-colors hover:bg-white/10 sm:px-4 sm:py-3"
                      >
                        <div className="text-[15px] font-semibold leading-tight text-white">{player.name}</div>
                        <div className="mt-1 inline-flex items-center gap-2 text-[11px] leading-tight text-white/65">
                          <RankIcon rank={player.rank} className="h-4 w-4" />
                          <span>{getRankDisplay(player.rank, language)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="glass-card space-y-4 rounded-[18px] p-4 sm:rounded-[24px] sm:p-5 md:p-6">
        <div className="space-y-1">
          <div className="text-[clamp(0.72rem,0.69rem+0.15vw,0.88rem)] font-semibold uppercase tracking-[0.14em] text-white sm:text-sm sm:tracking-normal">{copy.confirmTeams}</div>
          <p className="text-[clamp(0.72rem,0.69rem+0.15vw,0.88rem)] text-white/70 sm:text-sm">
            {copy.confirmHelp}
          </p>
        </div>
        <div className="flex justify-stretch sm:justify-end">
          <Button onClick={handleSubmit} size="lg" className="w-full text-[clamp(0.92rem,0.88rem+0.22vw,1rem)] shadow-[0_0_24px_rgba(245,180,76,0.24)] hover:shadow-[0_0_34px_rgba(245,180,76,0.34)] sm:min-w-48 sm:w-auto">
            {copy.generateTournament}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-start pt-1">
        <Button onClick={onBack} variant="ghost" size="lg" className="w-full text-white/65 hover:text-white sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {copy.back}
        </Button>
      </div>
    </div>
  );
}

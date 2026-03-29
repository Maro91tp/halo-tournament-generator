import { useState } from 'react';
import { RefreshCcw, Trash2, Wrench, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { getStoredPlayers, clearStoredPlayers } from '../lib/player-storage';
import { getRankDisplay } from '../lib/tournament-utils';
import { RankIcon } from './TournamentIcons';

export default function StorageDebug() {
  const [players, setPlayers] = useState(getStoredPlayers());
  const [showDebug, setShowDebug] = useState(false);

  const refresh = () => {
    setPlayers(getStoredPlayers());
  };

  const clear = () => {
    if (confirm('Vuoi davvero eliminare tutti i giocatori salvati?')) {
      clearStoredPlayers();
      setPlayers([]);
    }
  };

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 inline-flex items-center gap-2 text-xs text-muted-foreground opacity-20 transition-opacity hover:text-foreground hover:opacity-100"
      >
        <Wrench className="h-3.5 w-3.5" />
        <span>Debug</span>
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 max-w-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Wrench className="h-4 w-4 text-primary" />
          <span>Storage Debug</span>
        </h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 space-y-2">
        <div className="text-xs text-muted-foreground">
          {players.length} giocatori salvati
        </div>
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {players.map((player, i) => (
            <div key={i} className="glass-card p-2 text-xs">
              <div className="font-medium">{player.name}</div>
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <RankIcon rank={player.rank} className="h-4 w-4" />
                <span>{getRankDisplay(player.rank)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={refresh} variant="outline" size="sm" className="text-xs">
          <RefreshCcw className="mr-2 h-3.5 w-3.5" />
          Aggiorna
        </Button>
        <Button onClick={clear} variant="destructive" size="sm" className="text-xs">
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Cancella tutto
        </Button>
      </div>
    </Card>
  );
}

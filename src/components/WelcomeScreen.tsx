import { Flag, Plus, Save, Scale, Share, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import type { SavedTournament } from '../lib/tournament-storage';

interface WelcomeScreenProps {
  savedTournament: SavedTournament | null;
  onNewTournament: () => void;
  onResumeTournament: () => void;
}

export default function WelcomeScreen({
  savedTournament,
  onNewTournament,
  onResumeTournament,
}: WelcomeScreenProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-white md:px-8"
      style={{ background: '#020B1F' }}
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

      <div className="glass-card relative z-10 w-full max-w-5xl">
        <div className="text-center">
          <img
            src="/Halo-infinite-header.svg"
            alt="Halo Infinite"
            className="mx-auto mb-6 w-full max-w-[480px]"
            style={{
              height: 'auto',
              filter: 'drop-shadow(0 0 20px rgba(100, 180, 255, 0.30))',
            }}
          />

          <h1
            className="uppercase"
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.16em',
              fontSize: '32px',
              color: '#FFFFFF',
              marginBottom: '12px',
            }}
          >
            Tournament Generator
          </h1>

          <p
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.06em',
              color: 'rgba(200, 220, 255, 0.85)',
              opacity: 0.85,
            }}
          >
            Crea e gestisci tornei competitivi di Halo Infinite
          </p>
        </div>

        {savedTournament && (
          <div className="mt-10 rounded-[24px] border border-cyan-200/30 bg-black/16 p-5 shadow-[0_0_18px_rgba(100,180,255,0.10)]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="m-0 text-lg font-bold text-white">Torneo salvato</h2>
                <p className="mt-2 text-sm text-white/75">
                  Ultimo salvataggio: {formatDate(savedTournament.savedAt)}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  {savedTournament.players.length} giocatori • {savedTournament.teams.length} squadre
                </p>
              </div>
              <Button onClick={onResumeTournament} size="sm">
                <Save className="h-4 w-4" />
                Riprendi torneo
              </Button>
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-6">
          <div>
            <h2
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontWeight: 700,
                fontSize: '18px',
                color: '#FFFFFF',
                letterSpacing: '0.08em',
                margin: 0,
              }}
            >
              Nuovo Torneo
            </h2>
            <p
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: '13px',
                fontWeight: 400,
                color: 'rgba(200, 220, 255, 0.80)',
                marginTop: '6px',
                margin: '6px 0 0 0',
              }}
            >
              Inizia un nuovo torneo da zero
            </p>
          </div>

          <button
            onClick={onNewTournament}
            aria-label="add"
            className="ml-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-cyan-200/40 bg-transparent transition-all duration-300"
            style={{
              boxShadow: '0 0 15px rgba(100, 180, 255, 0.20)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 25px rgba(100, 180, 255, 0.35)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(100, 180, 255, 0.10)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 15px rgba(100, 180, 255, 0.20)';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <Plus className="h-6 w-6" style={{ color: '#64B4FF', strokeWidth: 3 }} />
          </button>
        </div>

        <div className="mt-8 flex justify-center text-center">
          <Button
            onClick={onNewTournament}
            size="lg"
            variant="ghost"
            className="w-full"
            style={{
              height: 'auto',
              borderRadius: '20px',
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.33) 0%, rgba(255, 255, 255, 0.33) 100%), linear-gradient(180deg, rgba(50, 110, 180, 0.40) 0%, rgba(30, 90, 160, 0.60) 100%)',
              border: '1px solid rgba(136, 255, 249, 0.67)',
              boxShadow: '0 9px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
              color: 'rgb(255, 255, 255)',
              fontSize: '36px',
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.09em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(12px)',
              padding: '20px 32px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 0 45px rgba(100, 180, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 0 30px rgba(100, 180, 255, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.10)';
            }}
          >
            Crea nuovo torneo
          </Button>
        </div>

        <div
          className="mt-8 rounded-[24px] border border-cyan-200/35 p-6"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 80, 160, 0.30) 0%, rgba(20, 60, 140, 0.45) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 0 20px rgba(100, 180, 255, 0.10), inset 0 0.5px 0 rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="mb-6 text-center">
            <p
              style={{
                fontFamily: "'Oxanium', sans-serif",
                letterSpacing: '0.14em',
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(200, 220, 255, 0.75)',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Caratteristiche principali
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { Icon: Scale, title: 'Bilanciamento', subtitle: 'Squadre equilibrate' },
              { Icon: Flag, title: 'Mappe/Modalità', subtitle: 'Assegnazione auto' },
              { Icon: Save, title: 'Salvataggio', subtitle: 'Automatico' },
              { Icon: Share, title: 'Export', subtitle: 'Condivisione facile' },
            ].map((item) => (
              <div key={item.title} className="glass-card flex flex-col items-center justify-center p-6">
                <item.Icon
                  className="mb-4"
                  style={{
                    color: '#64B4FF',
                    width: 36,
                    height: 36,
                  }}
                />
                <div
                  style={{
                    fontFamily: "'Oxanium', sans-serif",
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#FFFFFF',
                    letterSpacing: '0.06em',
                    textAlign: 'center',
                    margin: 0,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontFamily: "'Oxanium', sans-serif",
                    fontSize: '12px',
                    fontWeight: 400,
                    color: 'rgba(200, 220, 255, 0.80)',
                    marginTop: '6px',
                    textAlign: 'center',
                  }}
                >
                  {item.subtitle}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-xs text-white/55">
            Questo progetto è un fan project non ufficiale. Halo è un marchio registrato di Microsoft.
          </div>
        </div>

        <div className="mt-6 text-center">
          <span
            style={{
              fontSize: 13,
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: 'rgba(200, 220, 255, 0.78)',
            }}
          >
            Made by MrMarozzo
          </span>
        </div>
      </div>
    </div>
  );
}

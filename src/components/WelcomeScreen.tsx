import { Flag, Save, Scale, Share } from 'lucide-react';
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

  const featureItems = [
    { Icon: Scale, title: 'Bilanciamento', subtitle: 'Squadre equilibrate' },
    { Icon: Flag, title: 'Mappe e modalita', subtitle: 'Assegnazione automatica' },
    { Icon: Save, title: 'Salvataggio', subtitle: 'Ripresa immediata' },
    { Icon: Share, title: 'Export', subtitle: 'Condivisione veloce' },
  ];

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-6 text-white sm:px-4 sm:py-10 md:px-8"
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
            className="mx-auto mb-4 w-full max-w-[440px] px-2 sm:mb-6 sm:max-w-[480px] sm:px-0"
            style={{
              height: 'auto',
              filter: 'drop-shadow(0 0 20px rgba(100, 180, 255, 0.30))',
            }}
          />

          <h1
            className="text-2xl uppercase sm:text-3xl"
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: '#FFFFFF',
              marginBottom: '10px',
            }}
          >
            Tournament Generator
          </h1>

          <p
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: 'clamp(12px, 3.5vw, 14px)',
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
          <div className="mt-8 rounded-[20px] border border-cyan-200/25 bg-black/14 p-4 shadow-[0_0_14px_rgba(100,180,255,0.08)] sm:mt-10 sm:rounded-[24px] sm:p-5">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="m-0 text-base font-bold text-white sm:text-lg">Torneo salvato</h2>
                <p className="mt-2 text-xs text-white/75 sm:text-sm">
                  Ultimo salvataggio: {formatDate(savedTournament.savedAt)}
                </p>
                <p className="mt-1 text-xs text-white/60 sm:text-sm">
                  {savedTournament.players.length} giocatori • {savedTournament.teams.length} squadre
                </p>
              </div>
              <Button onClick={onResumeTournament} size="sm" className="w-full sm:w-auto">
                <Save className="h-4 w-4" />
                Riprendi torneo
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center text-center sm:mt-10">
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
              fontSize: 'clamp(22px, 7vw, 36px)',
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.09em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(12px)',
              padding: '16px 20px',
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

        <div className="mt-4 text-center">
          <p
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: 'clamp(12px, 3.2vw, 14px)',
              fontWeight: 400,
              letterSpacing: '0.05em',
              color: 'rgba(200, 220, 255, 0.76)',
              margin: 0,
            }}
          >
            Imposta i giocatori, genera le squadre e fai partire il bracket in pochi passaggi.
          </p>
        </div>

        <div
          className="mt-7 rounded-[20px] border border-cyan-200/28 p-4 sm:mt-8 sm:rounded-[24px] sm:p-6"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 80, 160, 0.30) 0%, rgba(20, 60, 140, 0.45) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 0 20px rgba(100, 180, 255, 0.10), inset 0 0.5px 0 rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="mb-4 text-center sm:mb-6">
            <p
              style={{
                fontFamily: "'Oxanium', sans-serif",
                letterSpacing: '0.14em',
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(200, 220, 255, 0.75)',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Caratteristiche principali
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {featureItems.map((item) => (
              <div
                key={item.title}
                className="glass-card flex min-h-0 flex-col items-center justify-center gap-1.5 rounded-[18px] p-3.5 text-center sm:min-h-40 sm:gap-0 sm:rounded-[24px] sm:p-6"
              >
                <item.Icon className="mb-1 h-6 w-6 text-[#64B4FF] sm:mb-4 sm:h-9 sm:w-9" />
                <div
                  style={{
                    fontFamily: "'Oxanium', sans-serif",
                    fontWeight: 700,
                    fontSize: '13px',
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
                    fontSize: '11px',
                    fontWeight: 400,
                    color: 'rgba(200, 220, 255, 0.80)',
                    marginTop: '2px',
                    textAlign: 'center',
                  }}
                >
                  {item.subtitle}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 text-center text-[11px] text-white/55 sm:mt-8 sm:text-xs">
            Questo progetto e un fan project non ufficiale. Halo e un marchio registrato di Microsoft.
          </div>
        </div>

        <div className="mt-5 text-center sm:mt-6">
          <span
            style={{
              fontSize: 12,
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

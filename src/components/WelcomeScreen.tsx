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
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-5 text-white sm:px-4 sm:py-10 md:px-8"
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
            className="mx-auto mb-4 w-full max-w-[340px] px-1 sm:mb-6 sm:max-w-[480px] sm:px-0"
            style={{
              height: 'auto',
              filter: 'drop-shadow(0 0 20px rgba(245, 180, 76, 0.24))',
            }}
          />

          <h1
            className="text-[clamp(1.45rem,1.1rem+1.8vw,2.1rem)] uppercase sm:text-[clamp(1.8rem,1.25rem+1.8vw,2.4rem)]"
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: '#FFFFFF',
              marginBottom: '8px',
            }}
          >
            Tournament Generator
          </h1>

          <p
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: 'clamp(11px, 3vw, 14px)',
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
        <div className="mt-7 rounded-[18px] border border-amber-200/25 bg-black/14 p-3.5 shadow-[0_0_14px_rgba(245,180,76,0.08)] sm:mt-10 sm:rounded-[24px] sm:p-5">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="m-0 text-[clamp(0.98rem,0.9rem+0.45vw,1.15rem)] font-bold text-white">Torneo salvato</h2>
                <p className="mt-2 text-[clamp(0.72rem,0.7rem+0.16vw,0.86rem)] text-white/75 sm:text-sm">
                  Ultimo salvataggio: {formatDate(savedTournament.savedAt)}
                </p>
                <p className="mt-1 text-[clamp(0.72rem,0.7rem+0.16vw,0.86rem)] text-white/60 sm:text-sm">
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

        <div className="mt-7 flex justify-center text-center sm:mt-10">
          <Button
            onClick={onNewTournament}
            size="lg"
            variant="ghost"
            className="w-full"
            style={{
              height: 'auto',
              borderRadius: '18px',
              background:
                'linear-gradient(180deg, rgba(255, 252, 244, 0.34) 0%, rgba(255, 247, 224, 0.28) 100%), linear-gradient(180deg, rgba(245, 180, 76, 0.78) 0%, rgba(180, 110, 22, 0.95) 100%)',
              border: '1px solid rgba(255, 214, 140, 0.78)',
              boxShadow: '0 9px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
              color: 'rgb(36, 19, 0)',
              fontSize: 'clamp(19px, 6.4vw, 36px)',
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.09em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(12px)',
              padding: '14px 18px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 0 45px rgba(245, 180, 76, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 0 30px rgba(245, 180, 76, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.10)';
            }}
          >
            Crea nuovo torneo
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: 'clamp(11px, 2.9vw, 14px)',
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
          className="mt-6 rounded-[18px] border border-amber-200/20 px-3 py-3 sm:mt-8 sm:rounded-[24px] sm:px-5 sm:py-5"
          style={{
            background: 'linear-gradient(180deg, rgba(117, 76, 16, 0.34) 0%, rgba(64, 38, 10, 0.56) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 0 22px rgba(245, 180, 76, 0.14), inset 0 0.5px 0 rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="mb-3 text-center sm:mb-4">
            <p
              style={{
                fontFamily: "'Oxanium', sans-serif",
                letterSpacing: '0.12em',
                fontSize: 'clamp(10px, 2.6vw, 11px)',
                fontWeight: 600,
                color: 'rgba(200, 220, 255, 0.68)',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Caratteristiche principali
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {featureItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-2.5 rounded-[16px] border border-amber-200/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.04)_100%)] px-3 py-2.5 text-left shadow-[0_0_14px_rgba(245,180,76,0.08)] sm:gap-3 sm:rounded-[18px] sm:px-4 sm:py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300/28 bg-amber-300/14 sm:h-9 sm:w-9">
                  <item.Icon className="h-[15px] w-[15px] text-[#f5b44c] sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div
                    style={{
                      fontFamily: "'Oxanium', sans-serif",
                      fontWeight: 700,
                      fontSize: 'clamp(11px, 2.8vw, 12px)',
                      color: '#FFFFFF',
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Oxanium', sans-serif",
                      fontSize: 'clamp(10px, 2.5vw, 11px)',
                      fontWeight: 400,
                      color: 'rgba(216, 232, 255, 0.84)',
                      marginTop: '2px',
                    }}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-[clamp(9px,2.3vw,11px)] text-white/58 sm:mt-5">
            Questo progetto e un fan project non ufficiale. Halo e un marchio registrato di Microsoft.
          </div>
        </div>

        <div className="mt-5 text-center sm:mt-6">
          <span
            style={{
              fontSize: 11,
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

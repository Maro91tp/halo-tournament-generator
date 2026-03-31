import { Flag, Save, Scale, Share } from 'lucide-react';
import { Button } from './ui/button';
import type { SavedTournamentRecord } from '../lib/tournament-storage';
import type { Language } from '../lib/language';

interface WelcomeScreenProps {
  language: Language;
  savedTournaments: SavedTournamentRecord[];
  onNewTournament: () => void;
  onLoadSavedTournament: (id: string) => void;
}

export default function WelcomeScreen({
  language,
  savedTournaments,
  onNewTournament,
  onLoadSavedTournament,
}: WelcomeScreenProps) {
  const copy = language === 'it'
    ? {
        subtitle: 'Crea e gestisci tornei competitivi di Halo Infinite',        create: 'Crea nuovo torneo',
        helper: 'Imposta i giocatori, genera le squadre e fai partire il bracket in pochi passaggi.',
        featuresTitle: 'Caratteristiche principali',
        footer: 'Questo progetto e un fan project non ufficiale. Halo e un marchio registrato di Microsoft.',
        about: 'About',
        libraryTitle: 'Carica torneo',
        activeTournaments: 'Tornei attivi',
        completedTournaments: 'Tornei completati',
        noSavedTournaments: 'Nessun torneo nominato salvato per ora.',
        tournamentType: 'Tipo torneo',
        savedOn: 'Salvato il',
        expiresOn: 'Scade il',
        load: 'Carica torneo',
        completedBadge: 'Completato',
        activeBadge: 'Attivo',
        completedHelper: 'I tornei completati restano disponibili per 30 giorni, cosi puoi scaricare o ricontrollare i risultati.',
        features: [
          { title: 'Bilanciamento', subtitle: 'Squadre equilibrate' },
          { title: 'Mappe e modalita', subtitle: 'Assegnazione automatica' },
          { title: 'Salvataggio', subtitle: 'Ripresa immediata' },
          { title: 'Export', subtitle: 'Condivisione veloce' },
        ],
      }
    : {
        subtitle: 'Create and manage competitive Halo Infinite tournaments',        create: 'Create new tournament',
        helper: 'Set up players, generate teams, and launch the bracket in just a few steps.',
        featuresTitle: 'Main features',
        footer: 'This project is an unofficial fan project. Halo is a registered trademark of Microsoft.',
        about: 'About',
        libraryTitle: 'Load tournament',
        activeTournaments: 'Active tournaments',
        completedTournaments: 'Completed tournaments',
        noSavedTournaments: 'No named tournaments saved yet.',
        tournamentType: 'Tournament type',
        savedOn: 'Saved on',
        expiresOn: 'Expires on',
        load: 'Load tournament',
        completedBadge: 'Completed',
        activeBadge: 'Active',
        completedHelper: 'Completed tournaments stay available for 30 days, so you can download or review the results.',
        features: [
          { title: 'Balancing', subtitle: 'Balanced teams' },
          { title: 'Maps and modes', subtitle: 'Automatic assignment' },
          { title: 'Saving', subtitle: 'Instant resume' },
          { title: 'Export', subtitle: 'Quick sharing' },
        ],
      };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const featureItems = [
    { Icon: Scale, ...copy.features[0] },
    { Icon: Flag, ...copy.features[1] },
    { Icon: Save, ...copy.features[2] },
    { Icon: Share, ...copy.features[3] },
  ];
  const activeTournaments = savedTournaments.filter((tournament) => tournament.status === 'active');
  const completedTournaments = savedTournaments.filter((tournament) => tournament.status === 'completed');

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
      <div className="absolute inset-0 z-0 bg-slate-950/28" />

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
            {copy.subtitle}
          </p>
        </div>

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
              boxShadow:
                '0 0 24px rgba(245, 180, 76, 0.18), 0 9px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
              color: 'rgb(36, 19, 0)',
              fontSize: 'clamp(19px, 6.4vw, 36px)',
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.09em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(12px)',
              padding: '14px 18px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 0 42px rgba(245, 180, 76, 0.34), 0 12px 18px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 0 24px rgba(245, 180, 76, 0.18), 0 9px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.10)';
            }}
          >
            {copy.create}
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
            {copy.helper}
          </p>
        </div>

        <div className="mt-6 rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,52,0.68)_0%,rgba(8,15,42,0.8)_100%)] p-3.5 shadow-[0_0_22px_rgba(8,18,52,0.18)] sm:mt-8 sm:rounded-[24px] sm:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:mb-5">
            <h2 className="m-0 text-[clamp(0.98rem,0.9rem+0.45vw,1.15rem)] font-bold text-white">{copy.libraryTitle}</h2>
            <p className="text-[clamp(0.72rem,0.7rem+0.16vw,0.86rem)] text-white/65 sm:text-sm">
              {copy.completedHelper}
            </p>
          </div>

          {savedTournaments.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-white/14 bg-[rgba(255,255,255,0.05)] px-4 py-5 text-[clamp(0.72rem,0.7rem+0.16vw,0.86rem)] text-white/60 sm:text-sm">
              {copy.noSavedTournaments}
            </div>
          ) : (
            <div className="space-y-5">
              {activeTournaments.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] font-semibold uppercase tracking-[0.12em] text-white/70">
                    {copy.activeTournaments}
                  </div>
                  <div className="grid gap-3">
                    {activeTournaments.map((tournament) => (
                      <SavedTournamentRow
                        key={tournament.id}
                        tournament={tournament}
                        language={language}
                        copy={copy}
                        onLoad={onLoadSavedTournament}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {completedTournaments.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] font-semibold uppercase tracking-[0.12em] text-white/70">
                    {copy.completedTournaments}
                  </div>
                  <div className="grid gap-3">
                    {completedTournaments.map((tournament) => (
                      <SavedTournamentRow
                        key={tournament.id}
                        tournament={tournament}
                        language={language}
                        copy={copy}
                        onLoad={onLoadSavedTournament}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="mt-6 rounded-[18px] border border-amber-200/20 px-3 py-3 sm:mt-8 sm:rounded-[24px] sm:px-5 sm:py-5"
          style={{
            background: 'linear-gradient(180deg, rgba(28, 78, 150, 0.56) 0%, rgba(15, 48, 104, 0.76) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 0 22px rgba(100, 180, 255, 0.16), inset 0 0.5px 0 rgba(255, 255, 255, 0.1)',
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
              {copy.featuresTitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {featureItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-2.5 rounded-[16px] border border-cyan-200/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.08)_100%)] px-3 py-2.5 text-left shadow-[0_0_14px_rgba(100,180,255,0.1)] sm:gap-3 sm:rounded-[18px] sm:px-4 sm:py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/28 bg-cyan-300/14 sm:h-9 sm:w-9">
                  <item.Icon className="h-[15px] w-[15px] text-[#64B4FF] sm:h-5 sm:w-5" />
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
            {copy.footer}
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
          <div className="mt-3">
            <a
              href="/about"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/54 transition hover:text-primary"
            >
              {copy.about}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function SavedTournamentRow({
  tournament,
  language,
  copy,
  onLoad,
  formatDate,
}: {
  tournament: SavedTournamentRecord;
  language: Language;
  copy: Record<string, string | { title: string; subtitle: string }[]>;
  onLoad: (id: string) => void;
  formatDate: (isoString: string) => string;
}) {
  const statusLabel = tournament.status === 'completed' ? copy.completedBadge : copy.activeBadge;
  const typeLabel = tournament.config?.type === 'slayer'
    ? (language === 'en' ? 'Slayer' : 'Massacro')
    : 'Ranked';

  return (
    <div className="rounded-[16px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)] p-3 shadow-[0_0_14px_rgba(6,16,42,0.12)] sm:rounded-[20px] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-[clamp(0.9rem,0.84rem+0.24vw,1.02rem)] font-semibold text-white">
              {tournament.name}
            </div>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] sm:px-2.5 sm:py-1 sm:text-[10px] ${
              tournament.status === 'completed'
                ? 'border border-amber-200/25 bg-amber-200/10 text-amber-50'
                : 'border border-cyan-200/25 bg-cyan-300/10 text-cyan-100'
            }`}>
              {statusLabel as string}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[clamp(0.7rem,0.68rem+0.15vw,0.84rem)] text-white/62 sm:text-sm">
            <span>{copy.tournamentType as string}: {typeLabel} - {tournament.config?.teamMode ?? '-'}</span>
            <span>{copy.savedOn as string}: {formatDate(tournament.savedAt)}</span>
            {tournament.status === 'completed' && tournament.expiresAt && (
              <span>{copy.expiresOn as string}: {formatDate(tournament.expiresAt)}</span>
            )}
          </div>
        </div>
        <Button onClick={() => onLoad(tournament.id)} variant={tournament.status === 'completed' ? 'outline' : 'default'} className="w-full sm:w-auto">
          <Save className="h-4 w-4" />
          {copy.load as string}
        </Button>
      </div>
    </div>
  );
}

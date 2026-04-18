import { Flag, Save, Scale, Share } from 'lucide-react';
import { Button } from './ui/button';
import type { SavedTournament, SavedTournamentRecord } from '../lib/tournament-storage';
import type { Language } from '../lib/language';
import { APP_VERSION_LABEL } from '../lib/app-version';

interface WelcomeScreenProps {
  language: Language;
  savedTournament?: SavedTournament | null;
  savedTournaments: SavedTournamentRecord[];
  onNewTournament: () => void;
  onResumeTournament?: () => void;
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
        version: 'Versione',
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
        version: 'Version',
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
      className="welcome-shell relative flex min-h-screen items-start justify-center overflow-hidden px-2.5 py-3 text-white sm:px-4 sm:py-5 md:px-6"
    >
      <div className="welcome-bg absolute inset-0 z-0" />
      <div className="absolute inset-0 z-0 bg-slate-950/28" />

      <div className="glass-card relative z-10 w-full max-w-5xl">
        <div className="text-center">
          <img
            src="/Halo-infinite-header.svg"
            alt="Halo Infinite"
            className="welcome-logo mx-auto mb-2 w-full max-w-[260px] px-1 sm:mb-3 sm:max-w-[360px] sm:px-0"
          />

          <h1 className="welcome-title text-[clamp(1.18rem,0.98rem+1.25vw,1.7rem)] uppercase sm:text-[clamp(1.35rem,1.1rem+1.2vw,1.95rem)]">
            Tournament Generator
          </h1>

          <p className="welcome-copy">{copy.subtitle}</p>
        </div>

        <div className="mt-4 flex justify-center text-center sm:mt-5">
          <Button
            onClick={onNewTournament}
            size="lg"
            variant="ghost"
            className="welcome-primary-cta w-full"
          >
            {copy.create}
          </Button>
        </div>

        <div className="mt-2.5 text-center">
          <p className="welcome-helper">{copy.helper}</p>
        </div>

        <div className="mt-4 rounded-[14px] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,52,0.68)_0%,rgba(8,15,42,0.8)_100%)] p-2.5 shadow-[0_0_22px_rgba(8,18,52,0.18)] sm:mt-5 sm:rounded-[18px] sm:p-4">
          <div className="mb-2.5 flex flex-col gap-1 sm:mb-3">
            <h2 className="m-0 text-[clamp(0.98rem,0.9rem+0.45vw,1.15rem)] font-bold text-white">{copy.libraryTitle}</h2>
            <p className="text-[clamp(0.72rem,0.7rem+0.16vw,0.86rem)] text-white/65 sm:text-sm">
              {copy.completedHelper}
            </p>
          </div>

          {savedTournaments.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-white/14 bg-[rgba(255,255,255,0.05)] px-3 py-3 text-[clamp(0.72rem,0.7rem+0.16vw,0.86rem)] text-white/60 sm:text-sm">
              {copy.noSavedTournaments}
            </div>
          ) : (
            <div className="space-y-3">
              {activeTournaments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] font-semibold uppercase tracking-[0.12em] text-white/70">
                    {copy.activeTournaments}
                  </div>
                  <div className="grid gap-2">
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
                <div className="space-y-2">
                  <div className="text-[clamp(0.78rem,0.74rem+0.18vw,0.92rem)] font-semibold uppercase tracking-[0.12em] text-white/70">
                    {copy.completedTournaments}
                  </div>
                  <div className="grid gap-2">
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

        <div className="welcome-feature-panel mt-4 rounded-[14px] border border-amber-200/20 px-2.5 py-2.5 sm:mt-5 sm:rounded-[18px] sm:px-4 sm:py-3.5">
          <div className="mb-2 text-center sm:mb-2.5">
            <p className="welcome-feature-title">{copy.featuresTitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
            {featureItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-2 rounded-[12px] border border-cyan-200/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.08)_100%)] px-2.5 py-2 text-left shadow-[0_0_14px_rgba(100,180,255,0.1)] sm:gap-2.5 sm:rounded-[14px] sm:px-3 sm:py-2.5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-300/28 bg-cyan-300/14 sm:h-8 sm:w-8">
                  <item.Icon className="h-[15px] w-[15px] text-[#64B4FF] sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="welcome-feature-name">{item.title}</div>
                  <div className="welcome-feature-subtitle">{item.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-center text-[clamp(9px,2.3vw,11px)] text-white/58 sm:mt-4">
            {copy.footer}
          </div>
        </div>

        <div className="mt-3 text-center sm:mt-4">
          <span className="welcome-credit">Made by MrMarozzo</span>
          <div className="mt-1 text-[10px] font-medium tracking-[0.08em] text-white/44 sm:text-[11px]">
            {copy.version} {APP_VERSION_LABEL}
          </div>
          <div className="mt-2">
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
    <div className="rounded-[12px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)] p-2.5 shadow-[0_0_14px_rgba(6,16,42,0.12)] sm:rounded-[16px] sm:p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[clamp(0.68rem,0.66rem+0.12vw,0.78rem)] text-white/62 sm:text-xs">
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

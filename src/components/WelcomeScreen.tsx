import { useEffect, useRef } from 'react';
import { Flag, GitBranch, LockKeyhole, Save, Scale, Share, Swords, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import type { SavedTournament, SavedTournamentRecord } from '../lib/tournament-storage';
import type { Language } from '../lib/language';
import { APP_VERSION_LABEL } from '../lib/app-version';
import LanguageToggle from './LanguageToggle';

interface WelcomeScreenProps {
  language: Language;
  savedTournament?: SavedTournament | null;
  savedTournaments: SavedTournamentRecord[];
  onNewTournament: () => void;
  onResumeTournament?: () => void;
  onLoadSavedTournament: (id: string) => void;
  onToggleLanguage: () => void;
}

export default function WelcomeScreen({
  language,
  savedTournaments,
  onNewTournament,
  onLoadSavedTournament,
  onToggleLanguage,
}: WelcomeScreenProps) {
  const copy = language === 'it'
    ? {
        subtitle: 'Crea e gestisci tornei competitivi di Halo Infinite',
        create: 'Crea nuovo torneo',
        helper: 'Imposta i giocatori, genera le squadre e fai partire il bracket in pochi passaggi.',
        featuresTitle: 'Caratteristiche principali',
        footer: 'Questo progetto e un fan project non ufficiale. Halo e un marchio registrato di Microsoft.',
        about: 'About',
        version: 'Versione',
        libraryTitle: 'Carica torneo',
        activeTournaments: 'Tornei attivi',
        completedTournaments: 'Tornei completati',
        noSavedTournaments: 'Nessun torneo nominato salvato per ora.',
        emptyTitle: 'Nessun torneo salvato',
        emptyHelper: '',
        tournamentType: 'Tipo torneo',
        savedOn: 'Salvato il',
        expiresOn: 'Scade il',
        load: 'Carica torneo',
        completedBadge: 'Completato',
        activeBadge: 'Attivo',
        completedHelper: 'I tornei completati restano disponibili per 30 giorni, cosi puoi scaricare o ricontrollare i risultati.',
        features: [
          { title: 'Bilanciamento', subtitle: 'Squadre equilibrate' },
          { title: 'Pool mappe', subtitle: 'Mode abbinate' },
          { title: 'Salvataggio', subtitle: 'Ripresa immediata' },
          { title: 'Export', subtitle: 'Condivisione veloce' },
          { title: 'Bracket', subtitle: 'Percorso automatico' },
          { title: 'Match', subtitle: 'Partite guidate' },
          { title: 'Password', subtitle: 'Accesso protetto' },
          { title: 'Risultati', subtitle: 'Finale pronta' },
        ],
      }
    : {
        subtitle: 'Create and manage competitive Halo Infinite tournaments',
        create: 'Create new tournament',
        helper: 'Set up players, generate teams, and launch the bracket in just a few steps.',
        featuresTitle: 'Main features',
        footer: 'This project is an unofficial fan project. Halo is a registered trademark of Microsoft.',
        about: 'About',
        version: 'Version',
        libraryTitle: 'Load tournament',
        activeTournaments: 'Active tournaments',
        completedTournaments: 'Completed tournaments',
        noSavedTournaments: 'No named tournaments saved yet.',
        emptyTitle: 'No saved tournaments',
        emptyHelper: '',
        tournamentType: 'Tournament type',
        savedOn: 'Saved on',
        expiresOn: 'Expires on',
        load: 'Load tournament',
        completedBadge: 'Completed',
        activeBadge: 'Active',
        completedHelper: 'Completed tournaments stay available for 30 days, so you can download or review the results.',
        features: [
          { title: 'Balancing', subtitle: 'Balanced teams' },
          { title: 'Map pool', subtitle: 'Matched modes' },
          { title: 'Saving', subtitle: 'Instant resume' },
          { title: 'Export', subtitle: 'Quick sharing' },
          { title: 'Bracket', subtitle: 'Automatic path' },
          { title: 'Matches', subtitle: 'Guided games' },
          { title: 'Password', subtitle: 'Protected access' },
          { title: 'Results', subtitle: 'Final ready' },
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
    { Icon: GitBranch, ...copy.features[4] },
    { Icon: Swords, ...copy.features[5] },
    { Icon: LockKeyhole, ...copy.features[6] },
    { Icon: Trophy, ...copy.features[7] },
  ];
  const featureCarouselRef = useRef<HTMLDivElement | null>(null);
  const isCarouselUserControlledRef = useRef(false);
  const carouselAnimationFrameRef = useRef<number | null>(null);
  const carouselReleaseTimerRef = useRef<number | null>(null);
  const carouselScrollPositionRef = useRef(0);
  const activeTournaments = savedTournaments.filter((tournament) => tournament.status === 'active');
  const completedTournaments = savedTournaments.filter((tournament) => tournament.status === 'completed');

  const markCarouselUserControlled = () => {
    isCarouselUserControlledRef.current = true;

    if (carouselReleaseTimerRef.current) {
      window.clearTimeout(carouselReleaseTimerRef.current);
    }

    carouselReleaseTimerRef.current = window.setTimeout(() => {
      isCarouselUserControlledRef.current = false;
    }, 4200);
  };

  useEffect(() => {
    const carousel = featureCarouselRef.current;
    if (!carousel) return undefined;

    let previousTime = performance.now();

    const tick = (time: number) => {
      const elapsedSeconds = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      if (!isCarouselUserControlledRef.current) {
        const firstSet = carousel.querySelector<HTMLElement>('.welcome-feature-set');
        const loopWidth = firstSet?.scrollWidth ?? 0;

        if (loopWidth > 0) {
          carouselScrollPositionRef.current += elapsedSeconds * 18;

          if (carouselScrollPositionRef.current >= loopWidth) {
            carouselScrollPositionRef.current -= loopWidth;
          }

          carousel.scrollLeft = carouselScrollPositionRef.current;
        }
      }

      carouselAnimationFrameRef.current = window.requestAnimationFrame(tick);
    };

    carouselAnimationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (carouselAnimationFrameRef.current) {
        window.cancelAnimationFrame(carouselAnimationFrameRef.current);
      }

      if (carouselReleaseTimerRef.current) {
        window.clearTimeout(carouselReleaseTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="welcome-shell relative flex min-h-screen items-center justify-center overflow-hidden px-2 py-4 text-white sm:px-4 sm:py-5 md:px-6"
    >
      <div className="welcome-bg absolute inset-0 z-0" />
      <div className="absolute inset-0 z-0 bg-slate-950/28" />

      <div className="glass-card relative z-10 flex min-h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col sm:min-h-0">
        <div className="welcome-language-row">
          <LanguageToggle language={language} onToggle={onToggleLanguage} />
        </div>

        <div className="welcome-hero text-center">
          <img
            src="/Halo-infinite-header.svg"
            alt="Halo Infinite"
            className="welcome-logo mx-auto mb-1.5 w-full max-w-[200px] px-1 sm:mb-3 sm:max-w-[340px] sm:px-0"
          />

          <h1 className="welcome-title text-[clamp(1.02rem,0.9rem+0.85vw,1.24rem)] uppercase sm:text-[clamp(1.35rem,1.1rem+1.2vw,1.95rem)]">
            Tournament Generator
          </h1>

          <p className="welcome-copy">{copy.subtitle}</p>
        </div>

        <div className="welcome-cta-wrap flex justify-center text-center">
          <Button
            onClick={onNewTournament}
            size="lg"
            variant="ghost"
            className="welcome-primary-cta mx-auto w-full max-w-[25rem]"
          >
            {copy.create}
          </Button>
        </div>

        <div className="welcome-lower-content flex flex-1 flex-col">
        <div className="welcome-library-panel rounded-[8px] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,52,0.68)_0%,rgba(8,15,42,0.8)_100%)] p-3 text-center shadow-[0_0_22px_rgba(8,18,52,0.18)] sm:mt-5 sm:p-4 sm:text-left">
          <div className="mb-2 flex flex-col gap-1 sm:mb-2.5">
            <h2 className="m-0 text-[clamp(0.98rem,0.9rem+0.45vw,1.15rem)] font-bold text-white">{copy.libraryTitle}</h2>
            <p className="text-[clamp(0.72rem,0.7rem+0.16vw,0.86rem)] text-white/65 sm:text-sm">
              {copy.completedHelper}
            </p>
          </div>

          {savedTournaments.length === 0 ? (
            <div className="welcome-empty-state rounded-[8px] border border-dashed border-white/14 bg-[rgba(255,255,255,0.05)] px-3 text-white/70 sm:px-4">
              <div className="text-[clamp(0.94rem,0.88rem+0.22vw,1.06rem)] font-semibold text-white">
                {copy.emptyTitle}
              </div>
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

        <div className="welcome-feature-panel rounded-[8px] px-2.5 py-2.5 sm:px-3 sm:py-3">
          <div className="welcome-feature-heading-gap text-center">
            <p className="welcome-feature-title">{copy.featuresTitle}</p>
          </div>

          <div
            ref={featureCarouselRef}
            className="welcome-feature-carousel"
            aria-label={copy.featuresTitle}
            onPointerDown={markCarouselUserControlled}
            onTouchStart={markCarouselUserControlled}
            onScroll={() => {
              if (featureCarouselRef.current) {
                carouselScrollPositionRef.current = featureCarouselRef.current.scrollLeft;
              }
            }}
            onWheel={markCarouselUserControlled}
          >
            <div className="welcome-feature-scroll">
              {[0, 1].map((setIndex) => (
                <div className="welcome-feature-set" key={setIndex} aria-hidden={setIndex === 1}>
                  {featureItems.map((item) => (
                    <div
                      key={`${item.title}-${setIndex}`}
                      className="welcome-feature-card flex min-h-[58px] items-center justify-start gap-2.5 rounded-[8px] px-2.5 py-2 text-left sm:px-3 sm:py-2"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-200/18 bg-cyan-200/8">
                        <item.Icon className="h-4 w-4 text-[#72C6FF]/80" strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <div className="welcome-feature-name leading-tight">{item.title}</div>
                        <div className="welcome-feature-subtitle">{item.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
                  </div>
          </div>

          <div className="welcome-footer-note text-center text-[clamp(9px,2.3vw,11px)]">
            {copy.footer}
          </div>
        </div>

        <div className="welcome-meta-footer mt-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pt-3 text-center sm:pt-4">
          <span className="welcome-credit">Made by MrMarozzo</span>
          <span className="welcome-meta-dot" aria-hidden="true">/</span>
          <span className="welcome-version">
            {copy.version} {APP_VERSION_LABEL}
          </span>
          <span className="welcome-meta-dot" aria-hidden="true">/</span>
          <a
            href="/about"
            className="welcome-about-link inline-flex items-center justify-center font-semibold uppercase transition hover:text-primary"
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

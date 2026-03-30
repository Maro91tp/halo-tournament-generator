import type { ReactNode } from 'react';
import { ArrowLeft, Crown, Medal, RefreshCcw, Sparkles, Swords, Trophy } from 'lucide-react';
import type { Game, Match, Player, Team, Tournament } from '../types/tournament';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { getGameModeDisplay, getMatchDurationDisplay } from '../lib/tournament-utils';
import { RankIcon } from './TournamentIcons';

interface TournamentVictoryScreenProps {
  tournament: Tournament;
  onBack: () => void;
  onReplay: () => void;
  onReset: () => void;
}

interface PlayerSummary {
  player: Player;
  kills: number;
  gameWins: number;
  appearances: number;
}

interface WinnerStats {
  seriesWins: number;
  gameWins: number;
  totalKills: number;
  objectivePoints: number;
  mvp: PlayerSummary;
  playerSummaries: PlayerSummary[];
}

export default function TournamentVictoryScreen({
  tournament,
  onBack,
  onReplay,
  onReset,
}: TournamentVictoryScreenProps) {
  if (!tournament.winner) return null;

  const completedMatches = tournament.rounds.flatMap((round) => round.matches).filter((match) => match.winner);
  const winnerStats = getWinnerStats(tournament.winner, completedMatches);
  const celebrationBursts = [
    { left: '8%', top: '14%', delay: '0s', size: '0.5rem' },
    { left: '18%', top: '70%', delay: '0.9s', size: '0.4rem' },
    { left: '32%', top: '18%', delay: '1.4s', size: '0.7rem' },
    { left: '67%', top: '16%', delay: '0.5s', size: '0.55rem' },
    { left: '81%', top: '68%', delay: '1.1s', size: '0.45rem' },
    { left: '92%', top: '24%', delay: '1.8s', size: '0.65rem' },
  ];
  const celebrationLines = [
    { left: '14%', top: '32%', width: '4.5rem', delay: '0.2s', rotate: '-8deg' },
    { left: '77%', top: '28%', width: '3.6rem', delay: '1.3s', rotate: '11deg' },
    { left: '72%', top: '72%', width: '5.2rem', delay: '0.8s', rotate: '-18deg' },
    { left: '27%', top: '78%', width: '3.2rem', delay: '1.7s', rotate: '14deg' },
  ];
  const celebrationRays = [
    { left: '50%', top: '-4%', rotate: '-24deg', delay: '0s', height: '22rem' },
    { left: '50%', top: '-5%', rotate: '-8deg', delay: '0.35s', height: '24rem' },
    { left: '50%', top: '-6%', rotate: '8deg', delay: '0.7s', height: '24rem' },
    { left: '50%', top: '-4%', rotate: '24deg', delay: '1.05s', height: '22rem' },
  ];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <style>{`
        @keyframes haloVictoryFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.03); }
        }
        @keyframes haloVictoryIntro {
          0% { opacity: 0; transform: translateY(34px) scale(0.62); filter: blur(10px); }
          55% { opacity: 1; transform: translateY(-10px) scale(1.08); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes haloVictoryPulse {
          0%, 100% { opacity: 0.5; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes haloVictorySpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes haloVictorySpark {
          0%, 100% { opacity: 0; transform: translateY(10px) scale(0.7); }
          30% { opacity: 1; }
          60% { opacity: 0.75; transform: translateY(-10px) scale(1); }
        }
        @keyframes haloVictoryShimmer {
          0% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
          35% { opacity: 0.75; }
          100% { transform: translateX(190%) skewX(-18deg); opacity: 0; }
        }
        @keyframes haloVictorySweep {
          0%, 100% { opacity: 0.18; transform: rotate(0deg) scale(0.98); }
          50% { opacity: 0.45; transform: rotate(8deg) scale(1.04); }
        }
        @keyframes haloVictoryLine {
          0%, 100% { opacity: 0; transform: translateY(8px) rotate(var(--line-rotate)) scaleX(0.8); }
          35% { opacity: 0.9; }
          65% { opacity: 0.35; transform: translateY(-6px) rotate(var(--line-rotate)) scaleX(1); }
        }
        @keyframes haloVictoryFlash {
          0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.72); }
          18% { opacity: 0.85; }
          45% { opacity: 0.18; transform: translate(-50%, -50%) scale(1.18); }
        }
        @keyframes haloVictoryNameReveal {
          0% { opacity: 0; transform: translateY(22px); letter-spacing: 0.34em; filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 0.02em; filter: blur(0); }
        }
        @keyframes haloVictoryPlate {
          0% { opacity: 0; transform: translateY(22px) scale(0.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes haloVictoryMegaPulse {
          0%, 100% { opacity: 0.24; transform: scale(0.92); }
          50% { opacity: 0.56; transform: scale(1.12); }
        }
        @keyframes haloVictoryRay {
          0%, 100% { opacity: 0.12; transform: translateX(-50%) rotate(var(--ray-rotate)) scaleY(0.92); }
          50% { opacity: 0.4; transform: translateX(-50%) rotate(var(--ray-rotate)) scaleY(1.08); }
        }
        @keyframes haloVictoryOrbit {
          from { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
          to { transform: translate(-50%, -50%) rotate(-360deg) scale(1); }
        }
        @keyframes haloVictoryStageGlow {
          0%, 100% { opacity: 0.55; transform: scaleX(0.96); }
          50% { opacity: 0.95; transform: scaleX(1.04); }
        }
      `}</style>

      <section className="relative overflow-hidden rounded-[28px] border border-amber-300/44 bg-[radial-gradient(circle_at_top,rgba(255,215,120,0.48),transparent_24%),radial-gradient(circle_at_bottom,rgba(104,44,0,0.38),transparent_40%),linear-gradient(180deg,rgba(54,30,0,0.99)_0%,rgba(22,14,32,0.99)_48%,rgba(7,10,28,1)_100%)] px-4 py-8 shadow-[0_0_110px_rgba(245,180,76,0.3)] sm:px-6 sm:py-12 md:rounded-[40px] md:px-12 md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_52%)]" />
        <div className="pointer-events-none absolute inset-x-[-10%] top-[-12%] h-[58%] bg-[radial-gradient(circle_at_top,rgba(255,232,174,0.34),transparent_60%)]" />
        <div
          className="pointer-events-none absolute left-1/2 top-[-18%] h-[24rem] w-[140%] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,rgba(255,222,145,0.28),rgba(255,222,145,0.04),rgba(255,222,145,0.28))] opacity-80 blur-2xl"
          style={{ animation: 'haloVictorySweep 8s ease-in-out infinite' }}
        />
        <div className="pointer-events-none absolute left-1/2 top-[6%] h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,228,152,0.32),transparent_65%)] blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-[30%] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full border border-amber-200/18 bg-[radial-gradient(circle,rgba(255,215,106,0.16),transparent_62%)] blur-2xl" />
        <div
          className="pointer-events-none absolute left-1/2 top-[38%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(255,215,106,0.18),transparent_58%)] blur-3xl"
          style={{ animation: 'haloVictoryMegaPulse 6.2s ease-in-out infinite' }}
        />
        {celebrationRays.map((ray, index) => (
          <div
            key={`${ray.rotate}-${index}`}
            className="pointer-events-none absolute w-[7rem] rounded-full bg-[linear-gradient(180deg,rgba(255,243,204,0.62)_0%,rgba(255,206,92,0.26)_38%,transparent_100%)] blur-md"
            style={{
              left: ray.left,
              top: ray.top,
              height: ray.height,
              ['--ray-rotate' as string]: ray.rotate,
              animation: `haloVictoryRay 4.8s ease-in-out infinite ${ray.delay}`,
            }}
          />
        ))}
        <div
          className="pointer-events-none absolute left-1/2 top-[37%] h-[17rem] w-[17rem] rounded-full border border-amber-200/20"
          style={{ animation: 'haloVictoryPulse 4.6s ease-in-out infinite' }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[37%] h-[22rem] w-[22rem] rounded-full border border-amber-200/10"
          style={{ animation: 'haloVictoryPulse 5.6s ease-in-out infinite 0.6s' }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[37%] h-[21rem] w-[21rem] opacity-50"
          style={{ animation: 'haloVictorySpin 18s linear infinite' }}
        >
          <div className="absolute left-1/2 top-0 h-10 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-100/80 to-transparent" />
          <div className="absolute bottom-0 left-1/2 h-10 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-t from-amber-100/60 to-transparent" />
          <div className="absolute left-0 top-1/2 h-[2px] w-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-100/70 to-transparent" />
          <div className="absolute right-0 top-1/2 h-[2px] w-10 -translate-y-1/2 rounded-full bg-gradient-to-l from-amber-100/70 to-transparent" />
        </div>
        <div
          className="pointer-events-none absolute left-1/2 top-[37%] h-[26rem] w-[26rem] opacity-40"
          style={{ animation: 'haloVictoryOrbit 28s linear infinite' }}
        >
          <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-amber-100 shadow-[0_0_18px_rgba(255,226,144,0.72)]" />
          <div className="absolute bottom-3 right-6 h-2.5 w-2.5 rounded-full bg-amber-200 shadow-[0_0_16px_rgba(255,226,144,0.62)]" />
          <div className="absolute left-8 top-[68%] h-2 w-2 rounded-full bg-amber-50 shadow-[0_0_14px_rgba(255,226,144,0.62)]" />
        </div>
        {celebrationBursts.map((burst, index) => (
          <span
            key={`${burst.left}-${burst.top}-${index}`}
            className="pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(255,233,173,0.95)_0%,rgba(255,196,84,0.78)_42%,transparent_72%)]"
            style={{
              left: burst.left,
              top: burst.top,
              width: burst.size,
              height: burst.size,
              animation: `haloVictorySpark 3.8s ease-in-out infinite ${burst.delay}`,
              boxShadow: '0 0 18px rgba(255,210,110,0.34)',
            }}
          />
        ))}
        {celebrationLines.map((line, index) => (
          <span
            key={`${line.left}-${line.top}-${index}`}
            className="pointer-events-none absolute h-[2px] rounded-full bg-gradient-to-r from-transparent via-amber-100/95 to-transparent"
            style={{
              left: line.left,
              top: line.top,
              width: line.width,
              ['--line-rotate' as string]: line.rotate,
              animation: `haloVictoryLine 4.2s ease-in-out infinite ${line.delay}`,
              boxShadow: '0 0 12px rgba(255,220,135,0.35)',
            }}
          />
        ))}
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-6 flex h-[6.4rem] w-[6.4rem] items-center justify-center sm:h-[9.5rem] sm:w-[9.5rem]">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[12rem] w-[12rem] rounded-full bg-[radial-gradient(circle,rgba(255,236,178,0.62)_0%,rgba(255,207,99,0.34)_38%,transparent_72%)] blur-xl sm:h-[18rem] sm:w-[18rem]"
              style={{ animation: 'haloVictoryFlash 2.4s ease-out 1' }}
            />
            <div className="absolute inset-0 rounded-full border border-amber-200/28 bg-[radial-gradient(circle,rgba(255,231,166,0.22)_0%,rgba(245,180,76,0.08)_48%,transparent_72%)] blur-[2px]" />
            <div
              className="absolute inset-[8%] rounded-full border border-amber-200/32"
              style={{ animation: 'haloVictoryPulse 4.5s ease-in-out infinite' }}
            />
            <div
              className="absolute inset-[18%] rounded-full border border-amber-100/36"
              style={{ animation: 'haloVictoryPulse 3.6s ease-in-out infinite 0.4s' }}
            />
            <div
              className="relative flex h-full w-full items-center justify-center rounded-full border border-amber-300/62 bg-[radial-gradient(circle_at_top,rgba(255,238,194,0.34),rgba(245,180,76,0.16)_38%,rgba(26,16,6,0.86)_100%)] shadow-[0_0_86px_rgba(245,180,76,0.52),inset_0_1px_0_rgba(255,249,224,0.26)]"
              style={{ animation: 'haloVictoryIntro 1s cubic-bezier(0.22, 1, 0.36, 1) 1, haloVictoryFloat 4.6s ease-in-out 1s infinite' }}
            >
              <div className="absolute inset-[-14%] rounded-full border border-amber-200/18" />
              <div className="absolute inset-x-[18%] top-[8%] h-[18%] rounded-full bg-white/20 blur-md" />
              <img
                src="/halo-cup.svg"
                alt="Coppa Halo"
                className="relative h-[3.5rem] w-[3.5rem] object-contain drop-shadow-[0_0_42px_rgba(255,221,132,0.72)] sm:h-[5.4rem] sm:w-[5.4rem]"
              />
            </div>
          </div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/45 bg-[linear-gradient(180deg,rgba(255,232,173,0.18)_0%,rgba(245,180,76,0.08)_100%)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-50 shadow-[0_0_22px_rgba(245,180,76,0.18)] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.22em]">
            <Sparkles className="h-4 w-4 text-[#ffd76a]" />
            <span>Campione del torneo</span>
          </div>
          <div className="relative overflow-hidden">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-transparent via-amber-100/28 to-transparent blur-sm"
              style={{ animation: 'haloVictoryShimmer 5.2s ease-in-out 0.9s infinite' }}
            />
            <h1
              className="relative text-[clamp(2.25rem,1.55rem+3.8vw,5.5rem)] font-bold font-heading text-white drop-shadow-[0_0_38px_rgba(245,180,76,0.28)] md:text-8xl"
              style={{ animation: 'haloVictoryNameReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both' }}
            >
              {tournament.winner.name}
            </h1>
          </div>
          <div
            className="relative mt-5 inline-flex flex-col items-center overflow-hidden rounded-[24px] border border-amber-300/52 bg-[linear-gradient(180deg,rgba(255,226,147,0.24)_0%,rgba(245,180,76,0.1)_45%,rgba(255,255,255,0.03)_100%)] px-6 py-4 shadow-[0_0_42px_rgba(245,180,76,0.24),inset_0_1px_0_rgba(255,244,208,0.22)] sm:px-9 sm:py-5"
            style={{ animation: 'haloVictoryPlate 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both' }}
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-[-20%] w-24 bg-gradient-to-r from-transparent via-amber-100/26 to-transparent blur-md"
              style={{ animation: 'haloVictoryShimmer 4.6s ease-in-out 1.2s infinite' }}
            />
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-100/78 sm:text-[11px]">
              Vittoria Assoluta
            </div>
            <div className="mt-1 text-[clamp(1.25rem,1rem+1.2vw,2.2rem)] font-bold text-white">
              {winnerStats.seriesWins} match vinti
              <span className="mx-2 text-amber-200/42">|</span>
              {winnerStats.gameWins} game vinti
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-amber-100/60">
              Halo Infinite Tournament Champion
            </div>
          </div>
          <div className="relative mt-5 h-10 w-full max-w-xl">
            <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-200/42 to-transparent" />
            <div
              className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/36 bg-[radial-gradient(circle,rgba(255,232,174,0.3),rgba(245,180,76,0.08)_68%,transparent_76%)]"
              style={{ animation: 'haloVictoryStageGlow 3.8s ease-in-out infinite' }}
            />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-white/80 sm:mt-7 sm:gap-3">
            <HeroChip icon={<Trophy className="h-4 w-4 text-amber-200" />} text={`${winnerStats.seriesWins} match vinti`} />
            <HeroChip icon={<Swords className="h-4 w-4 text-amber-200" />} text={`${winnerStats.gameWins} game vinti`} />
            <HeroChip icon={<Crown className="h-4 w-4 text-amber-200" />} text={getMatchDurationDisplay(tournament.config.matchDuration)} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <Card className="p-4 sm:p-6 md:p-8">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/68 sm:mb-5 sm:text-sm sm:tracking-[0.18em]">
            <Trophy className="h-4 w-4 text-primary" />
            <span>Statistiche finali</span>
          </div>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <StatTile label="Kill totali" value={String(winnerStats.totalKills)} highlight />
            <StatTile label="Match vinti" value={String(winnerStats.seriesWins)} />
            <StatTile label="Game vinti" value={String(winnerStats.gameWins)} />
            <StatTile label="Giocatori" value={String(tournament.winner.players.length)} />
          </div>

          <div className="mt-5 rounded-[22px] border border-amber-300/55 bg-[radial-gradient(circle_at_right,rgba(255,214,102,0.24),transparent_30%),radial-gradient(circle_at_left_top,rgba(255,244,200,0.14),transparent_26%),linear-gradient(180deg,rgba(255,205,96,0.28)_0%,rgba(245,180,76,0.16)_42%,rgba(245,180,76,0.07)_100%)] p-4 shadow-[0_0_50px_rgba(245,180,76,0.24),inset_0_1px_0_rgba(255,245,214,0.2)] sm:mt-6 sm:rounded-[30px] sm:p-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-50 sm:mb-4 sm:text-sm sm:tracking-[0.18em]">
              <Medal className="h-5 w-5 text-[#ffd76a] drop-shadow-[0_0_10px_rgba(255,215,106,0.5)] motion-safe:animate-pulse" />
              <span>MVP</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/60 bg-[radial-gradient(circle_at_top,rgba(255,224,138,0.34),rgba(36,18,0,0.3)_72%)] shadow-[0_0_30px_rgba(245,180,76,0.3),inset_0_1px_0_rgba(255,245,214,0.2)] sm:h-16 sm:w-16">
                <RankIcon rank={winnerStats.mvp.player.rank} className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xl font-bold text-white drop-shadow-[0_0_14px_rgba(255,218,125,0.16)] sm:text-3xl">{winnerStats.mvp.player.name}</div>
                <div className="mt-1 text-xs text-amber-50/82 sm:text-sm">
                  {winnerStats.mvp.kills} kill • {winnerStats.mvp.gameWins} game vinti
                </div>
              </div>
              <div className="ml-auto rounded-full border border-amber-300/72 bg-[linear-gradient(180deg,rgba(255,225,132,0.34)_0%,rgba(245,180,76,0.2)_100%)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#fff3c7] shadow-[0_0_24px_rgba(245,180,76,0.34),inset_0_1px_0_rgba(255,245,214,0.24)] sm:px-4 sm:py-1.5 sm:text-sm sm:tracking-[0.18em]">
                MVP
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 md:p-8">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/68 sm:mb-5 sm:text-sm sm:tracking-[0.18em]">
            <Crown className="h-4 w-4 text-primary" />
            <span>Roster campione</span>
          </div>
          <div className="space-y-3">
            {winnerStats.playerSummaries.map((summary) => (
              <div
                key={summary.player.id}
                className={`rounded-[18px] border px-3 py-3.5 sm:rounded-[22px] sm:px-4 sm:py-4 ${
                  summary.player.id === winnerStats.mvp.player.id
                    ? 'border-amber-300/40 bg-amber-300/10 shadow-[0_0_22px_rgba(245,180,76,0.12)]'
                    : 'border-white/10 bg-black/10'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <RankIcon rank={summary.player.rank} className="h-5 w-5 sm:h-6 sm:w-6" />
                      <div className="truncate text-base font-semibold text-white sm:text-lg">{summary.player.name}</div>
                    </div>
                    <div className="mt-2 text-xs text-white/70 sm:text-sm">
                      {summary.kills} kill • {summary.gameWins} game vinti • {summary.appearances} presenze
                    </div>
                  </div>
                  {summary.player.id === winnerStats.mvp.player.id && (
                    <div className="rounded-full border border-amber-300/40 bg-amber-300/16 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100 shadow-[0_0_16px_rgba(245,180,76,0.18)] sm:px-3 sm:text-xs sm:tracking-[0.16em]">
                      MVP
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className="p-4 sm:p-6 md:p-8">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/68 sm:mb-5 sm:text-sm sm:tracking-[0.18em]">
          <Swords className="h-4 w-4 text-primary" />
          <span>Percorso torneo</span>
        </div>
        <div className="grid gap-4 sm:gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] sm:[grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          {tournament.rounds.map((round) => (
            <div
              key={round.index}
              className={`rounded-[20px] border p-3.5 sm:rounded-[24px] sm:p-4 ${
                round.index === tournament.rounds.length - 1
                  ? 'border-amber-300/28 bg-[linear-gradient(180deg,rgba(245,180,76,0.1)_0%,rgba(10,20,45,0.74)_100%)] shadow-[0_0_24px_rgba(245,180,76,0.12)]'
                  : 'border-white/10 bg-black/10'
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white sm:text-base">{round.name}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50 sm:text-xs sm:tracking-[0.16em]">
                    {round.mode ? getGameModeDisplay(round.mode) : 'Round'} {round.map ? `• ${round.map}` : ''}
                  </div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] text-white/72 sm:px-3 sm:text-xs">
                  {round.matches.length} match
                </div>
              </div>
              <div className="space-y-3">
                {round.matches.map((match) => (
                  <MiniMatchCard key={match.id} match={match} championId={tournament.winner?.id} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Button onClick={onBack} variant="ghost" size="lg" className="w-full text-white/60 hover:text-white sm:w-auto">
          <ArrowLeft className="h-4 w-4" />
          Indietro
        </Button>
        <Button onClick={onReplay} variant="outline" size="lg" className="w-full border-white/18 text-white/74 sm:w-auto">
          <RefreshCcw className="h-4 w-4" />
          Rigioca stesso torneo
        </Button>
        <Button onClick={onReset} size="lg" className="w-full shadow-[0_0_34px_rgba(245,180,76,0.28)] hover:shadow-[0_0_44px_rgba(245,180,76,0.38)] sm:min-w-44 sm:w-auto">
          <RefreshCcw className="h-4 w-4" />
          Nuovo torneo
        </Button>
      </div>

      <div className="text-center text-[11px] text-white/55 sm:text-xs">
        Questo progetto e un fan project non ufficiale. Halo e un marchio registrato di Microsoft.
      </div>
      <div className="text-center text-xs font-semibold tracking-[0.08em] text-amber-100/80 sm:text-sm sm:tracking-[0.1em]">
        Made by MrMarozzo
      </div>
    </div>
  );
}

function getWinnerStats(winner: Team, matches: Match[]): WinnerStats {
  const playerStats = new Map<string, PlayerSummary>();
  winner.players.forEach((player) => {
    playerStats.set(player.id, {
      player,
      kills: 0,
      gameWins: 0,
      appearances: 0,
    });
  });

  let seriesWins = 0;
  let gameWins = 0;
  let totalKills = 0;
  let objectivePoints = 0;

  matches.forEach((match) => {
    const winnerWasTeam1 = match.winner?.id === winner.id && match.team1?.id === winner.id;
    const winnerWasTeam2 = match.winner?.id === winner.id && match.team2?.id === winner.id;
    if (!winnerWasTeam1 && !winnerWasTeam2) return;

    seriesWins += 1;

    match.games?.forEach((game) => {
      if (game.winner === (winnerWasTeam1 ? 1 : 2)) {
        gameWins += 1;
      }

      const summary = winnerWasTeam1 ? readTeamOneGameStats(game) : readTeamTwoGameStats(game);

      totalKills += summary.kills;
      objectivePoints += summary.points;

      Object.entries(summary.playerKills).forEach(([playerId, kills]) => {
        const current = playerStats.get(playerId);
        if (!current) return;
        current.kills += kills;
        current.appearances += 1;
        if (game.winner === (winnerWasTeam1 ? 1 : 2)) {
          current.gameWins += 1;
        }
      });
    });
  });

  const playerSummaries = Array.from(playerStats.values()).sort((a, b) => {
    if (b.kills !== a.kills) return b.kills - a.kills;
    if (b.gameWins !== a.gameWins) return b.gameWins - a.gameWins;
    return b.appearances - a.appearances;
  });

  return {
    seriesWins,
    gameWins,
    totalKills,
    objectivePoints,
    mvp: playerSummaries[0],
    playerSummaries,
  };
}

function readTeamOneGameStats(game: Game) {
  if (!game.score) return { kills: 0, points: 0, playerKills: {} as Record<string, number> };

  if ('team1PlayerKills' in game.score) {
    return {
      kills: game.score.team1TotalKills,
      points: 0,
      playerKills: game.score.team1PlayerKills,
    };
  }

  if ('team1Rounds' in game.score) {
    return {
      kills: 0,
      points: game.score.team1Rounds,
      playerKills: {},
    };
  }

  if ('team1Score' in game.score) {
    return {
      kills: 0,
      points: game.score.team1Score,
      playerKills: {},
    };
  }

  return { kills: 0, points: 0, playerKills: {} as Record<string, number> };
}

function readTeamTwoGameStats(game: Game) {
  if (!game.score) return { kills: 0, points: 0, playerKills: {} as Record<string, number> };

  if ('team2PlayerKills' in game.score) {
    return {
      kills: game.score.team2TotalKills,
      points: 0,
      playerKills: game.score.team2PlayerKills,
    };
  }

  if ('team2Rounds' in game.score) {
    return {
      kills: 0,
      points: game.score.team2Rounds,
      playerKills: {},
    };
  }

  if ('team2Score' in game.score) {
    return {
      kills: 0,
      points: game.score.team2Score,
      playerKills: {},
    };
  }

  return { kills: 0, points: 0, playerKills: {} as Record<string, number> };
}

function HeroChip({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function StatTile({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border p-3 sm:rounded-[22px] sm:p-4 ${
        highlight
          ? 'border-amber-300/30 bg-amber-300/10 shadow-[0_0_20px_rgba(245,180,76,0.12)]'
          : 'border-white/10 bg-black/10'
      }`}
    >
      <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.16em] ${highlight ? 'text-amber-100/85' : 'text-white/50'}`}>
        {label}
      </div>
      <div className={`mt-2 font-bold ${highlight ? 'text-3xl text-white sm:text-4xl' : 'text-2xl text-white sm:text-3xl'}`}>
        {value}
      </div>
    </div>
  );
}

function MiniMatchCard({ match, championId }: { match: Match; championId?: string }) {
  const team1Score = match.seriesScore?.team1 ?? 0;
  const team2Score = match.seriesScore?.team2 ?? 0;
  const hasGames = Boolean(match.games && match.games.length > 0);
  const winnerTeam = match.winner;
  const loserTeam =
    winnerTeam?.id === match.team1?.id
      ? match.team2
      : winnerTeam?.id === match.team2?.id
        ? match.team1
        : undefined;
  const winnerIsChampion = winnerTeam?.id === championId;

  return (
    <div
      className={`rounded-[16px] border p-3.5 sm:rounded-[18px] sm:p-4 ${
        match.roundIndex === 0
          ? 'border-white/10 bg-slate-950/28'
          : 'border-amber-300/18 bg-[linear-gradient(180deg,rgba(245,180,76,0.08)_0%,rgba(2,6,23,0.34)_100%)] shadow-[0_0_22px_rgba(245,180,76,0.1)]'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">
          Match {match.matchIndex + 1}
        </div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/36">
          {hasGames ? `${match.games?.length ?? 0} game` : winnerTeam ? 'Serie completata' : 'In attesa'}
        </div>
      </div>

      <div className="flex flex-wrap items-stretch gap-3">
        <div
          className={`min-w-0 flex-[1_1_220px] rounded-[16px] border px-4 py-3 ${
            winnerIsChampion
              ? 'border-amber-300/30 bg-amber-300/12 shadow-[0_0_20px_rgba(245,180,76,0.14)]'
              : 'border-white/10 bg-white/[0.05]'
          }`}
        >
          <div className="text-[11px] uppercase tracking-[0.16em] text-amber-100/70">Vincitore</div>
          <div className="mt-1 text-lg font-bold text-white sm:text-xl">
            {winnerTeam?.name ?? match.team1?.name ?? match.team2?.name ?? 'TBD'}
          </div>
          {winnerTeam && (
            <div className="mt-1 text-xs text-white/70 sm:text-sm">
              {winnerTeam.players.map((player) => player.name).join(', ')}
            </div>
          )}
        </div>

        <div className="w-full rounded-[16px] border border-white/10 bg-black/16 px-4 py-3 text-center sm:w-auto sm:min-w-[190px] sm:shrink-0 sm:px-5 sm:py-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Risultato finale</div>
          <div className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            {team1Score} <span className="mx-2 text-white/35">-</span> {team2Score}
          </div>
          <div className="mt-1 text-xs text-white/55">
            {(match.team1?.name ?? 'Team 1')} vs {(match.team2?.name ?? 'Team 2')}
          </div>
        </div>

        <div className="min-w-0 flex-[1_1_220px] rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">Avversario</div>
          <div className="mt-1 text-base font-semibold text-white/86 sm:text-lg">
            {loserTeam?.name ?? (winnerTeam ? 'Bye' : match.team2?.name ?? match.team1?.name ?? 'TBD')}
          </div>
          {loserTeam && (
            <div className="mt-1 text-xs text-white/58 sm:text-sm">
              {loserTeam.players.map((player) => player.name).join(', ')}
            </div>
          )}
        </div>
      </div>

      {hasGames && (
        <div className="mt-4 rounded-[16px] border border-white/8 bg-black/12 p-4">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/48">
            Dettaglio game
          </div>
          <div className="space-y-2">
            {match.games?.map((game) => {
              const modeLabel = getGameModeDisplay(game.mode);
              const mapLabel = game.map?.trim() ? game.map : null;
              const scoreLabel = formatGameScore(game);

              return (
                <div
                  key={game.gameNumber}
                  className="grid gap-2 rounded-[14px] border border-white/8 bg-white/[0.03] px-3 py-3 text-sm md:grid-cols-[auto_1fr_auto]"
                >
                  <div className="font-semibold text-white/90">Game {game.gameNumber}</div>
                  <div className="min-w-0 text-white/68">
                    <span>{modeLabel}</span>
                    {mapLabel && <span className="mx-2 text-white/28">•</span>}
                    {mapLabel && <span>{mapLabel}</span>}
                  </div>
                  <div className="font-semibold text-amber-100">{scoreLabel}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function formatGameScore(game: Game): string {
  if (!game.score) return '-';

  if ('team1PlayerKills' in game.score) {
    return `${game.score.team1TotalKills}-${game.score.team2TotalKills}`;
  }

  if ('team1Rounds' in game.score) {
    return `${game.score.team1Rounds}-${game.score.team2Rounds}`;
  }

  if ('team1Score' in game.score) {
    return `${game.score.team1Score}-${game.score.team2Score}`;
  }

  return '-';
}

import {
  ArrowLeft,
  LayoutPanelTop,
  ListChecks,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react';

const highlights = [
  {
    icon: Swords,
    value: 'Team creation',
    label: 'Balanced or manual setups for custom lobbies.',
  },
  {
    icon: Trophy,
    value: 'Bracket flow',
    label: 'A cleaner path from teams to final winner.',
  },
  {
    icon: ListChecks,
    value: 'Match tracking',
    label: 'Results stay readable and easy to update.',
  },
];

export default function AboutPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[880px] items-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="glass-card w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <section className="animate-in fade-in duration-300">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            About
          </div>
          <h1 className="mt-4 max-w-[720px] text-[clamp(2.4rem,1.8rem+3.2vw,4.5rem)] font-bold leading-[0.95] text-white">
            About the Tournament Generator
          </h1>
          <p className="mt-5 max-w-[640px] text-[clamp(0.98rem,0.92rem+0.25vw,1.1rem)] leading-8 text-white/74">
            This app was created to help Halo Infinite players organize custom tournaments quickly and clearly. It simplifies team creation, match tracking, and bracket management.
          </p>
          <a
            href="/"
            className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/62 transition hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Generator
          </a>
          </section>

          <section className="animate-in fade-in mt-14 grid gap-10 border-t border-white/8 pt-10 duration-300 md:grid-cols-[1.15fr_0.85fr] md:gap-14">
            <div>
              <div className="inline-flex items-center gap-3 text-white">
                <LayoutPanelTop className="h-4.5 w-4.5 text-primary" />
                <span className="text-[0.96rem] font-semibold">Purpose</span>
              </div>
              <p className="mt-5 text-[clamp(0.98rem,0.92rem+0.25vw,1.06rem)] leading-8 text-white/74">
                Managing custom games manually can be confusing and time-consuming. This tool was designed to make the process faster, cleaner, and more intuitive.
              </p>
            </div>

            <div className="space-y-5">
              {highlights.map((item) => (
                <div key={item.value} className="border-b border-white/8 pb-5 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3 text-white">
                    <item.icon className="h-4.5 w-4.5 text-primary" />
                    <div className="text-[1rem] font-semibold">{item.value}</div>
                  </div>
                  <p className="mt-2 pl-7 text-[0.92rem] leading-7 text-white/60">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="animate-in fade-in mt-14 border-t border-white/8 pt-10 duration-300">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-22 w-22 items-center justify-center overflow-hidden rounded-full border border-white/14 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),rgba(255,255,255,0.04)_62%,transparent_100%)] p-1.5 backdrop-blur-sm">
                  <img
                    src="/Marozzo logo.png"
                    alt="Marozzo avatar"
                    className="h-full w-full rounded-full object-cover brightness-[1.15] contrast-[1.12] saturate-[1.06]"
                  />
                </div>
                <div className="flex h-16 min-w-[120px] items-center justify-center rounded-full border border-white/10 bg-white/6 px-4 backdrop-blur-sm">
                  <img
                    src="/MrMarozzologo.png"
                    alt="MrMarozzo logo"
                    className="max-h-9 w-auto brightness-[1.16] contrast-[1.08]"
                  />
                </div>
              </div>

              <div className="max-w-[460px]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">
                  Created by
                </div>
                <h2 className="mt-2 text-[clamp(1.15rem,1.05rem+0.45vw,1.5rem)] font-semibold text-white">
                  Marozzo
                </h2>
                <p className="mt-3 text-[clamp(0.94rem,0.9rem+0.2vw,1rem)] leading-8 text-white/70">
                  Built by a Halo fan for the competitive community.
                </p>
                <p className="mt-2 text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-primary/88">
                  Fan-made Halo tournament utility
                </p>
              </div>
            </div>
          </section>

          <footer className="mt-auto animate-in fade-in border-t border-white/8 pt-8 duration-300">
            <div className="text-[0.82rem] leading-7 text-white/48">
              Halo Infinite and all related assets are property of their respective owners. This is an unofficial fan-made project.
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}

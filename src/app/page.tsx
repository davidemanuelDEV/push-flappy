import type { ReactNode } from "react";
import Link from "next/link";
import IosInstallTip from "@/components/IosInstallTip";
import ReminderCapture from "@/components/ReminderCapture";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {/* Ambient copper glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-700/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-24 right-0 h-56 w-56 rounded-full bg-amber-900/15 blur-3xl"
      />

      <div className="relative flex flex-1 flex-col gap-8 sm:gap-10">
        {/* Hero */}
        <header className="space-y-4 pt-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-500/90">
            Push day · Camera game
          </p>
          <h1 className="text-[2.75rem] font-black leading-[1.05] tracking-tight text-zinc-50 sm:text-5xl">
            Push Flappy
          </h1>
          <p className="mx-auto max-w-sm text-lg font-medium leading-snug text-zinc-200 sm:text-xl">
            Flappy Bird you play with push-ups.
          </p>
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-zinc-400">
            Your torso height is the bird. Drop to dive through copper pipes —
            press up to rise. On-device pose. No accounts.
          </p>
        </header>

        {/* Visual */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-800/30 bg-gradient-to-b from-sky-950/50 via-zinc-950 to-emerald-950/40 px-5 py-8 shadow-[0_0_0_1px_rgba(184,115,51,0.12)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
          />
          <div className="flex items-center justify-center gap-8 sm:gap-10">
            <div className="pf-float">
              <GeometricBird />
            </div>
            <div className="pf-pipes relative flex flex-col gap-3 opacity-95">
              <CopperBar h={52} />
              <div className="h-11" />
              <CopperBar h={64} />
            </div>
          </div>
          <p className="mt-5 text-center text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Continuous body-Y · MediaPipe Pose · local high score
          </p>
        </div>

        {/* Primary CTA cluster — high on mobile */}
        <div className="space-y-3">
          <Link
            href="/play"
            className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-bold text-zinc-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 active:scale-[0.98]"
          >
            Start playing
          </Link>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/board"
              className="flex min-h-12 items-center justify-center rounded-2xl border border-zinc-700/80 bg-zinc-900/60 px-3 py-3 text-sm font-semibold text-zinc-100 transition hover:border-amber-700/50 hover:bg-zinc-900"
            >
              Daily board
            </Link>
            <a
              href="#challenge"
              className="flex min-h-12 items-center justify-center rounded-2xl border border-zinc-700/80 bg-zinc-900/60 px-3 py-3 text-sm font-semibold text-zinc-100 transition hover:border-amber-700/50 hover:bg-zinc-900"
            >
              Challenge a friend
            </a>
          </div>
          <p className="text-center text-xs text-zinc-500">
            Camera required · best on phone over HTTPS
          </p>
        </div>

        {/* How it works — 3 steps */}
        <section className="space-y-4" aria-labelledby="how-heading">
          <h2
            id="how-heading"
            className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400"
          >
            How it works
          </h2>
          <ol className="grid gap-3">
            <Step n={1} title="Phone on the floor">
              Place it face-up under you (or use a laptop webcam). Allow the
              camera — portrait is fine.
            </Step>
            <Step n={2} title="Hold the top of a push-up">
              Plank for about a second to lock bird “up” near the top, then tap
              Start.
            </Step>
            <Step n={3} title="Clear the copper pipes">
              Drop to dive, press up to rise. Gaps scroll past — clear them to
              score.
            </Step>
          </ol>
        </section>

        {/* Social proof hooks */}
        <section className="grid gap-3" aria-labelledby="social-heading">
          <h2 id="social-heading" className="sr-only">
            Challenges and daily board
          </h2>
          <div className="rounded-2xl border border-amber-800/35 bg-amber-950/25 px-4 py-4">
            <p className="text-sm font-bold text-amber-300">Daily board</p>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-100/70">
              Everyone gets the{" "}
              <strong className="font-semibold text-amber-100">
                same pipe seed each day
              </strong>{" "}
              (Pacific time). Post an anonymous nick + emoji and climb today’s
              board.
            </p>
          </div>
          <div
            id="challenge"
            className="scroll-mt-24 rounded-2xl border border-zinc-700/80 bg-zinc-900/55 px-4 py-4"
          >
            <p className="text-sm font-bold text-zinc-100">Beat-me challenges</p>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
              Wipe out, then share a{" "}
              <strong className="font-semibold text-zinc-200">
                beat-me link
              </strong>
              . Friends open the same score to beat — bar-to-beat in the HUD,
              victory share when they clear it.
            </p>
          </div>
        </section>

        <section className="space-y-2" aria-label="Challenge reminders">
          <ReminderCapture source="landing" />
        </section>

        <IosInstallTip />

        <footer className="mt-auto space-y-3 pb-2 pt-4 text-center">
          <Link
            href="/play"
            className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-base font-bold text-emerald-300 transition hover:bg-emerald-500/20 active:scale-[0.98]"
          >
            Start
          </Link>
          <p className="text-[11px] text-zinc-600">
            Push Flappy · no accounts · pose stays on your device
          </p>
        </footer>
      </div>
    </main>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-3.5 rounded-2xl border border-zinc-800/90 bg-zinc-900/50 px-4 py-3.5">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-sm font-bold text-amber-400"
      >
        {n}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[15px] font-semibold text-zinc-100">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">{children}</p>
      </div>
    </li>
  );
}

function GeometricBird() {
  return (
    <svg width="88" height="68" viewBox="0 0 72 56" aria-hidden>
      <ellipse
        cx="32"
        cy="30"
        rx="22"
        ry="18"
        fill="#e8453c"
        stroke="#8b1a14"
        strokeWidth="2"
      />
      <ellipse cx="36" cy="36" rx="10" ry="8" fill="#f5d0a9" />
      <ellipse
        cx="26"
        cy="28"
        rx="9"
        ry="7"
        fill="#fff8e7"
        stroke="#c9a06a"
        strokeWidth="1.5"
        transform="rotate(-20 26 28)"
      />
      <circle cx="44" cy="22" r="7" fill="#fff" />
      <circle cx="46" cy="22" r="3" fill="#1a1a1a" />
      <path
        d="M48 28 L68 32 L48 38 Z"
        fill="#f5c542"
        stroke="#c49020"
        strokeWidth="1"
      />
    </svg>
  );
}

function CopperBar({ h }: { h: number }) {
  return (
    <div
      className="w-11 rounded-sm shadow-inner ring-1 ring-amber-900/40"
      style={{
        height: h,
        background:
          "linear-gradient(90deg,#5c3310 0%,#b87333 20%,#e8a857 40%,#f0c078 50%,#c47a3a 70%,#8b4513 100%)",
      }}
    />
  );
}

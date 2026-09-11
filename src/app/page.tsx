import type { ReactNode } from "react";
import Link from "next/link";
import IosInstallTip from "@/components/IosInstallTip";
import ReminderCapture from "@/components/ReminderCapture";
import { SQUAT_FLAPPY_ORIGIN } from "@/lib/sibling";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Push Flappy",
              url: "https://pushflappy.com",
              applicationCategory: "GameApplication",
              operatingSystem: "Web",
              description:
                "Push-up camera game — control a bird with your body using on-device pose tracking. No downloads, no accounts.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
            {
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: "How to play Push Flappy",
              description:
                "Play a flappy-style game controlled by push-ups using your phone or webcam camera.",
              step: [
                {
                  "@type": "HowToStep",
                  name: "Phone on the floor",
                  text: "Place your phone face-up under you (or use a laptop webcam). Allow the camera — portrait is fine.",
                },
                {
                  "@type": "HowToStep",
                  name: "Hold the top of a push-up",
                  text: "Plank for about a second to lock bird up near the top, then tap Start.",
                },
                {
                  "@type": "HowToStep",
                  name: "Clear the copper pipes",
                  text: "Drop to dive, press up to rise. Gaps scroll past — clear them to score.",
                },
              ],
            },
          ]),
        }}
      />
      {/* Ambient copper / amber glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-600/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-24 right-0 h-56 w-56 rounded-full bg-orange-900/25 blur-3xl"
      />

      <div className="relative flex flex-1 flex-col gap-8 sm:gap-10">
        {/* Hero — game pitch, not SaaS */}
        <header className="space-y-4 pt-2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400/95">
            Push day · Camera game
          </p>
          <h1 className="font-display text-[3.15rem] font-bold leading-[0.95] tracking-tight text-amber-50 sm:text-6xl">
            Push Flappy
          </h1>
          <p className="mx-auto max-w-sm text-lg font-semibold leading-snug text-amber-100/90 sm:text-xl">
            Flappy Bird you play with push-ups.
          </p>
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-stone-400">
            Your torso height is the bird. Drop to dive through copper pipes —
            press up to rise. On-device pose. No accounts.
          </p>
        </header>

        {/* Visual — dusk gym playfield vibe */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-800/40 bg-gradient-to-b from-[#0c122a]/90 via-[#2a1810]/85 to-[#1a1008] px-5 py-8 shadow-[0_0_0_1px_rgba(184,115,51,0.18),0_20px_50px_-20px_rgba(0,0,0,0.6)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-amber-950/70 to-transparent"
          />
          <div className="relative flex items-center justify-center gap-8 sm:gap-10">
            <div className="pf-float">
              <GeometricBird />
            </div>
            <div className="pf-pipes relative flex flex-col gap-3 opacity-95">
              <CopperBar h={52} />
              <div className="h-11" />
              <CopperBar h={64} />
            </div>
          </div>
          <p className="relative mt-5 text-center text-[11px] font-semibold uppercase tracking-wider text-amber-200/50">
            Continuous body-Y · MediaPipe Pose · local high score
          </p>
        </div>

        {/* Primary CTA cluster */}
        <div className="space-y-3">
          <Link
            href="/play"
            className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-bold text-stone-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 active:scale-[0.98]"
          >
            Start playing
          </Link>
          <div className="grid grid-cols-3 gap-2.5">
            <Link
              href="/board"
              className="flex min-h-12 items-center justify-center rounded-2xl border border-amber-900/50 bg-stone-900/70 px-2 py-3 text-sm font-semibold text-amber-50 transition hover:border-amber-600/50 hover:bg-stone-900"
            >
              Daily board
            </Link>
            <Link
              href="/faq"
              className="flex min-h-12 items-center justify-center rounded-2xl border border-amber-900/50 bg-stone-900/70 px-2 py-3 text-sm font-semibold text-amber-50 transition hover:border-amber-600/50 hover:bg-stone-900"
            >
              FAQ
            </Link>
            <a
              href="#challenge"
              className="flex min-h-12 items-center justify-center rounded-2xl border border-amber-900/50 bg-stone-900/70 px-2 py-3 text-sm font-semibold text-amber-50 transition hover:border-amber-600/50 hover:bg-stone-900"
            >
              Challenge
            </a>
          </div>
          <p className="text-center text-xs text-stone-500">
            Camera required · best on phone over HTTPS
          </p>
        </div>

        {/* How it works */}
        <section className="space-y-4" aria-labelledby="how-heading">
          <h2
            id="how-heading"
            className="text-center text-xs font-bold uppercase tracking-[0.2em] text-amber-500/80"
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
          <div className="rounded-2xl border border-amber-800/40 bg-amber-950/35 px-4 py-4">
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
            className="scroll-mt-24 rounded-2xl border border-amber-900/45 bg-stone-900/65 px-4 py-4"
          >
            <p className="text-sm font-bold text-amber-50">Beat-me challenges</p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-400">
              Wipe out, then share via{" "}
              <strong className="font-semibold text-stone-200">
                WhatsApp, X, copy, or a share card
              </strong>
              . Friends open the same score to beat — bar-to-beat in the HUD,
              victory flex when they clear it.
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
          <p className="text-[11px] text-stone-500">
            <Link href="/faq" className="underline-offset-2 hover:underline">
              FAQ
            </Link>
            {" · "}
            <Link href="/board" className="underline-offset-2 hover:underline">
              Daily board
            </Link>
            {" · "}
            <Link href="/play" className="underline-offset-2 hover:underline">
              Play
            </Link>
          </p>
          <p className="text-[13px] text-stone-400">
            <a
              href={SQUAT_FLAPPY_ORIGIN}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:text-amber-200/85 hover:underline"
            >
              Also play Squat Flappy
            </a>
          </p>
          <p className="text-[11px] text-stone-600">
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
    <li className="flex gap-3.5 rounded-2xl border border-amber-950/60 bg-stone-900/55 px-4 py-3.5">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-sm font-bold text-amber-400"
      >
        {n}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[15px] font-semibold text-amber-50">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-stone-400">{children}</p>
      </div>
    </li>
  );
}

/** Cocky push-day bird matching in-game drawBirdAt look. */
function GeometricBird() {
  return (
    <svg width="96" height="78" viewBox="0 0 80 64" aria-hidden>
      <defs>
        <radialGradient id="pf-body" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff6b5a" />
          <stop offset="40%" stopColor="#e8453c" />
          <stop offset="100%" stopColor="#8b1a14" />
        </radialGradient>
        <radialGradient id="pf-belly" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffe2c4" />
          <stop offset="100%" stopColor="#e8b48a" />
        </radialGradient>
        <radialGradient id="pf-wing" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#fff6e8" />
          <stop offset="55%" stopColor="#f0d4a8" />
          <stop offset="100%" stopColor="#c9925a" />
        </radialGradient>
        <linearGradient id="pf-beak" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="100%" stopColor="#c49020" />
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="38" cy="52" rx="22" ry="6" fill="rgba(0,0,0,0.28)" />
      {/* body */}
      <ellipse
        cx="34"
        cy="32"
        rx="24"
        ry="20"
        fill="url(#pf-body)"
        stroke="#3b0a08"
        strokeWidth="2.5"
      />
      {/* belly */}
      <ellipse cx="38" cy="40" rx="11" ry="9" fill="url(#pf-belly)" />
      {/* wing */}
      <ellipse
        cx="26"
        cy="30"
        rx="11"
        ry="8"
        fill="url(#pf-wing)"
        stroke="#5c3310"
        strokeWidth="1.8"
        transform="rotate(-22 26 30)"
      />
      {/* cheek */}
      <ellipse cx="42" cy="36" rx="5" ry="3.5" fill="rgba(255,120,100,0.45)" />
      {/* eye */}
      <circle cx="48" cy="24" r="9" fill="#fff" stroke="#1a0a08" strokeWidth="1.8" />
      <circle cx="51" cy="25" r="4" fill="#1a1a1a" />
      <circle cx="46" cy="21" r="2.2" fill="#fff" />
      {/* heavy eyebrow */}
      <path
        d="M38 14 Q48 6 58 16 Q50 12 39 16 Z"
        fill="#1a0a08"
      />
      {/* beak */}
      <path
        d="M54 30 L74 34 L54 42 Z"
        fill="url(#pf-beak)"
        stroke="#7a4e0a"
        strokeWidth="1.4"
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

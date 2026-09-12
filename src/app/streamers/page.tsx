import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Streamers / OBS — Push Flappy",
  description:
    "Put Push Flappy in OBS. Browser Source https://pushflappy.com/stream at 1920×1080. Camera, plank, beat-me links, optional board and race overlays.",
  path: "/streamers",
  imageAlt: "Push Flappy for streamers",
});

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Put Push Flappy in OBS",
  description:
    "Add the chrome-free play view as a Browser Source, allow the camera, hold a plank, and let viewers send beat-me links.",
  step: [
    {
      "@type": "HowToStep",
      name: "Browser Source",
      text: "Add https://pushflappy.com/stream as a Browser Source at 1920×1080.",
    },
    {
      "@type": "HowToStep",
      name: "Camera",
      text: "Allow the camera. Phone face-up on the floor, or a webcam aimed at a push-up plank.",
    },
    {
      "@type": "HowToStep",
      name: "Plank",
      text: "Hold a plank until Start position set — the usual 3-2-1 countdown starts on its own.",
    },
    {
      "@type": "HowToStep",
      name: "Beat-me",
      text: "Viewers dare you by opening the beat-me link on their phone.",
    },
  ],
};

export default function StreamersPage() {
  return (
    <main className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-600/20 blur-3xl"
      />

      <div className="relative flex flex-1 flex-col gap-8">
        <header className="space-y-3 pt-2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400/95">
            OBS · Browser Source
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-amber-50 sm:text-5xl">
            Streamers
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-stone-400">
            Chrome-free play view for OBS. Camera on device. Viewers beat you
            from their phone — no Twitch Extension, no chat bot.
          </p>
          <div className="flex justify-center pt-1">
            <GeometricBirdMini />
          </div>
        </header>

        <nav
          aria-label="Site"
          className="flex flex-wrap items-center justify-center gap-2 text-sm"
        >
          <NavChip href="/">Home</NavChip>
          <NavChip href="/play">Play</NavChip>
          <NavChip href="/race">Race</NavChip>
          <NavChip href="/faq">FAQ</NavChip>
        </nav>

        <section className="space-y-3" aria-labelledby="play-source">
          <h2
            id="play-source"
            className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500/80"
          >
            Browser Source (play)
          </h2>
          <article className="rounded-2xl border border-amber-950/60 bg-stone-900/55 px-4 py-4">
            <p className="text-[15px] font-semibold text-amber-50">
              https://pushflappy.com/stream
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-400">
              Size: <strong className="font-semibold text-stone-200">1920×1080</strong>.
              Same crop as{" "}
              <code className="text-amber-100/80">/play?obs=1</code>. Dark
              margins sit outside the playfield so a scene crop stays clean.
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-stone-400">
              <li>
                OBS → Sources → Browser → URL above, width 1920, height 1080.
              </li>
              <li>Allow the camera when Chromium prompts (OBS is its own browser).</li>
              <li>
                Hold a plank until Start position set — the existing 3-2-1
                countdown starts on its own.
              </li>
            </ol>
            <p className="mt-3 text-sm leading-relaxed text-stone-400">
              <code className="text-amber-100/80">/stream</code> hides Home /
              Board / Squat promo / FAQ chrome. Score and beat-me HUD render
              larger for capture.
            </p>
          </article>
        </section>

        <section className="space-y-3" aria-labelledby="cam-heading">
          <h2
            id="cam-heading"
            className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500/80"
          >
            Camera
          </h2>
          <article className="rounded-2xl border border-amber-950/60 bg-stone-900/55 px-4 py-4">
            <p className="text-sm leading-relaxed text-stone-400">
              Phone face-up on the floor under you, or a webcam aimed at a
              push-up plank (shoulders visible). Same setup as{" "}
              <Link
                href="/play"
                className="font-semibold text-amber-200/90 underline-offset-2 hover:underline"
              >
                /play
              </Link>
              .
            </p>
          </article>
        </section>

        <section className="space-y-3" aria-labelledby="beat-heading">
          <h2
            id="beat-heading"
            className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500/80"
          >
            Viewers beat you
          </h2>
          <article className="rounded-2xl border border-amber-950/60 bg-stone-900/55 px-4 py-4">
            <p className="text-sm leading-relaxed text-stone-400">
              Viewers open the beat-me link on their phone:{" "}
              <code className="text-amber-100/80">
                https://pushflappy.com/play?beat={"{score}"}
              </code>{" "}
              (optional <code className="text-amber-100/80">&reps=</code>).
              Wipeout still leads with Challenge a friend.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-400">
              Streamer can also load a target on the capture:{" "}
              <code className="text-amber-100/80">
                https://pushflappy.com/stream?beat=12
              </code>
              .
            </p>
          </article>
        </section>

        <section className="space-y-3" aria-labelledby="overlay-heading">
          <h2
            id="overlay-heading"
            className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500/80"
          >
            Optional overlays
          </h2>
          <article className="rounded-2xl border border-amber-950/60 bg-stone-900/55 px-4 py-4">
            <p className="text-[15px] font-semibold text-amber-50">
              Daily board — /overlay
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-400">
              Second Browser Source:{" "}
              <code className="text-amber-100/80">
                https://pushflappy.com/overlay
              </code>
              . Suggested 480×1080 or 720×720. No camera. Today’s Pacific
              board.
            </p>
          </article>
          <article className="rounded-2xl border border-amber-950/60 bg-stone-900/55 px-4 py-4">
            <p className="text-[15px] font-semibold text-amber-50">
              Race board — /race/{"{id}"}/overlay
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-400">
              Mint a race at{" "}
              <Link
                href="/race"
                className="font-semibold text-amber-200/90 underline-offset-2 hover:underline"
              >
                /race
              </Link>
              , then add{" "}
              <code className="text-amber-100/80">
                https://pushflappy.com/race/{"{id}"}/overlay
              </code>{" "}
              (or <code className="text-amber-100/80">/race/{"{id}"}?obs=1</code>
              ). Viewers join on their phone. Async scores, not lockstep frames.
            </p>
          </article>
        </section>

        <footer className="mt-auto space-y-3 pb-2 pt-2 text-center">
          <Link
            href="/stream"
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-base font-bold text-stone-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
          >
            Open play view
          </Link>
          <p className="text-[11px] text-stone-600">
            <Link href="/" className="underline-offset-2 hover:underline">
              Home
            </Link>
            {" · "}
            <Link href="/faq" className="underline-offset-2 hover:underline">
              FAQ
            </Link>
            {" · "}
            <Link href="/play" className="underline-offset-2 hover:underline">
              Play
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}

function NavChip({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center justify-center rounded-full border border-amber-900/50 bg-stone-900/70 px-3.5 text-xs font-semibold text-amber-50 transition hover:border-amber-600/50"
    >
      {children}
    </Link>
  );
}

/** Small geometric bird — original art, not Flappy Bird sprites. */
function GeometricBirdMini() {
  return (
    <svg width="64" height="52" viewBox="0 0 80 64" aria-hidden>
      <defs>
        <radialGradient id="st-body" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff6b5a" />
          <stop offset="40%" stopColor="#e8453c" />
          <stop offset="100%" stopColor="#8b1a14" />
        </radialGradient>
        <linearGradient id="st-beak" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="100%" stopColor="#c49020" />
        </linearGradient>
      </defs>
      <ellipse cx="38" cy="52" rx="18" ry="5" fill="rgba(0,0,0,0.25)" />
      <ellipse
        cx="34"
        cy="32"
        rx="22"
        ry="18"
        fill="url(#st-body)"
        stroke="#3b0a08"
        strokeWidth="2.2"
      />
      <ellipse cx="38" cy="40" rx="9" ry="7" fill="#e8b48a" />
      <circle cx="48" cy="24" r="8" fill="#fff" stroke="#1a0a08" strokeWidth="1.6" />
      <circle cx="51" cy="25" r="3.5" fill="#1a1a1a" />
      <path d="M54 30 L72 34 L54 40 Z" fill="url(#st-beak)" stroke="#7a4e0a" strokeWidth="1.2" />
    </svg>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQ — Push Flappy",
  description:
    "How Push Flappy works: push-ups drive the bird, camera setup, beat-me links, daily board, races, OBS, and on-device privacy.",
  path: "/faq",
  imageAlt: "Push Flappy FAQ",
});

const FAQS: { q: string; a: string; links?: { href: string; label: string }[] }[] = [
  {
    q: "How does Push Flappy work?",
    a: "Your body is the controller. The game uses your phone or webcam and on-device pose tracking so your torso height maps to the bird’s Y position. Drop into a push-up to dive through copper pipes; press up to rise. Clear gaps to score — no taps required once you are calibrated.",
    links: [{ href: "/guides/webcam-push-up-game", label: "Webcam how-to" }],
  },
  {
    q: "What camera setup do I need?",
    a: "Use a modern phone or laptop with a camera over HTTPS (pushflappy.com already is). Place the phone face-up on the floor under you, or face a webcam on a desk. Allow camera permission, hold the top of a push-up for about a second to lock “up,” then tap Start. Portrait on phone works fine.",
  },
  {
    q: "What are beat-me links?",
    a: "After a run you can share a challenge via WhatsApp, X, copy, or a share card. Friends open a link like /play?beat=N (optional &reps=) and see your score as the bar to beat in the HUD. If they clear it, they get a victory flex and can share back.",
  },
  {
    q: "What is the daily board?",
    a: "Everyone plays the same pipe seed each day (Pacific time), so scores are comparable. Post an anonymous nick + emoji from the game — no account. Browse today’s board any time at /board without turning the camera on.",
    links: [{ href: "/board", label: "Today’s board" }],
  },
  {
    q: "Is my camera / pose data private?",
    a: "Pose runs on your device with MediaPipe. Video frames stay local for tracking; we do not upload your camera feed for pose. Scores you choose to post to the daily board are anonymous nick + emoji + score (and a coarse country from the connection).",
  },
  {
    q: "Do I need an account?",
    a: "No. There are no logins. Local high score stays on your device. Daily board posts are optional and anonymous. Challenge links are just URLs with a score baked in.",
  },
  {
    q: "Does it work without downloading an app?",
    a: "Yes — it is a web game. Open pushflappy.com in a mobile or desktop browser. You can also add it to your home screen as a lightweight PWA if you want a full-screen shortcut.",
  },
  {
    q: "Why won’t the camera start?",
    a: "Browsers require a secure context (HTTPS) and an explicit permission grant. Deny or block the permission, use HTTP on a random IP, or cover the lens and pose won’t lock. Reload, allow camera, and hold a stable plank for calibration.",
  },
  {
    q: "Can I put this in OBS?",
    a: "Yes. Add https://pushflappy.com/stream (or /play?obs=1) as a Browser Source at 1920×1080. That view hides marketing chrome and enlarges the score / beat-me HUD. Allow the camera, hold a plank, and the usual 3-2-1 countdown starts. Viewers dare you by opening the beat-me link on their phone. Optional second source: /overlay for today’s board (no camera). For a live race board use /race/{id}/overlay.",
    links: [
      { href: "/streamers", label: "Streamers / OBS setup" },
      { href: "/guides/obs-push-up-overlay", label: "OBS overlay guide" },
    ],
  },
  {
    q: "How do friend races work?",
    a: "Open /race to mint one share link like /race/abc12. Friends tap it and enter a nick (2–16 letters/numbers) — that name lands on the live top-10 at 0 before anyone flies. Play stays off until the nick is on the board. During /play?race= you see the same compact top-10 (names and scores) while flying; scores tick as pipes are cleared, not only on wipeout. Spectators stay on the race page or overlay and watch without a camera. This is async scores, not lockstep multiplayer. Out-of-race wipeouts still use Challenge a friend.",
    links: [
      { href: "/race", label: "Start a race" },
      { href: "/guides/async-fitness-race", label: "Async race guide" },
      { href: "/streamers", label: "Race overlay in OBS" },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text:
        item.a +
        (item.links?.length
          ? ` ${item.links.map((l) => `https://pushflappy.com${l.href}`).join(" ")}`
          : ""),
    },
  })),
};

export default function FaqPage() {
  return (
    <main className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-600/20 blur-3xl"
      />

      <div className="relative flex flex-1 flex-col gap-8">
        <header className="space-y-3 pt-2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400/95">
            Help · Push day
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-amber-50 sm:text-5xl">
            FAQ
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-stone-400">
            Push-ups drive the bird. Camera on device. Challenges and a daily
            board — no accounts.
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
          <NavChip href="/board">Daily board</NavChip>
          <NavChip href="/race">Race</NavChip>
          <NavChip href="/streamers">Streamers / OBS</NavChip>
        </nav>

        <section className="space-y-3" aria-label="Frequently asked questions">
          {FAQS.map((item) => (
            <article
              key={item.q}
              className="rounded-2xl border border-amber-950/60 bg-stone-900/55 px-4 py-4"
            >
              <h2 className="text-[15px] font-semibold text-amber-50">
                {item.q}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-400">
                {item.a}
              </p>
              {item.links && item.links.length > 0 ? (
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {item.links.map((link) => (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      className="text-sm font-semibold text-amber-300 underline-offset-2 hover:underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                </p>
              ) : null}
            </article>
          ))}
        </section>

        <footer className="mt-auto space-y-3 pb-2 pt-2 text-center">
          <Link
            href="/play"
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-base font-bold text-stone-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
          >
            Start playing
          </Link>
          <p className="text-[11px] text-stone-600">
            <Link href="/" className="underline-offset-2 hover:underline">
              Home
            </Link>
            {" · "}
            <Link href="/board" className="underline-offset-2 hover:underline">
              Daily board
            </Link>
            {" · "}
            <Link href="/race" className="underline-offset-2 hover:underline">
              Race
            </Link>
            {" · "}
            <Link href="/streamers" className="underline-offset-2 hover:underline">
              Streamers / OBS
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
        <radialGradient id="faq-body" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff6b5a" />
          <stop offset="40%" stopColor="#e8453c" />
          <stop offset="100%" stopColor="#8b1a14" />
        </radialGradient>
        <linearGradient id="faq-beak" x1="0" y1="0" x2="1" y2="1">
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
        fill="url(#faq-body)"
        stroke="#3b0a08"
        strokeWidth="2.2"
      />
      <ellipse cx="38" cy="40" rx="9" ry="7" fill="#e8b48a" />
      <circle cx="48" cy="24" r="8" fill="#fff" stroke="#1a0a08" strokeWidth="1.6" />
      <circle cx="51" cy="25" r="3.5" fill="#1a1a1a" />
      <path d="M54 30 L72 34 L54 40 Z" fill="url(#faq-beak)" stroke="#7a4e0a" strokeWidth="1.2" />
    </svg>
  );
}

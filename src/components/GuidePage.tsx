import type { ReactNode } from "react";
import Link from "next/link";

export function GuidePage({
  kicker,
  title,
  lede,
  children,
  jsonLd,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
  jsonLd?: Record<string, unknown>;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <main className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-600/20 blur-3xl"
      />

      <div className="relative flex flex-1 flex-col gap-8">
        <header className="space-y-3 pt-2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400/95">
            {kicker}
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-amber-50 sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-stone-400">
            {lede}
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
          <NavChip href="/faq">FAQ</NavChip>
          <NavChip href="/streamers">Streamers / OBS</NavChip>
        </nav>

        <div className="space-y-3">{children}</div>

        <footer className="mt-auto space-y-3 pb-2 pt-2 text-center">
          {primaryHref.startsWith("http") ? (
            <a
              href={primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-base font-bold text-stone-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              {primaryLabel}
            </a>
          ) : (
            <Link
              href={primaryHref}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-base font-bold text-stone-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              {primaryLabel}
            </Link>
          )}
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-amber-900/50 bg-stone-900/70 px-6 py-3 text-base font-semibold text-amber-50 transition hover:border-amber-600/50"
            >
              {secondaryLabel}
            </Link>
          ) : null}
          <p className="text-[11px] text-stone-600">
            <Link href="/" className="underline-offset-2 hover:underline">
              Home
            </Link>
            {" · "}
            <Link href="/faq" className="underline-offset-2 hover:underline">
              FAQ
            </Link>
            {" · "}
            <Link href="/board" className="underline-offset-2 hover:underline">
              Daily board
            </Link>
            {" · "}
            <Link href="/race" className="underline-offset-2 hover:underline">
              Race
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}

export function GuideCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-amber-950/60 bg-stone-900/55 px-4 py-4">
      <h2 className="text-[15px] font-semibold text-amber-50">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-stone-400">
        {children}
      </div>
    </article>
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
        <radialGradient id="g-body" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff6b5a" />
          <stop offset="40%" stopColor="#e8453c" />
          <stop offset="100%" stopColor="#8b1a14" />
        </radialGradient>
        <linearGradient id="g-beak" x1="0" y1="0" x2="1" y2="1">
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
        fill="url(#g-body)"
        stroke="#3b0a08"
        strokeWidth="2.2"
      />
      <ellipse cx="38" cy="40" rx="9" ry="7" fill="#e8b48a" />
      <circle cx="48" cy="24" r="8" fill="#fff" stroke="#1a0a08" strokeWidth="1.6" />
      <circle cx="51" cy="25" r="3.5" fill="#1a1a1a" />
      <path d="M54 30 L72 34 L54 40 Z" fill="url(#g-beak)" stroke="#7a4e0a" strokeWidth="1.2" />
    </svg>
  );
}

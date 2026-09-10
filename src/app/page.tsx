import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-between px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:py-14">
      {/* Soft copper glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-700/25 blur-3xl"
      />

      <div className="relative space-y-8">
        <div className="space-y-3 text-center sm:text-left">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
            Push day
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Push Flappy
          </h1>
          <p className="text-lg text-zinc-300 sm:text-xl">
            Flappy Bird for push day
          </p>
          <p className="text-base leading-relaxed text-zinc-400">
            Your torso height is the bird. Drop into a push-up to dive through
            copper pipes — press up to rise. Webcam + on-device pose. No
            accounts, no install.
          </p>
        </div>

        {/* Works on phone callout */}
        <div className="rounded-2xl border border-amber-700/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100/90">
          <p className="font-semibold text-amber-400">Works on phone</p>
          <p className="mt-1 text-amber-100/70 leading-relaxed">
            Put the phone on the floor facing up, get into a plank, and play.
            Camera needs <strong className="font-semibold text-amber-200">HTTPS</strong>{" "}
            after you deploy (Vercel is the easy path). Portrait is fine —
            landscape is optional.
          </p>
        </div>

        {/* Mini preview art */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-sky-900/40 to-emerald-950/50 p-6">
          <div className="flex items-center justify-center gap-6">
            <GeometricBird />
            <div className="flex flex-col gap-2 opacity-90">
              <CopperBar h={48} />
              <div className="h-10" />
              <CopperBar h={56} />
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-zinc-400">
            Continuous body-Y tracking · MediaPipe Pose · local high score
          </p>
        </div>

        <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
            How to play
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
            <li>
              Open the site on <strong className="font-medium text-zinc-300">HTTPS</strong>{" "}
              (or localhost). Phone browsers block the camera on plain HTTP.
            </li>
            <li>Allow camera access (front camera, mirrored).</li>
            <li>
              Get into a push-up position facing the camera — phone on the floor
              looking up works great; laptop webcam is fine too.
            </li>
            <li>
              Hold the <strong className="font-medium text-zinc-300">top of a
              push-up</strong> (plank) for about a second to set bird “up” near
              the top. Then tap Start.
            </li>
            <li>
              Bird Y follows your shoulders/torso. Go down → bird down. Go up →
              bird up.
            </li>
            <li>Clear the gaps in the scrolling copper pipes to score.</li>
            <li>Share your score when you wipe out.</li>
          </ol>
        </section>
      </div>

      <div className="relative mt-10 space-y-3">
        <Link
          href="/play"
          className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
        >
          Start
        </Link>
        <p className="text-center text-xs text-zinc-500">
          Needs camera · phone play works best after HTTPS deploy
        </p>
      </div>
    </main>
  );
}

function GeometricBird() {
  return (
    <svg width="72" height="56" viewBox="0 0 72 56" aria-hidden>
      <ellipse cx="32" cy="30" rx="22" ry="18" fill="#e8453c" stroke="#8b1a14" strokeWidth="2" />
      <ellipse cx="36" cy="36" rx="10" ry="8" fill="#f5d0a9" />
      <ellipse cx="26" cy="28" rx="9" ry="7" fill="#fff8e7" stroke="#c9a06a" strokeWidth="1.5" transform="rotate(-20 26 28)" />
      <circle cx="44" cy="22" r="7" fill="#fff" />
      <circle cx="46" cy="22" r="3" fill="#1a1a1a" />
      <path d="M48 28 L68 32 L48 38 Z" fill="#f5c542" stroke="#c49020" strokeWidth="1" />
    </svg>
  );
}

function CopperBar({ h }: { h: number }) {
  return (
    <div
      className="w-10 rounded-sm shadow-inner"
      style={{
        height: h,
        background:
          "linear-gradient(90deg,#5c3310 0%,#b87333 20%,#e8a857 40%,#f0c078 50%,#c47a3a 70%,#8b4513 100%)",
      }}
    />
  );
}

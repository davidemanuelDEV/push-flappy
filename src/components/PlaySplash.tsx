/** Shared fullscreen loading chrome for /play */
export default function PlaySplash({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-5 bg-zinc-950 px-6 text-white">
      <div className="pf-splash-mark flex flex-col items-center gap-3">
        <svg width="72" height="56" viewBox="0 0 72 56" aria-hidden>
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
        <p className="text-lg font-bold tracking-tight">Push Flappy</p>
      </div>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}

/** Shared fullscreen loading chrome for /play */
export default function PlaySplash({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-5 bg-[#120e0c] px-6 text-white">
      <div className="pf-splash-mark flex flex-col items-center gap-3">
        <svg width="80" height="64" viewBox="0 0 80 64" aria-hidden>
          <defs>
            <radialGradient id="splash-body" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ff6b5a" />
              <stop offset="40%" stopColor="#e8453c" />
              <stop offset="100%" stopColor="#8b1a14" />
            </radialGradient>
            <radialGradient id="splash-wing" cx="30%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#fff6e8" />
              <stop offset="100%" stopColor="#c9925a" />
            </radialGradient>
            <linearGradient id="splash-beak" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffe066" />
              <stop offset="100%" stopColor="#c49020" />
            </linearGradient>
          </defs>
          <ellipse cx="38" cy="52" rx="22" ry="6" fill="rgba(0,0,0,0.28)" />
          <ellipse
            cx="34"
            cy="32"
            rx="24"
            ry="20"
            fill="url(#splash-body)"
            stroke="#3b0a08"
            strokeWidth="2.5"
          />
          <ellipse cx="38" cy="40" rx="11" ry="9" fill="#e8b48a" />
          <ellipse
            cx="26"
            cy="30"
            rx="11"
            ry="8"
            fill="url(#splash-wing)"
            stroke="#5c3310"
            strokeWidth="1.8"
            transform="rotate(-22 26 30)"
          />
          <ellipse cx="42" cy="36" rx="5" ry="3.5" fill="rgba(255,120,100,0.45)" />
          <circle cx="48" cy="24" r="9" fill="#fff" stroke="#1a0a08" strokeWidth="1.8" />
          <circle cx="51" cy="25" r="4" fill="#1a1a1a" />
          <circle cx="46" cy="21" r="2.2" fill="#fff" />
          <path d="M38 14 Q48 6 58 16 Q50 12 39 16 Z" fill="#1a0a08" />
          <path
            d="M54 30 L74 34 L54 42 Z"
            fill="url(#splash-beak)"
            stroke="#7a4e0a"
            strokeWidth="1.4"
          />
        </svg>
        <p className="font-display text-xl font-bold tracking-tight text-amber-50">
          Push Flappy
        </p>
      </div>
      <p className="text-sm text-stone-400">{label}</p>
    </div>
  );
}

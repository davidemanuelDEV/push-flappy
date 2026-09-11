"use client";

import { track } from "@/lib/analytics";
import {
  SQUAT_FLAPPY_PLAY_URL,
  siblingPillCopy,
  type SiblingPillSurface,
} from "@/lib/sibling";

/**
 * Rounded-full Squat Flappy promo badge.
 * Landing hero + /play ready/idle chrome only — not wipeout, not mid-game.
 */
export default function SiblingPromoPill({
  surface,
  className = "",
}: {
  surface: SiblingPillSurface;
  className?: string;
}) {
  return (
    <a
      href={SQUAT_FLAPPY_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("sibling_click", { from: "push", surface })}
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-amber-400/65 bg-amber-500/20 px-4 text-sm font-semibold text-amber-50 shadow-[0_0_0_1px_rgba(251,191,36,0.14)] transition hover:border-amber-300 hover:bg-amber-500/30 hover:text-white ${className}`}
    >
      <PromoMark />
      {siblingPillCopy()}
    </a>
  );
}

/** Original geometric mark — stacked amber diamonds, not a copyrighted sprite. */
function PromoMark() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden
      className="shrink-0"
    >
      <path d="M7 1.15 L12.35 7 L7 12.85 L1.65 7 Z" fill="#fbbf24" />
      <path d="M7 3.45 L9.85 7 L7 10.55 L4.15 7 Z" fill="#1c120c" />
    </svg>
  );
}

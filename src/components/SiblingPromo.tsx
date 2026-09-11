"use client";

import { track } from "@/lib/analytics";
import {
  SQUAT_FLAPPY_PLAY_URL,
  siblingPromoCopy,
  type SiblingSurface,
} from "@/lib/sibling";

/**
 * Secondary sibling promo — full-width outline under Challenge a friend.
 * Must not compete with the primary filled Challenge / Your move CTA.
 */
export default function SiblingPromo({
  surface,
  className = "",
}: {
  surface: SiblingSurface;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        Also try
      </p>
      <a
        href={SQUAT_FLAPPY_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("sibling_click", { from: "push", surface })}
        className="flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-amber-200 bg-transparent px-4 py-3 text-center text-base font-semibold leading-snug text-amber-50 hover:border-amber-100 hover:bg-amber-950/45"
      >
        {siblingPromoCopy()}
      </a>
    </div>
  );
}

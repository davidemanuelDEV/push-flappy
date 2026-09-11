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
    <a
      href={SQUAT_FLAPPY_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("sibling_click", { from: "push", surface })}
      className={`flex min-h-10 w-full items-center justify-center rounded-xl border border-amber-300/65 bg-transparent px-3 py-2.5 text-center text-sm font-semibold leading-snug text-amber-100 hover:border-amber-200 hover:bg-amber-950/45 hover:text-amber-50 ${className}`}
    >
      {siblingPromoCopy()}
    </a>
  );
}

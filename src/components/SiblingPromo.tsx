"use client";

import { track } from "@/lib/analytics";
import {
  SQUAT_FLAPPY_PLAY_URL,
  siblingPromoCopy,
  type SiblingSurface,
} from "@/lib/sibling";

/**
 * Light secondary sibling promo — text/link only.
 * Must not compete with Challenge a friend / Your move.
 */
export default function SiblingPromo({
  surface,
  className = "",
}: {
  surface: SiblingSurface;
  className?: string;
}) {
  return (
    <p className={`text-center text-[11px] leading-snug text-zinc-500 ${className}`}>
      <a
        href={SQUAT_FLAPPY_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("sibling_click", { from: "push", surface })}
        className="font-medium text-amber-200/70 underline-offset-2 hover:text-amber-200 hover:underline"
      >
        {siblingPromoCopy(surface)}
      </a>
    </p>
  );
}

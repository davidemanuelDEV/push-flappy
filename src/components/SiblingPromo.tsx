"use client";

import { track } from "@/lib/analytics";
import {
  SQUAT_FLAPPY_PLAY_URL,
  siblingPromoCopy,
  type SiblingSurface,
} from "@/lib/sibling";

/**
 * Light sibling-app promo for wipeout / victory share surfaces.
 * David's cross-market ask: Push ↔ Squat before and after the challenge.
 */
export default function SiblingPromo({
  surface,
  variant = "chip",
  className = "",
}: {
  surface: SiblingSurface;
  /** chip = around the challenge CTA; inline = More ways footer */
  variant?: "chip" | "inline";
  className?: string;
}) {
  const line = siblingPromoCopy(surface);
  const onClick = () => track("sibling_click", { from: "push", surface });

  if (variant === "inline") {
    return (
      <p className={`text-center text-[11px] text-zinc-500 ${className}`}>
        Same bird, stand-up pipes —{" "}
        <a
          href={SQUAT_FLAPPY_PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="font-semibold text-amber-200/80 underline-offset-2 hover:underline"
        >
          {line}
        </a>
      </p>
    );
  }

  return (
    <a
      href={SQUAT_FLAPPY_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`flex min-h-10 w-full items-center justify-center rounded-xl border border-amber-800/40 bg-amber-950/30 px-3 py-2 text-[13px] font-semibold text-amber-200/95 transition hover:border-amber-600/50 hover:bg-amber-950/45 ${className}`}
    >
      {line}
    </a>
  );
}

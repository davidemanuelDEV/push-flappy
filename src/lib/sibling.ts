/**
 * Cross-market sibling: Squat Flappy.
 * squatflappy.com is attached (www → apex). Prefer /play.
 */

export const SQUAT_FLAPPY_ORIGIN = "https://squatflappy.com";
export const SQUAT_FLAPPY_PLAY_URL = `${SQUAT_FLAPPY_ORIGIN}/play`;

export type SiblingWipeoutSurface = "wipeout" | "victory";
export type SiblingPillSurface = "landing" | "play";
export type SiblingSurface = SiblingWipeoutSurface | SiblingPillSurface;

/** Growth copy lock — same line on all Push wipeout / challenge surfaces. */
export const SIBLING_PROMO_COPY = "Arms cooked? Legs next → squatflappy.com";

/** Top promo-badge copy — landing / play ready chrome only. */
export const SIBLING_PILL_COPY = "Also play Squat Flappy";

export function siblingPromoCopy(): string {
  return SIBLING_PROMO_COPY;
}

export function siblingPillCopy(): string {
  return SIBLING_PILL_COPY;
}

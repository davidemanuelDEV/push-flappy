/**
 * Cross-market sibling: Squat Flappy.
 * squatflappy.com is attached (www → apex). Prefer /play.
 */

export const SQUAT_FLAPPY_ORIGIN = "https://squatflappy.com";
export const SQUAT_FLAPPY_PLAY_URL = `${SQUAT_FLAPPY_ORIGIN}/play`;

export type SiblingSurface = "wipeout" | "victory";

/** Growth copy lock — same line on all Push wipeout / challenge surfaces. */
export const SIBLING_PROMO_COPY = "Arms cooked? Legs next → squatflappy.com";

export function siblingPromoCopy(_surface?: SiblingSurface): string {
  return SIBLING_PROMO_COPY;
}

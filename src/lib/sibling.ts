/**
 * Cross-market sibling: Squat Flappy.
 * Host is squat-flappy.vercel.app until squatflappy.com DNS is attached.
 */

export const SQUAT_FLAPPY_ORIGIN = "https://squat-flappy.vercel.app";
export const SQUAT_FLAPPY_PLAY_URL = `${SQUAT_FLAPPY_ORIGIN}/play`;

export type SiblingSurface = "wipeout" | "victory";

/** Short geometric-fun copy — not VectorCare. */
export function siblingPromoCopy(surface: SiblingSurface): string {
  return surface === "victory"
    ? "Also try Squat Flappy"
    : "Standing desk? Try Squat Flappy";
}

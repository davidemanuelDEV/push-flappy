import { HIGH_SCORE_KEY } from "@/lib/constants";

/** Set after the first cleared pipe. Gates the soft PWA install tip. */
export const HAS_FLAPPED_KEY = "pf-has-flapped";

export function markFlapped(): void {
  try {
    localStorage.setItem(HAS_FLAPPED_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function hasFlapped(): boolean {
  try {
    if (localStorage.getItem(HAS_FLAPPED_KEY) === "1") return true;
    const hs = Number.parseInt(localStorage.getItem(HIGH_SCORE_KEY) ?? "", 10);
    return Number.isFinite(hs) && hs > 0;
  } catch {
    return false;
  }
}

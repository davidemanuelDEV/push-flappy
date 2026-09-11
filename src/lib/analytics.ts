"use client";

import { track as vercelTrack } from "@vercel/analytics";

/** Client event names used by Growth (free Vercel Analytics). */
export type GrowthEvent =
  | "play_start"
  | "play_wipeout"
  | "challenge_open"
  | "share_click"
  | "board_submit"
  | "reminder_optin"
  | "sibling_click";

export type ShareChannel = "wa" | "x" | "copy" | "native" | "card" | "primary";

/**
 * Thin wrapper around @vercel/analytics track().
 * No-ops safely if Analytics is unavailable; never throws into game UI.
 */
export function track(
  event: GrowthEvent,
  props?: Record<string, string | number | boolean | null | undefined>
): void {
  try {
    const cleaned: Record<string, string | number | boolean> = {};
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v === undefined || v === null) continue;
        cleaned[k] = v;
      }
    }
    vercelTrack(event, cleaned);
  } catch {
    /* ignore — analytics must never break play */
  }
}

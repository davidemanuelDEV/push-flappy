/**
 * Race ids, share URLs, and pipe seeds.
 * One link = one async lobby. Not frame-sync multiplayer.
 */

import { SITE_ORIGIN } from "./share";

/** Max unique nicks persisted on a race board. */
export const RACE_NICK_CAP = 10;

/** Short codes for share links — skip 0/O/1/l lookalikes. */
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export const RACE_ID_MIN = 3;
export const RACE_ID_MAX = 8;
export const RACE_ID_MINT_LEN = 5;

export function sanitizeRaceId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim().toLowerCase();
  if (id.length < RACE_ID_MIN || id.length > RACE_ID_MAX) return null;
  if (!/^[a-z0-9]+$/.test(id)) return null;
  return id;
}

export function mintRaceId(): string {
  const bytes = new Uint8Array(RACE_ID_MINT_LEN);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

/** Stable pipe RNG seed for everyone in this race. */
export function racePipeSeed(id: string): string {
  return `push-flappy-race:${id}`;
}

export function racePath(id: string): string {
  return `/race/${id}`;
}

export function racePlayPath(id: string): string {
  return `/play?race=${encodeURIComponent(id)}`;
}

/** Body for joining a race board before the first wipeout. */
export function raceJoinPayload(nick: string, emoji: string): {
  nick: string;
  emoji: string;
  score: 0;
  reps: 0;
} {
  return { nick, emoji, score: 0, reps: 0 };
}

export function raceOverlayPath(id: string): string {
  return `/race/${id}/overlay`;
}

export function raceUrl(id: string, origin: string = SITE_ORIGIN): string {
  return `${origin}${racePath(id)}`;
}

export function parseRaceFromSearch(
  search: string | URLSearchParams
): string | null {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;
  return sanitizeRaceId(params.get("race"));
}

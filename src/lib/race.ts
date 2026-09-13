/**
 * Race ids, share URLs, and pipe seeds.
 * One link = one async lobby. Not frame-sync multiplayer.
 */

import { SITE_ORIGIN } from "./share";

/** Max unique nicks persisted on a race board. */
export const RACE_NICK_CAP = 10;

/** How often play / lobby / overlay refresh the live top-10. */
export const RACE_POLL_MS = 1_000;

/** Min gap between mid-run score POSTs (pipes are ~2.5s; wipeout is extra). */
export const RACE_PROGRESS_MIN_MS = 1_000;

/** Short codes for share links — skip 0/O/1/l lookalikes. */
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export const RACE_ID_MIN = 3;
export const RACE_ID_MAX = 8;
export const RACE_ID_MINT_LEN = 5;

export const RACE_TITLE_MIN = 2;
export const RACE_TITLE_MAX = 32;

export function sanitizeRaceId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim().toLowerCase();
  if (id.length < RACE_ID_MIN || id.length > RACE_ID_MAX) return null;
  if (!/^[a-z0-9]+$/.test(id)) return null;
  return id;
}

/**
 * Optional workplace-race label. Empty / invalid → undefined (id-only).
 * Letters, numbers, spaces, basic punctuation. 2–32 after trim.
 */
export function sanitizeRaceTitle(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const title = raw.trim().replace(/\s+/g, " ");
  if (title.length < RACE_TITLE_MIN || title.length > RACE_TITLE_MAX) {
    return undefined;
  }
  if (!/^[\p{L}\p{N} .,'!?\-:&()+#]+$/u.test(title)) return undefined;
  return title;
}

/** Lobby / overlay heading: titled race or today’s id-only label. */
export function raceDisplayTitle(id: string, title?: string): string {
  return title || id.toUpperCase();
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

/** Row shape shared by play HUD, lobby, and overlay. */
export type RaceBoardRow = {
  nick: string;
  emoji: string;
  score: number;
  reps: number;
};

/**
 * Overlay the local player's live score so the in-play board ticks
 * before the POST/poll round-trip. Same nick updates in place; cap 10.
 */
export function withLocalRaceScore(
  entries: RaceBoardRow[],
  local: RaceBoardRow | null
): RaceBoardRow[] {
  if (!local?.nick.trim()) {
    return [...entries]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.reps - a.reps;
      })
      .slice(0, RACE_NICK_CAP);
  }
  const nickKey = local.nick.toLowerCase();
  const others = entries.filter((e) => e.nick.toLowerCase() !== nickKey);
  const existing = entries.find((e) => e.nick.toLowerCase() === nickKey);
  const mine: RaceBoardRow = {
    nick: existing?.nick ?? local.nick,
    emoji: local.emoji || existing?.emoji || "🐦",
    score: local.score,
    reps: local.reps,
  };
  return [...others, mine]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.reps - a.reps;
    })
    .slice(0, RACE_NICK_CAP);
}

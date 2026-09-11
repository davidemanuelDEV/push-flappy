/**
 * Daily leaderboard persistence.
 * Prefer Vercel KV / Upstash REST when env is set; otherwise in-memory
 * (best-effort on Hobby — lost on cold starts / multi-instance).
 */

import { laDayKey } from "./daily";

export type LeaderboardEntry = {
  nick: string;
  emoji: string;
  score: number;
  reps: number;
  dayKey: string;
  at: number;
};

export type LeaderboardPayload = {
  dayKey: string;
  entries: LeaderboardEntry[];
  storage: "kv" | "memory";
};

const MAX_ENTRIES = 50;
const KEY_PREFIX = "push-flappy:lb:";

type GlobalMem = {
  __pushFlappyLb?: Map<string, LeaderboardEntry[]>;
  __pushFlappyRl?: Map<string, number[]>;
};

function memStore(): Map<string, LeaderboardEntry[]> {
  const g = globalThis as unknown as GlobalMem;
  if (!g.__pushFlappyLb) g.__pushFlappyLb = new Map();
  return g.__pushFlappyLb;
}

export function rateLimitStore(): Map<string, number[]> {
  const g = globalThis as unknown as GlobalMem;
  if (!g.__pushFlappyRl) g.__pushFlappyRl = new Map();
  return g.__pushFlappyRl;
}

function kvConfigured(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  );
}

async function kvCommand<T>(
  ...args: (string | number)[]
): Promise<T | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("KV command failed", res.status, await res.text());
    return null;
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}

function sortEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.reps !== a.reps) return b.reps - a.reps;
    return a.at - b.at;
  });
}

export async function getDailyBoard(
  dayKey: string = laDayKey()
): Promise<LeaderboardPayload> {
  const key = KEY_PREFIX + dayKey;
  if (kvConfigured()) {
    const raw = await kvCommand<string | null>("GET", key);
    let entries: LeaderboardEntry[] = [];
    if (raw) {
      try {
        entries = JSON.parse(raw) as LeaderboardEntry[];
      } catch {
        entries = [];
      }
    }
    return {
      dayKey,
      entries: sortEntries(entries).slice(0, MAX_ENTRIES),
      storage: "kv",
    };
  }
  const entries = memStore().get(key) ?? [];
  return {
    dayKey,
    entries: sortEntries(entries).slice(0, MAX_ENTRIES),
    storage: "memory",
  };
}

export async function submitScore(
  entry: Omit<LeaderboardEntry, "at" | "dayKey"> & {
    dayKey?: string;
  }
): Promise<LeaderboardPayload> {
  const dayKey = entry.dayKey ?? laDayKey();
  const key = KEY_PREFIX + dayKey;
  const full: LeaderboardEntry = {
    nick: entry.nick,
    emoji: entry.emoji,
    score: entry.score,
    reps: entry.reps,
    dayKey,
    at: Date.now(),
  };

  if (kvConfigured()) {
    const raw = await kvCommand<string | null>("GET", key);
    let entries: LeaderboardEntry[] = [];
    if (raw) {
      try {
        entries = JSON.parse(raw) as LeaderboardEntry[];
      } catch {
        entries = [];
      }
    }
    // Keep best per nick (case-insensitive)
    const nickKey = full.nick.toLowerCase();
    entries = entries.filter((e) => e.nick.toLowerCase() !== nickKey);
    entries.push(full);
    entries = sortEntries(entries).slice(0, MAX_ENTRIES);
    await kvCommand("SET", key, JSON.stringify(entries));
    // Expire after ~3 days
    await kvCommand("EXPIRE", key, 60 * 60 * 72);
    return { dayKey, entries, storage: "kv" };
  }

  const store = memStore();
  let entries = store.get(key) ?? [];
  const nickKey = full.nick.toLowerCase();
  entries = entries.filter((e) => e.nick.toLowerCase() !== nickKey);
  entries.push(full);
  entries = sortEntries(entries).slice(0, MAX_ENTRIES);
  store.set(key, entries);
  return { dayKey, entries, storage: "memory" };
}

/** Basic sliding-window rate limit. Returns true if allowed. */
export function allowRequest(
  id: string,
  limit: number,
  windowMs: number
): boolean {
  const store = rateLimitStore();
  const now = Date.now();
  const prev = (store.get(id) ?? []).filter((t) => now - t < windowMs);
  if (prev.length >= limit) {
    store.set(id, prev);
    return false;
  }
  prev.push(now);
  store.set(id, prev);
  return true;
}

export function sanitizeNick(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().slice(0, 16);
  if (trimmed.length < 2) return null;
  // Letters, numbers, spaces, _ - and common punctuation; block control chars
  if (!/^[\p{L}\p{N} _.\-']+$/u.test(trimmed)) return null;
  return trimmed;
}

export function sanitizeEmoji(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "🐦";
  // Keep a short emoji / glyph cluster
  const e = [...raw.trim()].slice(0, 4).join("");
  return e || "🐦";
}

export function clampScore(n: unknown): number | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  const v = Math.floor(n);
  if (v < 0 || v > 9999) return null;
  return v;
}

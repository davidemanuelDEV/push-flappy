/**
 * Daily leaderboard persistence.
 * Prefer private Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set; else
 * KV / Upstash REST (`KV_REST_API_*` or `UPSTASH_REDIS_REST_*`);
 * otherwise in-memory (lost on cold starts / multi-instance).
 * Demo seed rows are gated: never in production unless ALLOW_DEMO_LEADERBOARD=1.
 */

import { laDayKey } from "./daily";
import { normalizeCountry } from "./country";

export type LeaderboardEntry = {
  nick: string;
  emoji: string;
  score: number;
  reps: number;
  dayKey: string;
  at: number;
  /** ISO 3166-1 alpha-2 */
  country: string;
  /** True for built-in demo flavor rows (not real players). */
  demo?: boolean;
};

export type LeaderboardStorage = "blob" | "kv" | "memory";

export type LeaderboardPayload = {
  dayKey: string;
  entries: LeaderboardEntry[];
  storage: LeaderboardStorage;
  /** True when response includes (or would seed) demo flavor rows. */
  demo: boolean;
};

const MAX_ENTRIES = 50;
const KEY_PREFIX = "push-flappy:lb:";
const BLOB_PREFIX = "push-flappy/lb/";

type GlobalMem = {
  __pushFlappyLb?: Map<string, LeaderboardEntry[]>;
  __pushFlappyRl?: Map<string, number[]>;
  __pushFlappySeeded?: Set<string>;
};

function memStore(): Map<string, LeaderboardEntry[]> {
  const g = globalThis as unknown as GlobalMem;
  if (!g.__pushFlappyLb) g.__pushFlappyLb = new Map();
  return g.__pushFlappyLb;
}

function seededDays(): Set<string> {
  const g = globalThis as unknown as GlobalMem;
  if (!g.__pushFlappySeeded) g.__pushFlappySeeded = new Set();
  return g.__pushFlappySeeded;
}

export function rateLimitStore(): Map<string, number[]> {
  const g = globalThis as unknown as GlobalMem;
  if (!g.__pushFlappyRl) g.__pushFlappyRl = new Map();
  return g.__pushFlappyRl;
}

/**
 * Vercel KV marketplace injects KV_REST_API_*; a raw Upstash Redis
 * database injects UPSTASH_REDIS_REST_*. Same REST protocol — accept either pair.
 * Prefer a complete KV_* pair; otherwise a complete UPSTASH_* pair.
 * Never log these values.
 */
export function kvRestConfig(): { url: string; token: string } | null {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (kvUrl && kvToken) return { url: kvUrl, token: kvToken };
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (upstashUrl && upstashToken) return { url: upstashUrl, token: upstashToken };
  return null;
}

export function kvConfigured(): boolean {
  return kvRestConfig() != null;
}

/** Private Blob store — token is read by the SDK; never log it. */
export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Durable backend in use, or memory if none of the persist env pairs/tokens are set. */
export function persistKind(): LeaderboardStorage {
  if (blobConfigured()) return "blob";
  if (kvConfigured()) return "kv";
  return "memory";
}

function blobPathname(dayKey: string): string {
  return `${BLOB_PREFIX}${dayKey}.json`;
}

/** Demo seeds only outside production, or when explicitly allowed. */
export function demoLeaderboardAllowed(): boolean {
  if (process.env.ALLOW_DEMO_LEADERBOARD === "1") return true;
  return process.env.NODE_ENV !== "production";
}

async function kvCommand<T>(
  ...args: (string | number)[]
): Promise<T | null> {
  const creds = kvRestConfig();
  if (!creds) return null;
  const { url, token } = creds;
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

function normalizeEntry(e: LeaderboardEntry): LeaderboardEntry {
  return {
    ...e,
    country: normalizeCountry(e.country),
    demo: Boolean(e.demo),
  };
}

/** Fun gym-bro / push-day demo nicks — clearly flavor, varied countries. */
const SEED_TEMPLATE: Omit<LeaderboardEntry, "dayKey" | "at">[] = [
  { nick: "PlankDaddy", emoji: "💪", score: 42, reps: 38, country: "US", demo: true },
  { nick: "PipeDodger", emoji: "🐦", score: 37, reps: 31, country: "GB", demo: true },
  { nick: "CopperKing", emoji: "🏋️", score: 33, reps: 29, country: "BR", demo: true },
  { nick: "RepGoblin", emoji: "😈", score: 28, reps: 40, country: "JP", demo: true },
  { nick: "FormCheck", emoji: "🫡", score: 24, reps: 22, country: "CA", demo: true },
  { nick: "FloorCam", emoji: "📱", score: 19, reps: 18, country: "AU", demo: true },
  { nick: "GapRunner", emoji: "🔥", score: 15, reps: 14, country: "DE", demo: true },
  { nick: "PushDayPete", emoji: "🫡", score: 12, reps: 16, country: "MX", demo: true },
  { nick: "NoseToFloor", emoji: "😤", score: 9, reps: 11, country: "KR", demo: true },
  { nick: "BirdBrain", emoji: "🧠", score: 6, reps: 8, country: "FR", demo: true },
  { nick: "DemoDipper", emoji: "✨", score: 4, reps: 5, country: "IN", demo: true },
];

export function demoEntriesForDay(dayKey: string): LeaderboardEntry[] {
  // Stable-ish timestamps within the LA day so sort is deterministic
  const base = Date.parse(`${dayKey}T16:00:00-07:00`);
  const t0 = Number.isFinite(base) ? base : Date.now() - 3_600_000;
  return SEED_TEMPLATE.map((s, i) =>
    normalizeEntry({
      ...s,
      dayKey,
      at: t0 + i * 97_000,
    })
  );
}

/**
 * Merge stored rows with demo seeds (when demos allowed): real players win
 * nick collisions; seeds fill gaps so the board never looks empty in dev.
 */
export function mergeWithSeeds(
  dayKey: string,
  stored: LeaderboardEntry[]
): LeaderboardEntry[] {
  const normalized = stored.map(normalizeEntry);
  if (!demoLeaderboardAllowed()) {
    // Strip any persisted demo rows in production so the board stays honest.
    return sortEntries(normalized.filter((e) => !e.demo)).slice(0, MAX_ENTRIES);
  }
  const seeds = demoEntriesForDay(dayKey);
  if (normalized.length === 0) return seeds;

  const byNick = new Map<string, LeaderboardEntry>();
  for (const s of seeds) byNick.set(s.nick.toLowerCase(), s);
  for (const e of normalized) {
    // Real (or persisted) entries override seed same-nick
    byNick.set(e.nick.toLowerCase(), e);
  }
  return sortEntries([...byNick.values()]).slice(0, MAX_ENTRIES);
}

async function parseEntries(raw: string): Promise<LeaderboardEntry[]> {
  try {
    return (JSON.parse(raw) as LeaderboardEntry[]).map(normalizeEntry);
  } catch {
    return [];
  }
}

async function readBlob(dayKey: string): Promise<LeaderboardEntry[]> {
  const { get } = await import("@vercel/blob");
  try {
    const result = await get(blobPathname(dayKey), { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return [];
    const text = await new Response(result.stream).text();
    return parseEntries(text);
  } catch (e) {
    console.error("Blob board read failed", e instanceof Error ? e.name : "");
    return [];
  }
}

async function writeBlob(
  dayKey: string,
  entries: LeaderboardEntry[]
): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(blobPathname(dayKey), JSON.stringify(entries), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

async function readRaw(dayKey: string): Promise<{
  entries: LeaderboardEntry[];
  storage: LeaderboardStorage;
}> {
  const key = KEY_PREFIX + dayKey;
  const storage = persistKind();
  if (storage === "blob") {
    return { entries: await readBlob(dayKey), storage };
  }
  if (storage === "kv") {
    const raw = await kvCommand<string | null>("GET", key);
    const entries = raw ? await parseEntries(raw) : [];
    return { entries, storage };
  }
  const entries = (memStore().get(key) ?? []).map(normalizeEntry);
  return { entries, storage: "memory" };
}

async function writeRaw(
  dayKey: string,
  entries: LeaderboardEntry[],
  storage: LeaderboardStorage
): Promise<void> {
  const key = KEY_PREFIX + dayKey;
  const payload = sortEntries(entries).slice(0, MAX_ENTRIES);
  if (storage === "blob" && blobConfigured()) {
    await writeBlob(dayKey, payload);
    return;
  }
  if (storage === "kv" && kvConfigured()) {
    await kvCommand("SET", key, JSON.stringify(payload));
    await kvCommand("EXPIRE", key, 60 * 60 * 72);
    return;
  }
  memStore().set(key, payload);
}

/** Persist demo seeds once per day when store is empty (dev / ALLOW_DEMO only). */
async function ensureSeeded(
  dayKey: string,
  storage: LeaderboardStorage,
  entries: LeaderboardEntry[]
): Promise<LeaderboardEntry[]> {
  if (!demoLeaderboardAllowed()) {
    return entries.filter((e) => !e.demo);
  }
  if (entries.length > 0) return entries;
  const mark = `${storage}:${dayKey}`;
  const seeds = demoEntriesForDay(dayKey);
  if (!seededDays().has(mark)) {
    seededDays().add(mark);
    try {
      await writeRaw(dayKey, seeds, storage);
    } catch (e) {
      console.error("Failed to persist demo seeds", e);
    }
  }
  return seeds;
}

export async function getDailyBoard(
  dayKey: string = laDayKey()
): Promise<LeaderboardPayload> {
  const { entries: stored, storage } = await readRaw(dayKey);
  const ensured = await ensureSeeded(dayKey, storage, stored);
  const entries = mergeWithSeeds(dayKey, ensured);
  const demo =
    demoLeaderboardAllowed() && entries.some((e) => e.demo);
  return {
    dayKey,
    entries: sortEntries(entries).slice(0, MAX_ENTRIES),
    storage,
    demo,
  };
}

export async function submitScore(
  entry: Omit<LeaderboardEntry, "at" | "dayKey" | "demo"> & {
    dayKey?: string;
    country?: string;
  }
): Promise<LeaderboardPayload> {
  const dayKey = entry.dayKey ?? laDayKey();
  const full: LeaderboardEntry = {
    nick: entry.nick,
    emoji: entry.emoji,
    score: entry.score,
    reps: entry.reps,
    dayKey,
    at: Date.now(),
    country: normalizeCountry(entry.country),
    demo: false,
  };

  const { entries: stored, storage } = await readRaw(dayKey);
  let base = stored.filter((e) =>
    demoLeaderboardAllowed() ? true : !e.demo
  );
  if (base.length === 0 && demoLeaderboardAllowed()) {
    base = demoEntriesForDay(dayKey);
  }

  const nickKey = full.nick.toLowerCase();
  // Drop prior same nick (including demo with same nick — real replaces)
  let entries = base.filter((e) => e.nick.toLowerCase() !== nickKey);
  entries.push(full);
  entries = mergeWithSeeds(dayKey, entries);
  entries = sortEntries(entries).slice(0, MAX_ENTRIES);
  // Persist real (+ demos only when allowed). Never write demos in prod.
  const toPersist = demoLeaderboardAllowed()
    ? entries
    : entries.filter((e) => !e.demo);
  await writeRaw(dayKey, toPersist, storage);
  const demo =
    demoLeaderboardAllowed() && entries.some((e) => e.demo);
  return { dayKey, entries, storage, demo };
}

/** Count real (non-demo) board entries for a day — for /api/stats. */
export async function countRealEntries(
  dayKey: string = laDayKey()
): Promise<{ count: number; storage: LeaderboardStorage }> {
  const { entries, storage } = await readRaw(dayKey);
  const count = entries.filter((e) => !e.demo).length;
  return { count, storage };
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
  if (!/^[\p{L}\p{N} _.\-']+$/u.test(trimmed)) return null;
  return trimmed;
}

export function sanitizeEmoji(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "🐦";
  const e = [...raw.trim()].slice(0, 4).join("");
  return e || "🐦";
}

export function clampScore(n: unknown): number | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  const v = Math.floor(n);
  if (v < 0 || v > 9999) return null;
  return v;
}

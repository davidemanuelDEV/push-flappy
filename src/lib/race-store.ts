/**
 * Race-scoped score boards.
 * Same persist backends as the daily board (Blob / KV / memory).
 * Latest score per nick. Cap unique nicks. No demo seeds.
 * Join POSTs score 0 / reps 0 so names land before the first wipeout.
 * A later 0/0 join must not wipe a score already on the board.
 */

import { normalizeCountry } from "./country";
import {
  blobConfigured,
  kvConfigured,
  kvRestConfig,
  persistKind,
  type LeaderboardStorage,
} from "./leaderboard-store";
import {
  RACE_NICK_CAP,
  mintRaceId,
  racePipeSeed,
  sanitizeRaceId,
  sanitizeRaceTitle,
} from "./race";

export type RaceEntry = {
  nick: string;
  emoji: string;
  score: number;
  reps: number;
  at: number;
  /** ISO 3166-1 alpha-2 */
  country: string;
};

export type RaceRecord = {
  id: string;
  seed: string;
  createdAt: number;
  entries: RaceEntry[];
  /** Optional workplace label. Missing on existing untitled races. */
  title?: string;
};

export type RacePayload = RaceRecord & {
  storage: LeaderboardStorage;
};

const KEY_PREFIX = "push-flappy:race:";
const BLOB_PREFIX = "push-flappy/race/";
const KV_TTL_SEC = 60 * 60 * 24 * 7;

type GlobalMem = {
  __pushFlappyRaces?: Map<string, RaceRecord>;
};

function memStore(): Map<string, RaceRecord> {
  const g = globalThis as unknown as GlobalMem;
  if (!g.__pushFlappyRaces) g.__pushFlappyRaces = new Map();
  return g.__pushFlappyRaces;
}

function blobPathname(id: string): string {
  return `${BLOB_PREFIX}${id}.json`;
}

function sortEntries(entries: RaceEntry[]): RaceEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.reps !== a.reps) return b.reps - a.reps;
    return a.at - b.at;
  });
}

function normalizeEntry(e: RaceEntry): RaceEntry {
  return {
    nick: e.nick,
    emoji: e.emoji,
    score: e.score,
    reps: e.reps,
    at: e.at,
    country: normalizeCountry(e.country),
  };
}

function emptyRace(id: string, title?: string): RaceRecord {
  return {
    id,
    seed: racePipeSeed(id),
    createdAt: Date.now(),
    entries: [],
    ...(title ? { title } : {}),
  };
}

async function parseRecord(raw: string, fallbackId: string): Promise<RaceRecord | null> {
  try {
    const parsed = JSON.parse(raw) as Partial<RaceRecord>;
    const id = sanitizeRaceId(parsed.id) ?? fallbackId;
    if (!id) return null;
    const entries = Array.isArray(parsed.entries)
      ? parsed.entries.map((e) => normalizeEntry(e as RaceEntry))
      : [];
    const title = sanitizeRaceTitle(parsed.title);
    return {
      id,
      seed:
        typeof parsed.seed === "string" && parsed.seed
          ? parsed.seed
          : racePipeSeed(id),
      createdAt:
        typeof parsed.createdAt === "number" && Number.isFinite(parsed.createdAt)
          ? parsed.createdAt
          : Date.now(),
      entries: sortEntries(entries).slice(0, RACE_NICK_CAP),
      ...(title ? { title } : {}),
    };
  } catch {
    return null;
  }
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
    console.error("KV race command failed", res.status, await res.text());
    return null;
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}

async function readBlob(id: string): Promise<RaceRecord | null> {
  const { get } = await import("@vercel/blob");
  try {
    const result = await get(blobPathname(id), { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    return parseRecord(text, id);
  } catch (e) {
    console.error("Blob race read failed", e instanceof Error ? e.name : "");
    return null;
  }
}

async function writeBlob(record: RaceRecord): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(blobPathname(record.id), JSON.stringify(record), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

async function readRaw(id: string): Promise<{
  record: RaceRecord | null;
  storage: LeaderboardStorage;
}> {
  const key = KEY_PREFIX + id;
  const storage = persistKind();
  if (storage === "blob") {
    return { record: await readBlob(id), storage };
  }
  if (storage === "kv") {
    const raw = await kvCommand<string | null>("GET", key);
    const record = raw ? await parseRecord(raw, id) : null;
    return { record, storage };
  }
  return { record: memStore().get(key) ?? null, storage: "memory" };
}

async function writeRaw(
  record: RaceRecord,
  storage: LeaderboardStorage
): Promise<void> {
  const payload: RaceRecord = {
    ...record,
    entries: sortEntries(record.entries).slice(0, RACE_NICK_CAP),
  };
  const key = KEY_PREFIX + payload.id;
  if (storage === "blob" && blobConfigured()) {
    await writeBlob(payload);
    return;
  }
  if (storage === "kv" && kvConfigured()) {
    await kvCommand("SET", key, JSON.stringify(payload));
    await kvCommand("EXPIRE", key, KV_TTL_SEC);
    return;
  }
  memStore().set(key, payload);
}

export async function getRace(id: string): Promise<RacePayload | null> {
  const clean = sanitizeRaceId(id);
  if (!clean) return null;
  const { record, storage } = await readRaw(clean);
  if (!record) return null;
  return { ...record, storage };
}

export async function createRace(
  preferredId?: string,
  title?: string
): Promise<RacePayload> {
  const storage = persistKind();
  const cleanTitle = sanitizeRaceTitle(title);
  if (preferredId) {
    const existing = await getRace(preferredId);
    if (existing) return existing;
    const record = emptyRace(preferredId, cleanTitle);
    await writeRaw(record, storage);
    return { ...record, storage };
  }

  for (let i = 0; i < 6; i++) {
    const id = mintRaceId();
    const existing = await getRace(id);
    if (existing) continue;
    const record = emptyRace(id, cleanTitle);
    await writeRaw(record, storage);
    return { ...record, storage };
  }

  const fallbackId =
    sanitizeRaceId(Date.now().toString(36).slice(-8)) ?? mintRaceId();
  const record = emptyRace(fallbackId, cleanTitle);
  await writeRaw(record, storage);
  return { ...record, storage };
}

export async function ensureRace(id: string): Promise<RacePayload | null> {
  const clean = sanitizeRaceId(id);
  if (!clean) return null;
  const existing = await getRace(clean);
  if (existing) return existing;
  return createRace(clean);
}

export class RaceFullError extends Error {
  constructor() {
    super(`Race is full (${RACE_NICK_CAP} nicks)`);
    this.name = "RaceFullError";
  }
}

export async function submitRaceScore(
  id: string,
  entry: Omit<RaceEntry, "at"> & { country?: string }
): Promise<RacePayload> {
  const race = await ensureRace(id);
  if (!race) {
    throw new Error("Invalid race");
  }
  const full: RaceEntry = {
    nick: entry.nick,
    emoji: entry.emoji,
    score: entry.score,
    reps: entry.reps,
    at: Date.now(),
    country: normalizeCountry(entry.country),
  };
  const nickKey = full.nick.toLowerCase();
  const existing = race.entries.find((e) => e.nick.toLowerCase() === nickKey);
  const others = race.entries.filter((e) => e.nick.toLowerCase() !== nickKey);
  if (others.length >= RACE_NICK_CAP) {
    throw new RaceFullError();
  }
  // Same nick = same person (update, don't add a row). A join at 0/0
  // must not clobber a wipeout already posted for that nick.
  if (
    existing &&
    full.score === 0 &&
    full.reps === 0 &&
    (existing.score > 0 || existing.reps > 0)
  ) {
    full.score = existing.score;
    full.reps = existing.reps;
    full.at = existing.at;
  }
  const entries = sortEntries([...others, full]).slice(0, RACE_NICK_CAP);
  const next: RaceRecord = {
    id: race.id,
    seed: race.seed,
    createdAt: race.createdAt,
    entries,
    ...(race.title ? { title: race.title } : {}),
  };
  await writeRaw(next, race.storage);
  return { ...next, storage: race.storage };
}

/** Put a nick on the board at 0/0 so the live top-10 has names before play. */
export async function joinRace(
  id: string,
  entry: { nick: string; emoji: string; country?: string }
): Promise<RacePayload> {
  return submitRaceScore(id, {
    nick: entry.nick,
    emoji: entry.emoji,
    score: 0,
    reps: 0,
    country: entry.country ?? "",
  });
}

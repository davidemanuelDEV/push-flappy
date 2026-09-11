/**
 * Challenge reminder email capture.
 * Prefer Vercel KV / Upstash REST when env is set; otherwise in-memory
 * (lost on cold starts / multi-instance — set KV for durability).
 * Does not send mail unless RESEND_API_KEY is present (optional welcome).
 */

import { laDayKey } from "./daily";
import { allowRequest } from "./leaderboard-store";

export type ReminderSource = "gameover" | "board" | "landing";

export type ReminderRecord = {
  email: string;
  createdAt: number;
  dayKey: string;
  timezone: string;
  source: ReminderSource;
};

export type ReminderResult = {
  ok: true;
  deduped: boolean;
  storage: "kv" | "memory";
  welcomeSent: boolean;
};

const KEY_SET = "push-flappy:reminders:emails";
const KEY_PREFIX = "push-flappy:reminder:";
const DEFAULT_TZ = "America/Los_Angeles";

type GlobalMem = {
  __pushFlappyReminders?: Map<string, ReminderRecord>;
};

function memStore(): Map<string, ReminderRecord> {
  const g = globalThis as unknown as GlobalMem;
  if (!g.__pushFlappyReminders) g.__pushFlappyReminders = new Map();
  return g.__pushFlappyReminders;
}

export function kvConfigured(): boolean {
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
    console.error("KV reminder command failed", res.status);
    return null;
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}

/** Mask for safe logging — never print full address. */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const head = local.slice(0, Math.min(2, local.length));
  return `${head}***@${domain.length > 0 ? domain[0] : "*"}***`;
}

export function sanitizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase().slice(0, 254);
  // Practical RFC-ish check; reject obvious junk
  if (
    !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(
      email
    )
  ) {
    return null;
  }
  if (email.length < 5) return null;
  return email;
}

export function sanitizeSource(raw: unknown): ReminderSource {
  if (raw === "board" || raw === "landing" || raw === "gameover") return raw;
  return "gameover";
}

export function sanitizeTimezone(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_TZ;
  const tz = raw.trim().slice(0, 64);
  // Allow IANA-ish names; fall back to LA
  if (!/^[A-Za-z_]+\/[A-Za-z0-9_+\-]+(?:\/[A-Za-z0-9_+\-]+)?$/.test(tz)) {
    return DEFAULT_TZ;
  }
  try {
    // Throws RangeError for unknown zones in modern Node
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return DEFAULT_TZ;
  }
}

async function readExisting(email: string): Promise<{
  record: ReminderRecord | null;
  storage: "kv" | "memory";
}> {
  if (kvConfigured()) {
    const raw = await kvCommand<string | null>("GET", KEY_PREFIX + email);
    if (!raw) return { record: null, storage: "kv" };
    try {
      return { record: JSON.parse(raw) as ReminderRecord, storage: "kv" };
    } catch {
      return { record: null, storage: "kv" };
    }
  }
  return { record: memStore().get(email) ?? null, storage: "memory" };
}

async function writeRecord(
  record: ReminderRecord,
  storage: "kv" | "memory"
): Promise<void> {
  if (storage === "kv" && kvConfigured()) {
    await kvCommand("SET", KEY_PREFIX + record.email, JSON.stringify(record));
    await kvCommand("SADD", KEY_SET, record.email);
    // Soft retention ~1 year; cron can prune later
    await kvCommand("EXPIRE", KEY_PREFIX + record.email, 60 * 60 * 24 * 400);
    return;
  }
  memStore().set(record.email, record);
}

async function maybeSendWelcome(email: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from =
    process.env.RESEND_FROM?.trim() || "Push Flappy <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "You’re on the Push Flappy list",
        text: "You’re on the list. We’ll nudge you on push day — beat today’s board at https://pushflappy.com/board",
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Resend welcome failed", res.status);
      return false;
    }
    return true;
  } catch {
    console.error("Resend welcome error");
    return false;
  }
}

/** Reminder opt-in count (no PII) — for /api/stats. */
export async function countReminders(): Promise<{
  count: number;
  storage: "kv" | "memory";
}> {
  if (kvConfigured()) {
    const n = await kvCommand<number>("SCARD", KEY_SET);
    return { count: typeof n === "number" && Number.isFinite(n) ? n : 0, storage: "kv" };
  }
  return { count: memStore().size, storage: "memory" };
}

/**
 * Upsert reminder by email. Dedupes: existing email returns ok + deduped.
 * Rate-limit is caller's responsibility (by IP).
 */
export async function upsertReminder(input: {
  email: string;
  source: ReminderSource;
  timezone?: string;
  dayKey?: string;
}): Promise<ReminderResult> {
  const email = input.email;
  const timezone = sanitizeTimezone(input.timezone);
  const dayKey =
    input.dayKey && /^\d{4}-\d{2}-\d{2}$/.test(input.dayKey)
      ? input.dayKey
      : laDayKey();
  const source = input.source;

  const { record: existing, storage } = await readExisting(email);
  if (existing) {
    // Refresh source/day hint lightly without rewriting createdAt
    const updated: ReminderRecord = {
      ...existing,
      source,
      dayKey,
      timezone: existing.timezone || timezone,
    };
    await writeRecord(updated, storage);
    return { ok: true, deduped: true, storage, welcomeSent: false };
  }

  const record: ReminderRecord = {
    email,
    createdAt: Date.now(),
    dayKey,
    timezone,
    source,
  };
  await writeRecord(record, storage);

  if (process.env.NODE_ENV !== "production") {
    console.info("reminder captured", maskEmail(email), source, storage);
  }

  const welcomeSent = await maybeSendWelcome(email);
  return { ok: true, deduped: false, storage, welcomeSent };
}

/** Re-export for API route convenience */
export { allowRequest };

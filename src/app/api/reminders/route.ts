import { NextRequest, NextResponse } from "next/server";
import { laDayKey } from "@/lib/daily";
import {
  allowRequest,
  sanitizeEmail,
  sanitizeSource,
  sanitizeTimezone,
  upsertReminder,
} from "@/lib/reminders-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientId(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function POST(req: NextRequest) {
  const id = clientId(req);
  // Tight limit — capture only, abuse surface is spam
  if (!allowRequest(`reminder:${id}`, 8, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const email = sanitizeEmail(b.email);
  if (!email) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const source = sanitizeSource(b.source);
  const timezone = sanitizeTimezone(b.timezone);
  const dayKey =
    typeof b.dayKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.dayKey)
      ? b.dayKey
      : laDayKey();

  const result = await upsertReminder({
    email,
    source,
    timezone,
    dayKey,
  });

  return NextResponse.json({
    ok: true,
    deduped: result.deduped,
    storage: result.storage,
    welcomeSent: result.welcomeSent,
    message: "You're on the list",
  });
}

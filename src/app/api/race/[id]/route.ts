import { NextRequest, NextResponse } from "next/server";
import { detectCountryFromHeaders } from "@/lib/country";
import {
  allowRequest,
  clampScore,
  sanitizeEmoji,
  sanitizeNick,
} from "@/lib/leaderboard-store";
import { raceUrl, sanitizeRaceId } from "@/lib/race";
import {
  RaceFullError,
  ensureRace,
  getRace,
  submitRaceScore,
} from "@/lib/race-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientId(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const ip = clientId(req);
  if (!allowRequest(`race-get:${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { id: raw } = await ctx.params;
  const id = sanitizeRaceId(raw);
  if (!id) {
    return NextResponse.json({ error: "Invalid race" }, { status: 400 });
  }
  const ensure = req.nextUrl.searchParams.get("ensure") === "1";
  const race = ensure ? await ensureRace(id) : await getRace(id);
  if (!race) {
    return NextResponse.json({ error: "Race not found" }, { status: 404 });
  }
  return NextResponse.json(
    { ...race, url: raceUrl(race.id) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const ip = clientId(req);
  if (!allowRequest(`race-post:${ip}`, 12, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { id: raw } = await ctx.params;
  const id = sanitizeRaceId(raw);
  if (!id) {
    return NextResponse.json({ error: "Invalid race" }, { status: 400 });
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
  const nick = sanitizeNick(b.nick);
  if (!nick) {
    return NextResponse.json(
      { error: "Nick must be 2–16 letters/numbers" },
      { status: 400 }
    );
  }
  const score = clampScore(b.score);
  if (score == null) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }
  const reps = clampScore(b.reps) ?? 0;
  const emoji = sanitizeEmoji(b.emoji);
  const country = detectCountryFromHeaders(req.headers);

  try {
    const race = await submitRaceScore(id, {
      nick,
      emoji,
      score,
      reps,
      country,
    });
    return NextResponse.json({ ...race, url: raceUrl(race.id) });
  } catch (e) {
    if (e instanceof RaceFullError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    console.error("Race score failed", e instanceof Error ? e.name : "");
    return NextResponse.json({ error: "Submit failed" }, { status: 500 });
  }
}

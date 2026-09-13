import { NextRequest, NextResponse } from "next/server";
import { raceUrl, sanitizeRaceId, sanitizeRaceTitle } from "@/lib/race";
import { createRace } from "@/lib/race-store";
import { allowRequest } from "@/lib/leaderboard-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientId(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

/** Mint a race (optional preferred id). Create-on-first-share. */
export async function POST(req: NextRequest) {
  const id = clientId(req);
  if (!allowRequest(`race-create:${id}`, 12, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let preferred: string | undefined;
  let title: string | undefined;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const clean = sanitizeRaceId(body?.id);
    if (clean) preferred = clean;
    const rawTitle = typeof body?.title === "string" ? body.title : "";
    if (rawTitle.trim()) {
      title = sanitizeRaceTitle(rawTitle);
      if (!title) {
        return NextResponse.json(
          {
            error:
              "Title must be 2–32 letters, numbers, spaces, or basic punctuation",
          },
          { status: 400 }
        );
      }
    }
  } catch {
    /* empty body is fine — mint a new id */
  }

  const race = await createRace(preferred, title);
  return NextResponse.json(
    { ...race, url: raceUrl(race.id) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

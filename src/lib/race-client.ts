/**
 * Browser helpers for race join / board fetch.
 * Keep fetch out of the seed/id module so race.ts stays server-safe.
 */

import { raceJoinPayload } from "./race";
import type { RacePayload } from "./race-store";

async function readRaceResponse(res: Response): Promise<RacePayload> {
  const data = (await res.json()) as RacePayload & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Race request failed (${res.status})`);
  }
  return data;
}

export async function fetchRace(raceId: string): Promise<RacePayload> {
  const res = await fetch(`/api/race/${encodeURIComponent(raceId)}`, {
    cache: "no-store",
  });
  return readRaceResponse(res);
}

export async function postRaceJoin(
  raceId: string,
  nick: string,
  emoji: string
): Promise<RacePayload> {
  const res = await fetch(`/api/race/${encodeURIComponent(raceId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(raceJoinPayload(nick, emoji)),
  });
  return readRaceResponse(res);
}

export async function postRaceScore(
  raceId: string,
  nick: string,
  emoji: string,
  score: number,
  reps: number
): Promise<RacePayload> {
  const res = await fetch(`/api/race/${encodeURIComponent(raceId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nick, emoji, score, reps }),
  });
  return readRaceResponse(res);
}

/**
 * Browser helpers for race join / board fetch.
 * Keep fetch out of the seed/id module so race.ts stays server-safe.
 */

import { raceJoinPayload } from "./race";
import type { RacePayload } from "./race-store";

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
  const data = (await res.json()) as RacePayload & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Join failed (${res.status})`);
  }
  return data;
}

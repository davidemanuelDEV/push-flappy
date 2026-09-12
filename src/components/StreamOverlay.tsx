"use client";

import { useCallback, useEffect, useState } from "react";
import { laDayKey } from "@/lib/daily";
import type { LeaderboardEntry } from "@/lib/leaderboard-store";
import { RACE_NICK_CAP } from "@/lib/race";

const POLL_MS = 8_000;
const DAILY_MAX_ROWS = 8;

type OverlayRow = Pick<LeaderboardEntry, "nick" | "emoji" | "score" | "at" | "country">;

/**
 * Read-only board for a second OBS Browser Source.
 * Daily: polls GET /api/leaderboard. Race: polls GET /api/race/[id].
 * No camera, no forms.
 */
export default function StreamOverlay({ raceId }: { raceId?: string }) {
  const [dayKey, setDayKey] = useState(laDayKey());
  const [entries, setEntries] = useState<OverlayRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      if (raceId) {
        const res = await fetch(`/api/race/${encodeURIComponent(raceId)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Board error ${res.status}`);
        const data = (await res.json()) as { entries?: OverlayRow[] };
        setEntries(data.entries ?? []);
        setError(null);
      } else {
        const day = laDayKey();
        const res = await fetch(`/api/leaderboard?day=${encodeURIComponent(day)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Board error ${res.status}`);
        const data = (await res.json()) as {
          dayKey: string;
          entries: OverlayRow[];
        };
        setDayKey(data.dayKey ?? day);
        setEntries(data.entries ?? []);
        setError(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Board unavailable");
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  useEffect(() => {
    document.documentElement.classList.add("overlay-lock");
    document.body.classList.add("overlay-lock");
    return () => {
      document.documentElement.classList.remove("overlay-lock");
      document.body.classList.remove("overlay-lock");
    };
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const maxRows = raceId ? RACE_NICK_CAP : DAILY_MAX_ROWS;
  const rows = entries.slice(0, maxRows);

  return (
    <main className="flex min-h-[100dvh] w-full flex-col justify-center px-5 py-6 text-white">
      <p className="text-[clamp(0.7rem,1.6vw,0.95rem)] font-bold uppercase tracking-[0.22em] text-amber-400/90">
        {raceId ? `Race · ${raceId}` : `Daily board · ${dayKey}`}
      </p>
      <h1 className="font-display mt-1 text-[clamp(1.6rem,4vw,2.6rem)] font-bold tracking-tight text-amber-50">
        Push Flappy
      </h1>

      {loading && rows.length === 0 && (
        <p className="mt-6 text-lg text-stone-400">Loading board…</p>
      )}
      {error && rows.length === 0 && (
        <p className="mt-6 text-lg text-rose-300">{error}</p>
      )}
      {!loading && !error && rows.length === 0 && (
        <p className="mt-6 text-xl font-semibold text-stone-300">
          {raceId ? "Waiting for names" : "Board is empty today"}
        </p>
      )}

      <ol className="mt-5 space-y-2.5">
        {rows.map((e, i) => (
          <li
            key={`${e.nick}-${e.at}-${e.country ?? "XX"}`}
            className="flex items-center gap-3 rounded-2xl bg-black/55 px-3 py-2.5 ring-1 ring-amber-900/40"
          >
            <span className="w-[2.4ch] shrink-0 text-right font-black tabular-nums text-[clamp(1.6rem,4.2vw,2.75rem)] leading-none text-amber-200">
              {i + 1}
            </span>
            <span
              className="shrink-0 text-[clamp(1.4rem,3.4vw,2.1rem)] leading-none"
              aria-hidden
            >
              {e.emoji || "🐦"}
            </span>
            <span className="min-w-0 flex-1 truncate font-bold text-[clamp(1.15rem,3vw,2rem)] leading-tight">
              {e.nick}
            </span>
            <span className="shrink-0 font-black tabular-nums text-[clamp(1.7rem,4.4vw,2.9rem)] leading-none text-amber-50">
              {e.score}
            </span>
          </li>
        ))}
      </ol>
    </main>
  );
}

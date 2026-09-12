"use client";

import { RACE_NICK_CAP, type RaceBoardRow } from "@/lib/race";

/**
 * Compact in-play top-10. Names from join, scores tick during the run.
 * No camera chrome — pointer-events none so it never steals taps.
 */
export default function RaceLiveBoard({
  entries,
  youNick,
  compact = true,
}: {
  entries: RaceBoardRow[];
  youNick?: string | null;
  compact?: boolean;
}) {
  const rows = entries.slice(0, RACE_NICK_CAP);
  const youKey = youNick?.trim().toLowerCase() ?? "";

  return (
    <aside
      aria-label="Live race board"
      className={`pointer-events-none w-[11.5rem] rounded-xl border border-amber-900/45 bg-stone-950/78 shadow-lg backdrop-blur-md ${
        compact ? "px-2 py-1.5" : "px-3 py-2"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400/90">
        Race · top {RACE_NICK_CAP}
      </p>
      {rows.length === 0 ? (
        <p className="mt-1 text-[11px] leading-snug text-stone-400">
          Waiting for names…
        </p>
      ) : (
        <ol className="mt-1 space-y-0.5">
          {rows.map((e, i) => {
            const mine = youKey !== "" && e.nick.toLowerCase() === youKey;
            return (
              <li
                key={`${e.nick}-${i}`}
                className={`flex items-center gap-1 rounded-md px-1 py-0.5 ${
                  mine
                    ? "bg-amber-400/35 ring-1 ring-amber-200/70"
                    : ""
                }`}
              >
                <span className="w-3.5 shrink-0 text-[10px] font-bold tabular-nums text-zinc-500">
                  {i + 1}
                </span>
                <span className="shrink-0 text-xs leading-none" aria-hidden>
                  {e.emoji || "🐦"}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-[11px] font-semibold leading-tight ${
                    mine ? "text-amber-50" : "text-stone-100"
                  }`}
                >
                  {e.nick}
                </span>
                <span className="w-6 shrink-0 text-right text-[11px] font-bold tabular-nums text-amber-50">
                  {e.score}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}

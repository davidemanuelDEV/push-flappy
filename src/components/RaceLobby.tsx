"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { sanitizeNick } from "@/lib/leaderboard-store";
import { RACE_NICK_CAP, raceOverlayPath, racePlayPath, raceUrl } from "@/lib/race";
import { postRaceJoin } from "@/lib/race-client";
import type { RaceEntry, RacePayload } from "@/lib/race-store";
import { copyToClipboard } from "@/lib/share";

const POLL_MS = 5_000;
const NICK_KEY = "push-flappy-nick";
const EMOJI_KEY = "push-flappy-emoji";

/**
 * Dare-first race page: required nick lands on the live top-10 at 0,
 * then Play. Camera is not required to spectate.
 */
export default function RaceLobby({ raceId }: { raceId: string }) {
  const router = useRouter();
  const [race, setRace] = useState<RacePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nick, setNick] = useState("");
  const [emoji, setEmoji] = useState("🐦");
  const [joinedNick, setJoinedNick] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      const n = localStorage.getItem(NICK_KEY);
      const e = localStorage.getItem(EMOJI_KEY);
      if (n) setNick(n);
      if (e) setEmoji(e);
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/race/${encodeURIComponent(raceId)}?ensure=1`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`Race error ${res.status}`);
      const data = (await res.json()) as RacePayload;
      setRace((prev) => {
        if (prev && prev.entries.length > data.entries.length) {
          return { ...data, entries: prev.entries };
        }
        return data;
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load race");
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const persistNick = (clean: string, face: string) => {
    try {
      localStorage.setItem(NICK_KEY, clean);
      localStorage.setItem(EMOJI_KEY, face);
    } catch {
      /* ignore */
    }
  };

  const joinBoard = useCallback(
    async (clean: string) => {
      const face = emoji.trim() || "🐦";
      const data = await postRaceJoin(raceId, clean, face);
      persistNick(clean, face);
      setRace(data);
      setJoinedNick(clean);
      setJoinError(null);
      track("race_join", { race: raceId });
      return data;
    },
    [emoji, raceId]
  );

  const cleanNick = sanitizeNick(nick);
  const joined = Boolean(cleanNick && joinedNick === cleanNick);
  const canPlay = joined && !joining;

  // A saved nick from a prior visit lands on the board as soon as the lobby opens.
  useEffect(() => {
    let stored: string | null = null;
    let face = "🐦";
    try {
      stored = localStorage.getItem(NICK_KEY);
      face = localStorage.getItem(EMOJI_KEY) || "🐦";
    } catch {
      /* ignore */
    }
    const clean = sanitizeNick(stored);
    if (!clean) return;
    let cancelled = false;
    setJoining(true);
    void postRaceJoin(raceId, clean, face)
      .then((data) => {
        if (cancelled) return;
        persistNick(clean, face);
        setRace(data);
        setJoinedNick(clean);
        setJoinError(null);
        track("race_join", { race: raceId });
      })
      .catch((e) => {
        if (!cancelled) {
          setJoinError(e instanceof Error ? e.message : "Could not join");
        }
      })
      .finally(() => {
        if (!cancelled) setJoining(false);
      });
    return () => {
      cancelled = true;
    };
  }, [raceId]);

  const runJoin = async (clean: string) => {
    setJoining(true);
    setJoinError(null);
    try {
      await joinBoard(clean);
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : "Could not join");
      throw e;
    } finally {
      setJoining(false);
    }
  };

  const onNickBlur = () => {
    if (!cleanNick || joined || joining) return;
    void runJoin(cleanNick).catch(() => {
      /* joinError set */
    });
  };

  const onCopy = async () => {
    const url = raceUrl(raceId);
    const result = await copyToClipboard(url);
    setShareStatus(result === "copied" ? "Link copied" : "Copy the link shown");
    track("race_share", { race: raceId, channel: "copy" });
  };

  const onPlay = async () => {
    if (!cleanNick || joining) return;
    try {
      if (!joined) await runJoin(cleanNick);
      persistNick(cleanNick, emoji.trim() || "🐦");
      router.push(racePlayPath(raceId));
    } catch {
      /* stay — joinError is visible */
    }
  };

  const entries = (race?.entries ?? []).slice(0, RACE_NICK_CAP);
  const nickHint = !nick.trim()
    ? "Type a nick (2–16 letters or numbers) to join the board."
    : !cleanNick
      ? "Nick must be 2–16 letters/numbers."
      : joining && !joined
        ? "Putting your name on the board…"
        : joined
          ? "You’re on the live top-10. Play when ready."
          : null;

  return (
    <main className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-600/20 blur-3xl"
      />
      <header className="relative flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full bg-black/55 px-3 py-2 text-sm backdrop-blur-md"
        >
          ← Home
        </Link>
        <p className="font-display text-sm font-bold text-amber-100">Push Flappy</p>
        <Link
          href="/board"
          className="inline-flex min-h-11 items-center rounded-full bg-black/55 px-3 py-2 text-sm backdrop-blur-md"
        >
          Daily
        </Link>
      </header>

      <section className="relative mt-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400/95">
          Race · same pipes
        </p>
        <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-amber-50">
          {raceId.toUpperCase()}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-400">
          Put a nick on the live top-10 before anyone flies. Spectators stay
          here — no camera needed.
        </p>
      </section>

      <section className="relative mt-5 space-y-2 rounded-2xl border border-amber-900/40 bg-stone-950/80 p-4">
        <div className="flex gap-2">
          <input
            aria-label="Emoji"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-14 rounded-xl border border-amber-900/50 bg-stone-950 px-2 py-2 text-center text-lg"
            maxLength={4}
          />
          <input
            aria-label="Nick"
            value={nick}
            onChange={(e) => {
              setNick(e.target.value);
              setJoinError(null);
            }}
            onBlur={onNickBlur}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || !cleanNick || joining) return;
              e.preventDefault();
              void runJoin(cleanNick).catch(() => {
                /* joinError set */
              });
            }}
            placeholder="Your nick"
            className="min-w-0 flex-1 rounded-xl border border-amber-900/50 bg-stone-950 px-3 py-2 text-sm"
            maxLength={16}
            autoComplete="nickname"
          />
        </div>
        <button
          type="button"
          onClick={() => void onPlay()}
          disabled={!canPlay}
          className="flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-base font-bold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {joining ? "Joining…" : "Play this race"}
        </button>
        {nickHint && (
          <p className="text-center text-xs text-stone-400">{nickHint}</p>
        )}
        {joinError && (
          <p className="text-center text-xs text-rose-300">{joinError}</p>
        )}
        <button
          type="button"
          onClick={() => void onCopy()}
          className="flex min-h-11 w-full items-center justify-center rounded-xl border border-amber-200/35 bg-transparent px-4 py-3 font-semibold text-amber-100"
        >
          Copy race link
        </button>
        {shareStatus && (
          <p className="text-center text-xs text-emerald-400">{shareStatus}</p>
        )}
      </section>

      <section className="relative mt-5 min-h-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold text-amber-50">Live top-10</h2>
          <p className="text-[11px] text-zinc-500">
            {race?.storage && race.storage !== "memory" ? "live" : "polls ~5s"}
            {entries.length > 0 ? ` · ${entries.length}/${RACE_NICK_CAP}` : ""}
          </p>
        </div>
        {loading && entries.length === 0 && (
          <p className="mt-4 text-sm text-zinc-400">Loading board…</p>
        )}
        {error && entries.length === 0 && (
          <p className="mt-4 text-sm text-rose-300">{error}</p>
        )}
        {!loading && !error && entries.length === 0 && (
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            No names yet. Type a nick to appear here at 0 — then play.
          </p>
        )}
        <ol className="mt-3 space-y-1.5">
          {entries.map((e, i) => (
            <RaceRow key={`${e.nick}-${e.at}`} entry={e} rank={i + 1} />
          ))}
        </ol>
      </section>

      <p className="relative mt-6 text-center text-[11px] text-zinc-500">
        <Link href={raceOverlayPath(raceId)} className="underline-offset-2 hover:underline">
          OBS overlay
        </Link>
      </p>
    </main>
  );
}

function RaceRow({ entry, rank }: { entry: RaceEntry; rank: number }) {
  return (
    <li className="flex items-center gap-2 rounded-xl bg-stone-900/80 px-3 py-2">
      <span className="w-6 text-xs font-bold text-zinc-500">{rank}</span>
      <span className="text-lg" aria-hidden>
        {entry.emoji || "🐦"}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
        {entry.nick}
      </span>
      <span className="w-10 shrink-0 text-right tabular-nums text-sm font-bold">
        {entry.score}
      </span>
      <span className="w-7 shrink-0 text-right text-[10px] text-zinc-500">
        {entry.reps}r
      </span>
    </li>
  );
}

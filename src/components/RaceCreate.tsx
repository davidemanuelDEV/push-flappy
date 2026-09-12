"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { copyToClipboard } from "@/lib/share";

/**
 * Mint a race id and copy the dare-first share URL.
 * No accounts, no lobby form.
 */
export default function RaceCreate() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const startRace = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/race", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { id?: string; url?: string; error?: string };
      if (!res.ok || !data.id) {
        throw new Error(data.error || `Could not start race (${res.status})`);
      }
      track("race_create", { race: data.id });
      if (data.url) {
        const copied = await copyToClipboard(data.url);
        setStatus(copied === "copied" ? "Link copied" : "Race ready");
        track("race_share", { race: data.id, channel: "copy" });
      }
      router.push(`/race/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start race");
      setBusy(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-600/25 blur-3xl"
      />
      <div className="relative flex flex-1 flex-col justify-center gap-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400/95">
          Same pipes · Live board
        </p>
        <h1 className="font-display text-5xl font-bold leading-none tracking-tight text-amber-50">
          Race friends
        </h1>
        <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-stone-400">
          One link. Everyone puts a nick on the live top-10 first, then plays
          the same pipe seed. Spectators watch without a camera.
        </p>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-stone-500">
          Async scores — not lockstep frames. Streamers can add{" "}
          <Link
            href="/streamers"
            className="font-semibold text-amber-200/80 underline-offset-2 hover:underline"
          >
            /race/{"{id}"}/overlay
          </Link>{" "}
          in OBS.
        </p>
        <button
          type="button"
          onClick={() => void startRace()}
          disabled={busy}
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-bold text-stone-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {busy ? "Minting link…" : "Start a race"}
        </button>
        {status && <p className="text-sm text-emerald-400">{status}</p>}
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <p className="text-xs text-stone-500">
          <Link href="/" className="underline-offset-2 hover:underline">
            Home
          </Link>
          {" · "}
          <Link href="/play" className="underline-offset-2 hover:underline">
            Play
          </Link>
          {" · "}
          <Link href="/board" className="underline-offset-2 hover:underline">
            Daily board
          </Link>
          {" · "}
          <Link href="/streamers" className="underline-offset-2 hover:underline">
            Streamers / OBS
          </Link>
        </p>
      </div>
    </main>
  );
}

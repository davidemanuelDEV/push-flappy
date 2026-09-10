"use client";

import type { CalibPhase } from "@/lib/pose";

type CoachMessage = {
  tone: "amber" | "emerald";
  title: string;
  detail: string;
} | null;

export function OrientationTip({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-x-0 top-[4.25rem] z-10 flex justify-center px-3 pointer-events-none sm:top-16">
      <p className="rounded-2xl bg-black/65 px-3 py-2 text-center text-[11px] leading-snug text-zinc-200 backdrop-blur-md max-w-[18rem] sm:max-w-sm sm:text-xs">
        Tip: phone on the floor, camera facing up. Portrait is fine —
        landscape optional.
      </p>
    </div>
  );
}

export function CoachBanner({
  coachMessage,
  calibPhase,
  holdProgress,
}: {
  coachMessage: CoachMessage;
  calibPhase: CalibPhase;
  holdProgress: number;
}) {
  if (!coachMessage) return null;
  return (
    <div className="absolute inset-x-0 bottom-[min(42%,14.5rem)] z-10 flex justify-center px-3 pointer-events-none sm:bottom-36">
      <div
        className={`w-full max-w-sm rounded-2xl px-3.5 py-2.5 text-center shadow-lg backdrop-blur-md ${
          coachMessage.tone === "emerald"
            ? "bg-emerald-500/95 text-zinc-950"
            : "bg-amber-400/95 text-zinc-950"
        }`}
      >
        <p className="text-sm font-bold leading-snug sm:text-[15px]">
          {coachMessage.title}
        </p>
        <p className="mt-0.5 text-[11px] font-medium leading-snug opacity-90 sm:text-xs">
          {coachMessage.detail}
        </p>
        {(calibPhase === "holding" ||
          (calibPhase === "waiting" && holdProgress > 0)) && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/20">
            <div
              className="h-full rounded-full bg-zinc-950/80 transition-[width] duration-100"
              style={{ width: `${Math.round(holdProgress * 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ReadyPanel({
  canStart,
  hasPose,
  calibSet,
  onStart,
}: {
  canStart: boolean;
  hasPose: boolean;
  calibSet: boolean;
  onStart: () => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm rounded-2xl bg-zinc-900/92 p-4 text-center shadow-xl backdrop-blur-md sm:p-5">
        <h2 className="text-lg font-bold sm:text-xl">Ready?</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-300 sm:text-sm">
          Hold a plank to set bird “up” near the top. Drop to dive through
          copper pipes — continuous body-Y, no flap.
        </p>
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-base font-bold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {canStart
            ? "Start"
            : !hasPose
              ? "Waiting for pose…"
              : calibSet
                ? "Start"
                : "Set start position…"}
        </button>
      </div>
    </div>
  );
}

export function GameOverPanel({
  score,
  highScore,
  reps,
  wipeoutLine,
  onRestart,
  onShare,
}: {
  score: number;
  highScore: number;
  reps: number;
  wipeoutLine: string | null;
  onRestart: () => void;
  onShare: () => void;
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/75 via-black/45 to-black/25 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:bg-black/55 sm:p-4">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900/95 p-5 text-center shadow-xl backdrop-blur-md sm:p-6">
        <p className="text-sm uppercase tracking-wide text-zinc-400">
          Game over
        </p>
        <p className="mt-1 text-5xl font-black tabular-nums">{score}</p>
        <p className="mt-2 text-sm text-zinc-300">
          Best {highScore} · Push-ups {reps}
        </p>
        {wipeoutLine && (
          <p className="mt-3 rounded-xl bg-zinc-800/80 px-3 py-2 text-sm font-medium leading-snug text-amber-200/95">
            {wipeoutLine}
          </p>
        )}
        <p className="mt-2 text-[11px] text-zinc-500 sm:text-xs">
          Play again re-sets your plank start position.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:mt-5">
          <button
            type="button"
            onClick={onRestart}
            className="flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 font-bold text-zinc-950"
          >
            Play again
          </button>
          <button
            type="button"
            onClick={onShare}
            className="flex min-h-11 w-full items-center justify-center rounded-xl bg-zinc-700 px-4 py-3 font-semibold"
          >
            Share score
          </button>
        </div>
      </div>
    </div>
  );
}

export type { CoachMessage };

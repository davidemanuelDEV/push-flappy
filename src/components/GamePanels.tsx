"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import ReminderCapture from "@/components/ReminderCapture";
import type { CalibPhase } from "@/lib/pose";
import type { LeaderboardEntry } from "@/lib/leaderboard-store";

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
  beatTarget,
  onStart,
}: {
  canStart: boolean;
  hasPose: boolean;
  calibSet: boolean;
  beatTarget?: number | null;
  onStart: () => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-amber-900/40 bg-stone-950/92 p-4 text-center shadow-xl backdrop-blur-md sm:p-5">
        <h2 className="text-lg font-bold sm:text-xl">Ready?</h2>
        {beatTarget != null && beatTarget >= 0 && (
          <p className="mt-1 rounded-xl bg-amber-500/15 px-3 py-1.5 text-sm font-semibold text-amber-200">
            Challenge: beat {beatTarget}
          </p>
        )}
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-300 sm:text-sm">
          Hold a plank to set bird “up” near the top. Drop to dive through
          copper pipes — continuous body-Y, no flap. Same daily pipe seed for
          everyone (PT).
        </p>
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-base font-bold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {canStart
            ? beatTarget != null
              ? "Start challenge"
              : "Start"
            : !hasPose
              ? "Waiting for pose…"
              : calibSet
                ? "Start"
                : "Set start position…"}
        </button>
        <p className="mt-2.5 text-[11px] text-zinc-500">
          <Link href="/" className="underline-offset-2 hover:underline">
            Home
          </Link>
          {" · "}
          <Link href="/faq" className="underline-offset-2 hover:underline">
            FAQ
          </Link>
          {" · "}
          <Link href="/board" className="underline-offset-2 hover:underline">
            Board
          </Link>
        </p>
      </div>
    </div>
  );
}

function ShareActionButton({
  label,
  onClick,
  title,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      aria-label={label}
      className={`flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold leading-none touch-manipulation ${className ?? ""}`}
    >
      <span className="text-base leading-none" aria-hidden>
        {children}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function GameOverPanel({
  score,
  highScore,
  reps,
  wipeoutLine,
  beatTarget,
  beatVictory,
  shareStatus,
  onRestart,
  onShareWhatsApp,
  onShareX,
  onCopyLink,
  onSaveCard,
  onShareMore,
  onOpenBoard,
}: {
  score: number;
  highScore: number;
  reps: number;
  wipeoutLine: string | null;
  beatTarget?: number | null;
  beatVictory?: boolean;
  shareStatus?: string | null;
  onRestart: () => void;
  onShareWhatsApp: () => void;
  onShareX: () => void;
  onCopyLink: () => void;
  onSaveCard: () => void;
  onShareMore: () => void;
  onOpenBoard: () => void;
}) {
  const shareHeading = beatVictory
    ? "Flex on them"
    : "Challenge a friend";

  return (
    <div className="absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/75 via-black/45 to-black/25 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:bg-black/55 sm:p-4">
      <div className="w-full max-w-sm rounded-2xl border border-amber-900/45 bg-stone-950/95 p-5 text-center shadow-xl backdrop-blur-md sm:p-6">
        <p className="text-sm uppercase tracking-wide text-amber-200/60">
          Game over
        </p>
        <p className="mt-1 text-5xl font-black tabular-nums">{score}</p>
        <p className="mt-2 text-sm text-zinc-300">
          Best {highScore} · Push-ups {reps}
        </p>
        {beatVictory && beatTarget != null && (
          <p className="mt-2 rounded-xl bg-emerald-500/20 px-3 py-2 text-sm font-bold text-emerald-300">
            You beat {beatTarget}! Flex on them.
          </p>
        )}
        {!beatVictory && beatTarget != null && (
          <p className="mt-2 text-xs text-amber-200/80">
            Challenge was {beatTarget} — so close (or not).
          </p>
        )}
        {wipeoutLine && (
          <p className="mt-3 rounded-xl bg-amber-950/50 px-3 py-2 text-sm font-medium leading-snug text-amber-200/95">
            {wipeoutLine}
          </p>
        )}
        {shareStatus && (
          <p className="mt-2 text-xs text-emerald-400">{shareStatus}</p>
        )}
        <p className="mt-2 text-[11px] text-zinc-500 sm:text-xs">
          Play again re-sets your plank start position.
        </p>
        <div className="mt-3">
          <ReminderCapture source="gameover" compact />
        </div>
        <div className="mt-4 sm:mt-5">
          <p className="mb-2 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            {shareHeading}
          </p>
          <div
            className="flex gap-1.5"
            role="group"
            aria-label={shareHeading}
          >
            <ShareActionButton
              label="WhatsApp"
              title="Share on WhatsApp"
              onClick={onShareWhatsApp}
              className="bg-[#25D366]/text-zinc-950"
            >
              WA
            </ShareActionButton>
            <ShareActionButton
              label="X"
              title="Share on X"
              onClick={onShareX}
              className="bg-zinc-100 text-zinc-950"
            >
              𝕏
            </ShareActionButton>
            <ShareActionButton
              label="Copy"
              title="Copy beat-me link"
              onClick={onCopyLink}
              className="bg-stone-700 text-white"
            >
              🔗
            </ShareActionButton>
            <ShareActionButton
              label="Save"
              title="Save share card PNG"
              onClick={onSaveCard}
              className="bg-amber-400 text-zinc-950"
            >
              🖼
            </ShareActionButton>
            <ShareActionButton
              label="More…"
              title="More share options"
              onClick={onShareMore}
              className="bg-stone-600 text-white"
            >
              ⋯
            </ShareActionButton>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onOpenBoard}
            className="flex min-h-11 w-full items-center justify-center rounded-xl bg-stone-700 px-4 py-3 font-semibold"
          >
            View daily board
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 font-bold text-zinc-950"
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}

export function LeaderboardPanel({
  open,
  dayKey,
  entries,
  storage,
  loading,
  error,
  nick,
  emoji,
  score,
  reps,
  submitting,
  submitMsg,
  onNick,
  onEmoji,
  onClose,
  onRefresh,
  onSubmit,
  variant = "overlay",
  allowSubmit = true,
  playHref = "/play",
}: {
  open: boolean;
  dayKey: string;
  entries: LeaderboardEntry[];
  storage: "kv" | "memory" | null;
  loading: boolean;
  error: string | null;
  nick: string;
  emoji: string;
  score: number;
  reps: number;
  submitting: boolean;
  submitMsg: string | null;
  onNick: (v: string) => void;
  onEmoji: (v: string) => void;
  onClose: () => void;
  onRefresh: () => void;
  onSubmit: () => void;
  /** overlay = in-game modal; page = dedicated /board (no camera). */
  variant?: "overlay" | "page";
  allowSubmit?: boolean;
  playHref?: string;
}) {
  if (!open) return null;

  const isPage = variant === "page";

  const panel = (
    <div
      className={
        isPage
          ? "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-amber-900/40 bg-stone-950 shadow-xl"
          : "flex max-h-[90dvh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-amber-900/35 bg-stone-950 shadow-xl"
      }
    >
      <div className="flex items-center justify-between border-b border-amber-950/80 px-4 py-3">
        <div>
          <p className="text-sm font-bold">Daily board</p>
          <p className="text-[11px] text-zinc-400">
            {dayKey} · PT seed ·{" "}
            {storage === "kv"
              ? "live"
              : storage === "memory"
                ? "memory (not durable)"
                : "…"}
          </p>
        </div>
        {isPage ? (
          <div className="flex items-center gap-2">
            <Link
              href="/faq"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-stone-800 px-3 text-xs font-semibold"
            >
              FAQ
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-stone-800 px-3 text-xs font-semibold"
            >
              Home
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full bg-stone-800 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {loading && (
          <p className="py-6 text-center text-sm text-zinc-400">Loading…</p>
        )}
        {error && (
          <p className="py-2 text-center text-sm text-rose-300">{error}</p>
        )}
        {!loading && !error && entries.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-base font-semibold text-zinc-200">
              Board is empty today
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
              No real scores yet — be the first to post a run.
            </p>
          </div>
        )}
        <ol className="space-y-1.5">
          {entries.map((e, i) => (
            <li
              key={`${e.nick}-${e.at}-${e.country ?? "XX"}`}
              className="flex items-center gap-2 rounded-xl bg-stone-900/80 px-3 py-2"
            >
              <span className="w-6 text-xs font-bold text-zinc-500">{i + 1}</span>
              <span className="text-lg" aria-hidden>
                {e.emoji || "🐦"}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {e.nick}
                {e.demo ? (
                  <span className="ml-1 text-[10px] font-medium text-zinc-500">
                    demo
                  </span>
                ) : null}
              </span>
              <span
                className="shrink-0 text-sm"
                title={normalizeIso(e.country)}
                aria-label={`Country ${normalizeIso(e.country)}`}
              >
                {countryFlagEmoji(e.country)}
              </span>
              <span className="w-7 shrink-0 text-right text-[10px] font-semibold text-zinc-500">
                {normalizeIso(e.country)}
              </span>
              <span className="w-8 shrink-0 text-right tabular-nums text-sm font-bold">
                {e.score}
              </span>
              <span className="w-7 shrink-0 text-right text-[10px] text-zinc-500">
                {e.reps}r
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-2 border-t border-amber-950/80 px-4 py-3">
        {isPage && (
          <ReminderCapture source="board" className="mb-1" />
        )}
        {allowSubmit ? (
          <>
            <p className="text-[11px] text-zinc-400">
              Post this run ({score} · {reps} reps) with an anonymous nick — no
              accounts. Country is detected from your connection.
            </p>
            <div className="flex gap-2">
              <input
                aria-label="Emoji"
                value={emoji}
                onChange={(e) => onEmoji(e.target.value)}
                className="w-14 rounded-xl border border-amber-900/50 bg-stone-950 px-2 py-2 text-center text-lg"
                maxLength={4}
              />
              <input
                aria-label="Nick"
                value={nick}
                onChange={(e) => onNick(e.target.value)}
                placeholder="Nick"
                className="min-w-0 flex-1 rounded-xl border border-amber-900/50 bg-stone-950 px-3 py-2 text-sm"
                maxLength={16}
              />
            </div>
            {submitMsg && (
              <p className="text-xs text-emerald-400">{submitMsg}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-emerald-500 px-3 font-bold text-zinc-950 disabled:opacity-50"
              >
                {submitting ? "Posting…" : "Post score"}
              </button>
              <button
                type="button"
                onClick={onRefresh}
                className="flex min-h-11 items-center justify-center rounded-xl bg-stone-700 px-3 text-sm font-semibold"
              >
                Refresh
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] text-zinc-400">
              Same pipe seed for everyone today (Pacific). Play a run, then post
              your score from the game — country is auto-detected.
            </p>
            <div className="flex gap-2">
              <Link
                href={playHref}
                className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-emerald-500 px-3 font-bold text-zinc-950"
              >
                Play to post
              </Link>
              <button
                type="button"
                onClick={onRefresh}
                className="flex min-h-11 items-center justify-center rounded-xl bg-stone-700 px-3 text-sm font-semibold"
              >
                Refresh
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (isPage) {
    return (
      <div className="relative flex min-h-[100dvh] w-full flex-col bg-[#120e0c] text-white">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col overflow-hidden px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
          {panel}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-black/70 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center">
      {panel}
    </div>
  );
}

function normalizeIso(raw: unknown): string {
  if (typeof raw !== "string" || raw.trim().length !== 2) return "XX";
  return raw.trim().toUpperCase();
}

function countryFlagEmoji(raw: unknown): string {
  const code = normalizeIso(raw);
  if (code === "XX") return "🌍";
  const A = 0x1f1e6;
  return [...code]
    .map((c) => String.fromCodePoint(A + (c.charCodeAt(0) - 65)))
    .join("");
}

export type { CoachMessage };

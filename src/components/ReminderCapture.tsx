"use client";

import { useCallback, useState, type FormEvent } from "react";
import { laDayKey } from "@/lib/daily";
import type { ReminderSource } from "@/lib/reminders-store";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Compact email opt-in for challenge / daily-board reminders.
 * No accounts. Does not block sibling CTAs.
 */
export default function ReminderCapture({
  source,
  compact = false,
  className = "",
}: {
  source: ReminderSource;
  /** Tighter padding for game-over panel */
  compact?: boolean;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (status === "loading" || status === "success") return;
      setError(null);
      setStatus("loading");
      try {
        const tz =
          typeof Intl !== "undefined"
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : "America/Los_Angeles";
        const res = await fetch("/api/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            source,
            timezone: tz,
            dayKey: laDayKey(),
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        if (!res.ok) {
          setStatus("error");
          setError(data.error || "Could not save — try again");
          return;
        }
        setStatus("success");
      } catch {
        setStatus("error");
        setError("Network error — try again");
      }
    },
    [email, source, status]
  );

  if (status === "success") {
    return (
      <div
        className={`rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-center ${className}`}
      >
        <p className="text-sm font-semibold text-emerald-300">
          You’re on the list
        </p>
        <p className="mt-0.5 text-[11px] text-emerald-200/70">
          We’ll nudge you to challenge again / beat today’s board.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`rounded-xl border border-amber-900/50 bg-stone-950/50 ${
        compact ? "px-3 py-2.5" : "px-3.5 py-3"
      } ${className}`}
    >
      <label
        htmlFor={`reminder-email-${source}`}
        className="block text-left text-[11px] font-semibold text-stone-300 sm:text-xs"
      >
        Get reminder to challenge again
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id={`reminder-email-${source}`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          disabled={status === "loading"}
          className="min-w-0 flex-1 rounded-lg border border-amber-900/50 bg-stone-950 px-2.5 py-2 text-sm text-stone-100 placeholder:text-stone-600 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="shrink-0 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-bold text-stone-950 disabled:opacity-40"
        >
          {status === "loading" ? "…" : "Submit"}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-left text-[11px] text-rose-300">{error}</p>
      )}
      {!compact && (
        <p className="mt-1.5 text-left text-[10px] leading-snug text-stone-500">
          No accounts. Challenge &amp; daily board nudges only.
        </p>
      )}
    </form>
  );
}

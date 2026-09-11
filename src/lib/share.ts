/**
 * Beat-me deep links + native share / clipboard fallback.
 */

export const SITE_ORIGIN = "https://pushflappy.com";

export type BeatChallenge = {
  score: number;
  reps?: number;
};

export function playUrl(opts?: {
  beat?: number;
  reps?: number;
  origin?: string;
}): string {
  const origin = opts?.origin ?? SITE_ORIGIN;
  const u = new URL("/play", origin);
  if (opts?.beat != null && opts.beat >= 0) {
    u.searchParams.set("beat", String(Math.floor(opts.beat)));
  }
  if (opts?.reps != null && opts.reps > 0) {
    u.searchParams.set("reps", String(Math.floor(opts.reps)));
  }
  return u.toString();
}

export function parseBeatFromSearch(
  search: string | URLSearchParams
): BeatChallenge | null {
  const params =
    typeof search === "string"
      ? new URLSearchParams(
          search.startsWith("?") ? search.slice(1) : search
        )
      : search;
  const raw = params.get("beat");
  if (raw == null || raw === "") return null;
  const score = Number.parseInt(raw, 10);
  if (!Number.isFinite(score) || score < 0) return null;
  const repsRaw = params.get("reps");
  const reps =
    repsRaw != null ? Number.parseInt(repsRaw, 10) : undefined;
  return {
    score,
    reps:
      reps != null && Number.isFinite(reps) && reps > 0
        ? reps
        : undefined,
  };
}

export function challengeShareText(opts: {
  score: number;
  reps?: number;
  wipeoutLine?: string | null;
  url: string;
}): string {
  const wipe =
    opts.wipeoutLine && opts.wipeoutLine.trim()
      ? ` ${opts.wipeoutLine.trim()}`
      : "";
  const repsBit =
    opts.reps && opts.reps > 0 ? ` · ${opts.reps} push-ups` : "";
  return `I scored ${opts.score}${repsBit} on Push Flappy.${wipe} Think you can beat me? ${opts.url}`;
}

export function beatThemShareText(opts: {
  yourScore: number;
  theirScore: number;
  reps?: number;
  url: string;
}): string {
  const repsBit =
    opts.reps && opts.reps > 0 ? ` · ${opts.reps} push-ups` : "";
  return `I beat your ${opts.theirScore} — scored ${opts.yourScore}${repsBit} on Push Flappy! 💪🐦 Your turn: ${opts.url}`;
}

export async function shareOrCopy(opts: {
  title?: string;
  text: string;
  url?: string;
  file?: File | null;
}): Promise<"shared" | "copied" | "prompted" | "cancelled"> {
  const { title = "Push Flappy", text, url, file } = opts;
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      const data: ShareData = { title, text };
      if (url) data.url = url;
      if (
        file &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        data.files = [file];
      }
      await navigator.share(data);
      return "shared";
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return "cancelled";
    }
    /* fall through */
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    if (typeof window !== "undefined") {
      window.prompt("Copy your challenge:", text);
    }
    return "prompted";
  }
}

/** Quick square share card (1080×1080) — optional Story-ish asset. */
export function renderShareCard(opts: {
  score: number;
  reps?: number;
  wipeoutLine?: string | null;
  beatTarget?: number | null;
  mode?: "challenge" | "victory";
}): HTMLCanvasElement {
  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, "#18181b");
  g.addColorStop(0.45, "#292524");
  g.addColorStop(1, "#422006");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // Soft copper glow
  const glow = ctx.createRadialGradient(540, 320, 40, 540, 320, 420);
  glow.addColorStop(0, "rgba(184,115,51,0.45)");
  glow.addColorStop(1, "rgba(184,115,51,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#f59e0b";
  ctx.font = "600 36px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PUSH FLAPPY", size / 2, 160);

  ctx.fillStyle = "#fff";
  ctx.font = "900 220px system-ui, sans-serif";
  ctx.fillText(String(opts.score), size / 2, 460);

  ctx.fillStyle = "#a1a1aa";
  ctx.font = "600 40px system-ui, sans-serif";
  const sub =
    opts.reps && opts.reps > 0
      ? `${opts.reps} push-ups`
      : "pipes cleared";
  ctx.fillText(sub, size / 2, 540);

  if (opts.mode === "victory" && opts.beatTarget != null) {
    ctx.fillStyle = "#34d399";
    ctx.font = "700 48px system-ui, sans-serif";
    ctx.fillText(`Beat ${opts.beatTarget} ✨`, size / 2, 640);
  } else if (opts.wipeoutLine) {
    ctx.fillStyle = "#fde68a";
    ctx.font = "500 36px system-ui, sans-serif";
    wrapText(ctx, opts.wipeoutLine, size / 2, 640, 860, 44);
  }

  ctx.fillStyle = "#e4e4e7";
  ctx.font = "600 42px system-ui, sans-serif";
  ctx.fillText(
    opts.mode === "victory"
      ? "Can you take it back?"
      : "Think you can beat me?",
    size / 2,
    820
  );

  ctx.fillStyle = "#a1a1aa";
  ctx.font = "500 32px system-ui, sans-serif";
  ctx.fillText("pushflappy.com", size / 2, 900);

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(/\s+/);
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

export async function shareCardFile(
  canvas: HTMLCanvasElement,
  filename = "push-flappy.png"
): Promise<File | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(new File([blob], filename, { type: "image/png" }));
      },
      "image/png",
      0.92
    );
  });
}

import { drawBirdAt } from "./draw";

/**
 * Beat-me deep links + platform share helpers (WhatsApp, X, copy, card, native).
 */

export const SITE_ORIGIN = "https://pushflappy.com";

export type BeatChallenge = {
  score: number;
  reps?: number;
};

export type SharePayload = {
  url: string;
  /** Full message including URL — WhatsApp, native, clipboard. */
  text: string;
  /** Punchy line without URL — X intent `text` param. */
  textNoUrl: string;
  mode: "challenge" | "victory";
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

function repsBit(reps?: number): string {
  return reps && reps > 0 ? ` · ${reps} push-ups` : "";
}

function wipeBit(wipeoutLine?: string | null): string {
  return wipeoutLine && wipeoutLine.trim()
    ? ` ${wipeoutLine.trim()}`
    : "";
}

/** Challenge copy — full message with URL (WhatsApp / native / copy). */
export function challengeShareText(opts: {
  score: number;
  reps?: number;
  wipeoutLine?: string | null;
  url: string;
}): string {
  return `Beat my ${opts.score}${repsBit(opts.reps)} on Push Flappy!${wipeBit(opts.wipeoutLine)} Think you can? ${opts.url}`;
}

/** Challenge line for X (URL passed separately via intent). */
export function challengeShareTextNoUrl(opts: {
  score: number;
  reps?: number;
  wipeoutLine?: string | null;
}): string {
  return `Beat my ${opts.score}${repsBit(opts.reps)} on Push Flappy!${wipeBit(opts.wipeoutLine)} Think you can?`;
}

/** Victory copy — flex on the challenger. */
export function beatThemShareText(opts: {
  yourScore: number;
  theirScore: number;
  reps?: number;
  url: string;
}): string {
  return `Just beat your ${opts.theirScore} — scored ${opts.yourScore}${repsBit(opts.reps)} on Push Flappy! 💪 Your move: ${opts.url}`;
}

export function beatThemShareTextNoUrl(opts: {
  yourScore: number;
  theirScore: number;
  reps?: number;
}): string {
  return `Just beat your ${opts.theirScore} — scored ${opts.yourScore}${repsBit(opts.reps)} on Push Flappy! 💪 Your move`;
}

export function buildSharePayload(opts: {
  mode: "challenge" | "victory";
  score: number;
  reps?: number;
  wipeoutLine?: string | null;
  beatTarget?: number | null;
  origin?: string;
}): SharePayload {
  const url = playUrl({
    beat: opts.score,
    reps: opts.reps,
    origin: opts.origin ?? SITE_ORIGIN,
  });
  if (opts.mode === "victory" && opts.beatTarget != null) {
    return {
      url,
      mode: "victory",
      text: beatThemShareText({
        yourScore: opts.score,
        theirScore: opts.beatTarget,
        reps: opts.reps,
        url,
      }),
      textNoUrl: beatThemShareTextNoUrl({
        yourScore: opts.score,
        theirScore: opts.beatTarget,
        reps: opts.reps,
      }),
    };
  }
  return {
    url,
    mode: "challenge",
    text: challengeShareText({
      score: opts.score,
      reps: opts.reps,
      wipeoutLine: opts.wipeoutLine,
      url,
    }),
    textNoUrl: challengeShareTextNoUrl({
      score: opts.score,
      reps: opts.reps,
      wipeoutLine: opts.wipeoutLine,
    }),
  };
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function xIntentUrl(opts: { text: string; url: string }): string {
  const u = new URL("https://twitter.com/intent/tweet");
  u.searchParams.set("text", opts.text);
  u.searchParams.set("url", opts.url);
  return u.toString();
}

export function openShareWindow(href: string): void {
  if (typeof window === "undefined") return;
  // Mobile: plain _blank works best for wa.me / intent URLs.
  // Desktop: sized popup for X intent when possible.
  const isNarrow = window.matchMedia("(max-width: 640px)").matches;
  if (isNarrow) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  const w = 560;
  const h = 640;
  const left = Math.max(
    0,
    Math.round(window.screenX + (window.outerWidth - w) / 2)
  );
  const top = Math.max(
    0,
    Math.round(window.screenY + (window.outerHeight - h) / 2)
  );
  const features = `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`;
  const popup = window.open(href, "_blank", features);
  if (!popup) {
    window.location.assign(href);
  }
}

export async function copyToClipboard(
  text: string
): Promise<"copied" | "prompted"> {
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
  return copyToClipboard(text);
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

  // Dusk gym gradient
  const g = ctx.createLinearGradient(0, 0, 0, size);
  g.addColorStop(0, "#0c122a");
  g.addColorStop(0.4, "#1c1624");
  g.addColorStop(0.75, "#3a2012");
  g.addColorStop(1, "#2a180a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // Soft copper glow behind bird
  const glow = ctx.createRadialGradient(540, 280, 40, 540, 280, 420);
  glow.addColorStop(0, "rgba(184,115,51,0.5)");
  glow.addColorStop(1, "rgba(184,115,51,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // Vignette
  const vig = ctx.createRadialGradient(540, 480, 120, 540, 540, 780);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(8,6,4,0.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, size, size);

  // Chunky title
  ctx.fillStyle = "#fbbf24";
  ctx.font = "900 44px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PUSH FLAPPY", size / 2, 120);

  // Bird
  drawBirdAt(ctx, size / 2, 250, 72, -0.08);

  ctx.fillStyle = "#fff8e7";
  ctx.font = "900 200px system-ui, sans-serif";
  ctx.fillText(String(opts.score), size / 2, 520);

  ctx.fillStyle = "#d6b896";
  ctx.font = "700 40px system-ui, sans-serif";
  const sub =
    opts.reps && opts.reps > 0
      ? `${opts.reps} push-ups`
      : "pipes cleared";
  ctx.fillText(sub, size / 2, 590);

  if (opts.mode === "victory" && opts.beatTarget != null) {
    ctx.fillStyle = "#34d399";
    ctx.font = "800 48px system-ui, sans-serif";
    ctx.fillText(`Beat ${opts.beatTarget} ✨`, size / 2, 680);
  } else if (opts.wipeoutLine) {
    ctx.fillStyle = "#fde68a";
    ctx.font = "600 36px system-ui, sans-serif";
    wrapText(ctx, opts.wipeoutLine, size / 2, 680, 860, 44);
  }

  ctx.fillStyle = "#fff8e7";
  ctx.font = "800 42px system-ui, sans-serif";
  ctx.fillText(
    opts.mode === "victory"
      ? "Can you take it back?"
      : "Think you can beat me?",
    size / 2,
    840
  );

  ctx.fillStyle = "#b87333";
  ctx.font = "700 32px system-ui, sans-serif";
  ctx.fillText("pushflappy.com", size / 2, 920);

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

/** Trigger a PNG download of the share card. */
export function downloadShareCard(
  canvas: HTMLCanvasElement,
  filename = "push-flappy.png"
): void {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

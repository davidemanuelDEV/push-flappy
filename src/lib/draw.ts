/**
 * Canvas drawing for geometric bird + copper pipes
 * (inspired by Flappy / Push-day look — not copyrighted sprites).
 */

import type { GameState } from "./game";
import { birdRadius, birdX, pipeGap, pipeWidth } from "./game";

/** Copper metallic pipe gradients */
function pipeGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  w: number
): CanvasGradient {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, "#5c3310");
  g.addColorStop(0.15, "#b87333");
  g.addColorStop(0.35, "#e8a857");
  g.addColorStop(0.5, "#f0c078");
  g.addColorStop(0.65, "#c47a3a");
  g.addColorStop(0.85, "#8b4513");
  g.addColorStop(1, "#3d2208");
  return g;
}

function drawPipeSegment(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  capAtBottom: boolean
) {
  if (h <= 0) return;
  const grad = pipeGradient(ctx, x, w);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Rim / cap
  const capH = Math.min(18, h * 0.15);
  const capPad = w * 0.08;
  const capY = capAtBottom ? y + h - capH : y;
  ctx.fillStyle = pipeGradient(ctx, x - capPad, w + capPad * 2);
  ctx.fillRect(x - capPad, capY, w + capPad * 2, capH);

  // Highlight stripe
  ctx.fillStyle = "rgba(255,230,180,0.25)";
  ctx.fillRect(x + w * 0.2, y, w * 0.12, h);
}

export function drawPipes(ctx: CanvasRenderingContext2D, state: GameState) {
  const pw = pipeWidth(state.width);
  const gap = pipeGap(state.width, state.height);
  for (const p of state.pipes) {
    const gapTop = p.gapY - gap / 2;
    const gapBot = p.gapY + gap / 2;
    // Top pipe (cap at bottom of segment)
    drawPipeSegment(ctx, p.x, 0, pw, gapTop, true);
    // Bottom pipe (cap at top of segment)
    drawPipeSegment(ctx, p.x, gapBot, pw, state.height - gapBot, false);
  }
}

/** Simple geometric bird — round body, beak, eye, wing. */
export function drawBird(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  velHint = 0
) {
  const x = birdX(state.width);
  const y = state.birdY;
  const r = birdRadius(state.height);
  const tilt = Math.max(-0.5, Math.min(0.5, velHint * 0.8));

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.15, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#e8453c";
  ctx.fill();
  ctx.strokeStyle = "#8b1a14";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Belly
  ctx.beginPath();
  ctx.ellipse(r * 0.15, r * 0.25, r * 0.55, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#f5d0a9";
  ctx.fill();

  // Wing
  ctx.beginPath();
  ctx.ellipse(-r * 0.15, 0, r * 0.45, r * 0.35, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = "#fff8e7";
  ctx.fill();
  ctx.strokeStyle = "#c9a06a";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eye
  ctx.beginPath();
  ctx.arc(r * 0.45, -r * 0.25, r * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(r * 0.55, -r * 0.25, r * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();

  // Beak
  ctx.beginPath();
  ctx.moveTo(r * 0.7, 0);
  ctx.lineTo(r * 1.45, r * 0.1);
  ctx.lineTo(r * 0.7, r * 0.35);
  ctx.closePath();
  ctx.fillStyle = "#f5c542";
  ctx.fill();
  ctx.strokeStyle = "#c49020";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

export function drawHud(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  reps: number
) {
  const { width: w } = state;
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `bold ${Math.max(28, w * 0.08)}px system-ui, sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = 4;
  const scoreText = String(state.score);
  ctx.strokeText(scoreText, w / 2, Math.max(48, w * 0.08));
  ctx.fillText(scoreText, w / 2, Math.max(48, w * 0.08));

  ctx.font = `${Math.max(12, w * 0.032)}px system-ui, sans-serif`;
  ctx.lineWidth = 3;
  const sub = `Best ${state.highScore} · Reps ${reps}`;
  ctx.strokeText(sub, w / 2, Math.max(72, w * 0.12));
  ctx.fillText(sub, w / 2, Math.max(72, w * 0.12));
  ctx.restore();
}

/**
 * Canvas drawing for geometric bird + copper pipes + warm playfield.
 * Push-day energy — original art, not copyrighted sprites.
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
    drawPipeSegment(ctx, p.x, 0, pw, gapTop, true);
    drawPipeSegment(ctx, p.x, gapBot, pw, state.height - gapBot, false);
  }
}

/**
 * Warm dusk-gym playfield over the camera feed.
 * Translucent so the underlaid video still reads.
 */
export function drawPlayfield(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Soft sky wash: deep navy → warm amber (dusk gym)
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "rgba(12, 18, 42, 0.42)");
  sky.addColorStop(0.35, "rgba(28, 22, 36, 0.28)");
  sky.addColorStop(0.7, "rgba(58, 32, 18, 0.32)");
  sky.addColorStop(1, "rgba(72, 38, 14, 0.48)");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Edge vignette
  const cx = width / 2;
  const cy = height * 0.42;
  const rx = width * 0.72;
  const ry = height * 0.78;
  const vig = ctx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.25, cx, cy, Math.max(rx, ry));
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(0.55, "rgba(0,0,0,0.05)");
  vig.addColorStop(1, "rgba(8, 6, 4, 0.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);

  // Ground haze / strip
  const groundH = Math.max(28, height * 0.12);
  const ground = ctx.createLinearGradient(0, height - groundH, 0, height);
  ground.addColorStop(0, "rgba(90, 48, 18, 0)");
  ground.addColorStop(0.45, "rgba(70, 38, 14, 0.35)");
  ground.addColorStop(1, "rgba(42, 24, 10, 0.72)");
  ctx.fillStyle = ground;
  ctx.fillRect(0, height - groundH, width, groundH);

  // Subtle warm horizon line
  ctx.fillStyle = "rgba(251, 191, 36, 0.08)";
  ctx.fillRect(0, height - groundH - 2, width, 3);
}

/**
 * Cocky push-day bird at an arbitrary position/scale.
 * Shared by in-game draw + share card / OG helpers.
 */
export function drawBirdAt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  velHint = 0
) {
  const tilt = Math.max(-0.5, Math.min(0.5, velHint * 0.8));

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  const outline = Math.max(2.2, r * 0.14);

  // Soft drop shadow for volume
  ctx.beginPath();
  ctx.ellipse(r * 0.08, r * 0.55, r * 1.05, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fill();

  // Body — radial gradient for soft volume
  const body = ctx.createRadialGradient(
    -r * 0.25,
    -r * 0.35,
    r * 0.1,
    0,
    0,
    r * 1.25
  );
  body.addColorStop(0, "#ff6b5a");
  body.addColorStop(0.35, "#e8453c");
  body.addColorStop(0.75, "#c62828");
  body.addColorStop(1, "#8b1a14");
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.18, r * 1.02, 0, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = "#3b0a08";
  ctx.lineWidth = outline;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Belly patch
  ctx.beginPath();
  ctx.ellipse(r * 0.12, r * 0.28, r * 0.52, r * 0.42, 0.1, 0, Math.PI * 2);
  const belly = ctx.createRadialGradient(
    r * 0.05,
    r * 0.15,
    r * 0.05,
    r * 0.12,
    r * 0.28,
    r * 0.55
  );
  belly.addColorStop(0, "#ffe2c4");
  belly.addColorStop(1, "#e8b48a");
  ctx.fillStyle = belly;
  ctx.fill();

  // Wing with depth (behind-ish, slightly darker + highlight)
  ctx.save();
  ctx.rotate(-0.35);
  ctx.beginPath();
  ctx.ellipse(-r * 0.22, r * 0.02, r * 0.48, r * 0.32, 0, 0, Math.PI * 2);
  const wing = ctx.createRadialGradient(
    -r * 0.35,
    -r * 0.08,
    r * 0.05,
    -r * 0.22,
    r * 0.02,
    r * 0.5
  );
  wing.addColorStop(0, "#fff6e8");
  wing.addColorStop(0.55, "#f0d4a8");
  wing.addColorStop(1, "#c9925a");
  ctx.fillStyle = wing;
  ctx.fill();
  ctx.strokeStyle = "#5c3310";
  ctx.lineWidth = Math.max(1.4, r * 0.08);
  ctx.stroke();
  // Wing feather tip
  ctx.beginPath();
  ctx.ellipse(-r * 0.05, r * 0.05, r * 0.22, r * 0.16, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,248,231,0.55)";
  ctx.fill();
  ctx.restore();

  // Cheek blush
  ctx.beginPath();
  ctx.ellipse(r * 0.28, r * 0.12, r * 0.18, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 120, 100, 0.45)";
  ctx.fill();

  // Big expressive eye
  const ex = r * 0.42;
  const ey = -r * 0.28;
  const er = r * 0.34;
  ctx.beginPath();
  ctx.arc(ex, ey, er, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.strokeStyle = "#1a0a08";
  ctx.lineWidth = Math.max(1.5, r * 0.07);
  ctx.stroke();

  // Iris + pupil (cocky glance forward)
  ctx.beginPath();
  ctx.arc(ex + er * 0.22, ey + er * 0.05, er * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();
  // Specular highlight
  ctx.beginPath();
  ctx.arc(ex - er * 0.15, ey - er * 0.25, er * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ex + er * 0.35, ey + er * 0.2, er * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fill();

  // Heavy angry/cocky eyebrows
  ctx.beginPath();
  ctx.moveTo(ex - er * 1.05, ey - er * 0.85);
  ctx.quadraticCurveTo(
    ex - er * 0.15,
    ey - er * 1.45,
    ex + er * 0.95,
    ey - er * 0.55
  );
  ctx.quadraticCurveTo(
    ex + er * 0.35,
    ey - er * 1.05,
    ex - er * 0.95,
    ey - er * 0.55
  );
  ctx.closePath();
  ctx.fillStyle = "#1a0a08";
  ctx.fill();

  // Yellow beak with depth
  ctx.beginPath();
  ctx.moveTo(r * 0.72, -r * 0.02);
  ctx.lineTo(r * 1.55, r * 0.08);
  ctx.lineTo(r * 0.72, r * 0.38);
  ctx.closePath();
  const beak = ctx.createLinearGradient(r * 0.72, 0, r * 1.55, r * 0.2);
  beak.addColorStop(0, "#ffe066");
  beak.addColorStop(0.45, "#f5c542");
  beak.addColorStop(1, "#c49020");
  ctx.fillStyle = beak;
  ctx.fill();
  ctx.strokeStyle = "#7a4e0a";
  ctx.lineWidth = Math.max(1.2, r * 0.06);
  ctx.stroke();
  // Beak mouth line
  ctx.beginPath();
  ctx.moveTo(r * 0.78, r * 0.16);
  ctx.lineTo(r * 1.35, r * 0.14);
  ctx.strokeStyle = "rgba(122, 78, 10, 0.55)";
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.stroke();

  ctx.restore();
}

/** Simple geometric bird — round body, beak, eye, wing. */
export function drawBird(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  velHint = 0
) {
  drawBirdAt(
    ctx,
    birdX(state.width),
    state.birdY,
    birdRadius(state.height),
    velHint
  );
}

export function drawHud(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  reps: number,
  beatTarget?: number | null
) {
  const { width: w } = state;
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `900 ${Math.max(28, w * 0.08)}px system-ui, sans-serif`;
  ctx.fillStyle = "#fff8e7";
  ctx.strokeStyle = "rgba(40,18,8,0.7)";
  ctx.lineWidth = 4;
  const scoreText = String(state.score);
  const scoreY = Math.max(48, w * 0.08);
  ctx.strokeText(scoreText, w / 2, scoreY);
  ctx.fillText(scoreText, w / 2, scoreY);

  ctx.font = `600 ${Math.max(12, w * 0.032)}px system-ui, sans-serif`;
  ctx.lineWidth = 3;
  const sub = `Best ${state.highScore} · Reps ${reps}`;
  const subY = Math.max(72, w * 0.12);
  ctx.strokeText(sub, w / 2, subY);
  ctx.fillText(sub, w / 2, subY);

  if (beatTarget != null && beatTarget >= 0) {
    const barW = Math.min(w * 0.55, 220);
    const barH = Math.max(8, w * 0.014);
    const barX = (w - barW) / 2;
    const barY = subY + Math.max(10, w * 0.02);
    const progress =
      beatTarget <= 0 ? 1 : Math.min(1, state.score / beatTarget);
    ctx.fillStyle = "rgba(40,18,8,0.5)";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle =
      state.score > beatTarget ? "rgba(52,211,153,0.95)" : "rgba(251,191,36,0.9)";
    ctx.fillRect(barX, barY, barW * progress, barH);
    ctx.strokeStyle = "rgba(255,230,180,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.font = `700 ${Math.max(11, w * 0.028)}px system-ui, sans-serif`;
    ctx.fillStyle =
      state.score > beatTarget ? "#6ee7b7" : "#fde68a";
    ctx.lineWidth = 3;
    const label =
      state.score > beatTarget
        ? `Beat ${beatTarget}!`
        : `Beat ${beatTarget}`;
    ctx.strokeText(label, w / 2, barY + barH + Math.max(14, w * 0.032));
    ctx.fillText(label, w / 2, barY + barH + Math.max(14, w * 0.032));
  }
  ctx.restore();
}

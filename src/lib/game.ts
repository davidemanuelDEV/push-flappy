/**
 * Classic Flappy pipe scrolling + collision.
 * Bird Y is driven externally (pose), not by gravity.
 * Pipe gaps use a seeded RNG so daily runs are comparable.
 * Cadence: random holds / rises / falls (incl. long bottom holds).
 * Speed: +10% at 15, 20, 25, 30, … (compounding).
 */

import {
  BIRD_RADIUS_FRAC,
  BIRD_X_FRAC,
  MOBILE_GAP_MAX_HEIGHT,
  MOBILE_GAP_MAX_WIDTH,
  PIPE_GAP_FRAC,
  PIPE_GAP_FRAC_MOBILE,
  PIPE_SPACING,
  PIPE_SPEED,
  PIPE_WIDTH_FRAC,
} from "./constants";
import { dailyPipeSeed, laDayKey } from "./daily";
import { type Rng, rngFromString } from "./rng";

/** Fixed RNG draws per pipe so pipeIndex stays deterministic. */
const DRAWS_PER_PIPE = 6;

export type Pipe = {
  /** Left edge X in canvas pixels */
  x: number;
  /** Gap center Y in canvas pixels */
  gapY: number;
  scored: boolean;
};

/** Vertical pattern for upcoming pipes (seeded). */
export type Cadence = {
  kind: "hold" | "rise" | "fall";
  /** Pipes left in this pattern (including the one about to spawn). */
  remaining: number;
  gapY: number;
  /** Delta applied each spawn for rise/fall (canvas Y; + = lower on screen). */
  step: number;
};

export type GameState = {
  status: "ready" | "playing" | "over";
  birdY: number;
  pipes: Pipe[];
  score: number;
  highScore: number;
  width: number;
  height: number;
  /** LA calendar day for this run's pipe seed */
  dayKey: string;
  /** Seed string used for pipe RNG */
  seed: string;
  /** Next pipe index into the seeded stream (for debugging / sync) */
  pipeIndex: number;
  /** Current vertical cadence pattern */
  cadence: Cadence | null;
};

export function createInitialState(
  width: number,
  height: number,
  highScore: number,
  dayKey: string = laDayKey(),
  seedOverride?: string
): GameState {
  const seed = seedOverride || dailyPipeSeed(dayKey);
  return {
    status: "ready",
    birdY: height * 0.5,
    pipes: [],
    score: 0,
    highScore,
    width,
    height,
    dayKey,
    seed,
    pipeIndex: 0,
    cadence: null,
  };
}

function gapBounds(height: number, gap: number): { min: number; max: number } {
  const margin = gap * 0.55 + height * 0.08;
  return { min: margin, max: height - margin };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * +10% pipe speed at score 15, again at 20, 25, 30, … (compounding).
 * score 0–14 → 1×; 15–19 → 1.1×; 20–24 → 1.21×; …
 */
export function pipeSpeedMultiplier(score: number): number {
  if (score < 15) return 1;
  const steps = Math.floor((score - 15) / 5) + 1;
  return Math.pow(1.1, steps);
}

/** Advance RNG `pipeIndex * DRAWS_PER_PIPE` times for alignment. */
function rngAt(seed: string, pipeIndex: number): Rng {
  const rng = rngFromString(seed);
  for (let i = 0; i < pipeIndex * DRAWS_PER_PIPE; i++) rng();
  return rng;
}

/** Slightly larger gap on short/narrow canvases for fairer phone play. */
export function pipeGapFrac(width: number, height: number): number {
  if (height < MOBILE_GAP_MAX_HEIGHT || width < MOBILE_GAP_MAX_WIDTH) {
    return PIPE_GAP_FRAC_MOBILE;
  }
  return PIPE_GAP_FRAC;
}

function pickCadence(
  rng: Rng,
  height: number,
  gap: number,
  prevGapY: number | null
): Cadence {
  const { min, max } = gapBounds(height, gap);
  const range = max - min;
  const roll = rng();

  // ~42% hold (incl. long bottom holds), ~29% rise, ~29% fall
  if (roll < 0.42) {
    const long = rng() < 0.45;
    const remaining = long
      ? 4 + Math.floor(rng() * 4) // 4–7
      : 2 + Math.floor(rng() * 3); // 2–4
    const place = rng();
    let gapY: number;
    if (place < 0.4) {
      // Bottom hold — bird must stay low
      gapY = max - range * (0.04 + rng() * 0.1);
    } else if (place < 0.62) {
      // Top hold
      gapY = min + range * (0.04 + rng() * 0.1);
    } else if (prevGapY != null) {
      gapY = prevGapY;
    } else {
      gapY = min + rng() * range;
    }
    return {
      kind: "hold",
      remaining,
      gapY: clamp(gapY, min, max),
      step: 0,
    };
  }

  const remaining = 2 + Math.floor(rng() * 4); // 2–5
  const start =
    prevGapY != null
      ? prevGapY
      : min + rng() * range;
  const stepMag = (0.1 + rng() * 0.16) * range;

  if (roll < 0.71) {
    // Rise: gap center moves up (smaller Y) → player goes up then down
    return {
      kind: "rise",
      remaining,
      gapY: clamp(start, min, max),
      step: -stepMag,
    };
  }

  return {
    kind: "fall",
    remaining,
    gapY: clamp(start, min, max),
    step: stepMag,
  };
}

export function spawnPipe(
  state: GameState,
  x?: number
): { pipe: Pipe; nextIndex: number; cadence: Cadence } {
  const gap = state.height * pipeGapFrac(state.width, state.height);
  const { min, max } = gapBounds(state.height, gap);
  const rng = rngAt(state.seed, state.pipeIndex);
  // Fixed draw budget per pipe (keeps pipeIndex alignment).
  const draws: number[] = [];
  for (let i = 0; i < DRAWS_PER_PIPE; i++) draws.push(rng());
  let di = 0;
  const next = (): number => draws[di++] ?? 0.5;
  const localRng: Rng = () => next();

  const prevGapY =
    state.pipes.length > 0
      ? state.pipes[state.pipes.length - 1].gapY
      : state.cadence?.gapY ?? null;

  let cadence = state.cadence;
  if (!cadence || cadence.remaining <= 0) {
    cadence = pickCadence(localRng, state.height, gap, prevGapY);
  }

  const gapY = clamp(cadence.gapY, min, max);

  // Advance pattern for the following pipe.
  let followingY = gapY;
  if (cadence.kind === "rise" || cadence.kind === "fall") {
    followingY = clamp(gapY + cadence.step, min, max);
  }
  const nextCadence: Cadence = {
    kind: cadence.kind,
    remaining: Math.max(0, cadence.remaining - 1),
    gapY: followingY,
    step: cadence.step,
  };

  while (di < DRAWS_PER_PIPE) next();

  return {
    pipe: {
      x: x ?? state.width + 20,
      gapY,
      scored: false,
    },
    nextIndex: state.pipeIndex + 1,
    cadence: nextCadence,
  };
}

/** Seed a few pipes ahead when starting. */
export function startGame(state: GameState): GameState {
  const spacing = state.width * PIPE_SPACING;
  const pipes: Pipe[] = [];
  let pipeIndex = 0;
  let cadence: Cadence | null = null;
  let working: GameState = { ...state, pipeIndex: 0, pipes: [], cadence: null };
  for (let i = 0; i < 3; i++) {
    const spawned = spawnPipe(
      working,
      state.width * 0.75 + i * spacing
    );
    pipes.push(spawned.pipe);
    pipeIndex = spawned.nextIndex;
    cadence = spawned.cadence;
    working = { ...working, pipeIndex, pipes: [...pipes], cadence };
  }
  return {
    ...state,
    status: "playing",
    score: 0,
    pipes,
    pipeIndex,
    cadence,
    dayKey: state.dayKey || laDayKey(),
    seed: state.seed || dailyPipeSeed(state.dayKey || laDayKey()),
  };
}

export function birdRadius(height: number): number {
  return height * BIRD_RADIUS_FRAC;
}

export function birdX(width: number): number {
  return width * BIRD_X_FRAC;
}

export function pipeWidth(width: number): number {
  return width * PIPE_WIDTH_FRAC;
}

export function pipeGap(width: number, height: number): number {
  return height * pipeGapFrac(width, height);
}

/**
 * Advance pipes by dt seconds. Bird Y is set by caller before/after.
 * Returns updated state (may flip to "over" on collision).
 */
export function tick(state: GameState, dt: number, birdY: number): GameState {
  if (state.status !== "playing") {
    return { ...state, birdY };
  }

  const w = state.width;
  const h = state.height;
  const pw = pipeWidth(w);
  const gap = pipeGap(w, h);
  const bx = birdX(w);
  const br = birdRadius(h);
  const spacing = w * PIPE_SPACING;

  // Speed uses current score; ramp applies the frame after you clear 15/20/…
  const speed = w * PIPE_SPEED * pipeSpeedMultiplier(state.score);
  let pipes = state.pipes.map((p) => ({ ...p, x: p.x - speed * dt }));
  let score = state.score;
  let pipeIndex = state.pipeIndex;
  let cadence = state.cadence;

  // Score when bird clears pipe
  for (const p of pipes) {
    if (!p.scored && p.x + pw < bx - br) {
      p.scored = true;
      score += 1;
    }
  }

  // Recycle off-screen pipes
  pipes = pipes.filter((p) => p.x + pw > -40);
  while (pipes.length < 3) {
    const last = pipes[pipes.length - 1];
    const nx = last ? last.x + spacing : w + 20;
    const spawned = spawnPipe(
      { ...state, pipeIndex, pipes, cadence, score },
      nx
    );
    pipes.push(spawned.pipe);
    pipeIndex = spawned.nextIndex;
    cadence = spawned.cadence;
  }

  // Collision: bird vs pipes + floor/ceiling soft bounds already via birdY clamp
  const by = birdY;
  let hit = false;

  // Soft ceiling/floor
  if (by - br < 0 || by + br > h) hit = true;

  for (const p of pipes) {
    const inX = bx + br > p.x && bx - br < p.x + pw;
    if (!inX) continue;
    const gapTop = p.gapY - gap / 2;
    const gapBot = p.gapY + gap / 2;
    if (by - br < gapTop || by + br > gapBot) {
      hit = true;
      break;
    }
  }

  const highScore = Math.max(state.highScore, score);

  if (hit) {
    return {
      ...state,
      birdY: by,
      pipes,
      score,
      highScore,
      pipeIndex,
      cadence,
      status: "over",
    };
  }

  return {
    ...state,
    birdY: by,
    pipes,
    score,
    highScore,
    pipeIndex,
    cadence,
  };
}

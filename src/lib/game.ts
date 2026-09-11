/**
 * Classic Flappy pipe scrolling + collision.
 * Bird Y is driven externally (pose), not by gravity.
 * Pipe gaps use a seeded RNG so daily runs are comparable.
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

export type Pipe = {
  /** Left edge X in canvas pixels */
  x: number;
  /** Gap center Y in canvas pixels */
  gapY: number;
  scored: boolean;
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
};

export function createInitialState(
  width: number,
  height: number,
  highScore: number,
  dayKey: string = laDayKey()
): GameState {
  const seed = dailyPipeSeed(dayKey);
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
  };
}

function randomGapY(height: number, gap: number, rng: Rng): number {
  const margin = gap * 0.55 + height * 0.08;
  const min = margin;
  const max = height - margin;
  return min + rng() * (max - min);
}

/** Advance RNG `n` times so pipeIndex stays aligned after restarts mid-day. */
function rngAt(seed: string, pipeIndex: number): Rng {
  const rng = rngFromString(seed);
  for (let i = 0; i < pipeIndex; i++) rng();
  return rng;
}

/** Slightly larger gap on short/narrow canvases for fairer phone play. */
export function pipeGapFrac(width: number, height: number): number {
  if (height < MOBILE_GAP_MAX_HEIGHT || width < MOBILE_GAP_MAX_WIDTH) {
    return PIPE_GAP_FRAC_MOBILE;
  }
  return PIPE_GAP_FRAC;
}

export function spawnPipe(
  state: GameState,
  x?: number
): { pipe: Pipe; nextIndex: number } {
  const gap = state.height * pipeGapFrac(state.width, state.height);
  const rng = rngAt(state.seed, state.pipeIndex);
  const gapY = randomGapY(state.height, gap, rng);
  return {
    pipe: {
      x: x ?? state.width + 20,
      gapY,
      scored: false,
    },
    nextIndex: state.pipeIndex + 1,
  };
}

/** Seed a few pipes ahead when starting. */
export function startGame(state: GameState): GameState {
  const spacing = state.width * PIPE_SPACING;
  const pipes: Pipe[] = [];
  let pipeIndex = 0;
  let working: GameState = { ...state, pipeIndex: 0, pipes: [] };
  for (let i = 0; i < 3; i++) {
    const { pipe, nextIndex } = spawnPipe(
      working,
      state.width * 0.75 + i * spacing
    );
    pipes.push(pipe);
    pipeIndex = nextIndex;
    working = { ...working, pipeIndex, pipes };
  }
  return {
    ...state,
    status: "playing",
    score: 0,
    pipes,
    pipeIndex,
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
  const speed = w * PIPE_SPEED;
  const pw = pipeWidth(w);
  const gap = pipeGap(w, h);
  const bx = birdX(w);
  const br = birdRadius(h);
  const spacing = w * PIPE_SPACING;

  let pipes = state.pipes.map((p) => ({ ...p, x: p.x - speed * dt }));
  let score = state.score;
  let pipeIndex = state.pipeIndex;

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
    const { pipe, nextIndex } = spawnPipe(
      { ...state, pipeIndex, pipes },
      nx
    );
    pipes.push(pipe);
    pipeIndex = nextIndex;
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
      status: "over",
    };
  }

  return { ...state, birdY: by, pipes, score, highScore, pipeIndex };
}

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createInitialState,
  OPENING_REP_COUNT,
  pipeSpeedMultiplier,
  spawnPipe,
  startGame,
  type Cadence,
  type GameState,
  type Pipe,
} from "./game";
import { racePipeSeed } from "./race";

const W = 800;
const H = 800;

function spawnMany(
  seed: string,
  n: number,
  width = W,
  height = H
): { pipes: Pipe[]; cadence: Cadence | null; state: GameState } {
  let state = createInitialState(width, height, 0, "2026-01-01", seed);
  const pipes: Pipe[] = [];
  let cadence: Cadence | null = null;
  let pipeIndex = 0;
  for (let i = 0; i < n; i++) {
    const spawned = spawnPipe(
      { ...state, pipeIndex, pipes: [...pipes], cadence },
      i * 100
    );
    pipes.push(spawned.pipe);
    pipeIndex = spawned.nextIndex;
    cadence = spawned.cadence;
    state = { ...state, pipeIndex, pipes: [...pipes], cadence };
  }
  return { pipes, cadence, state };
}

function sameY(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-6;
}

function holdRunLength(pipes: Pipe[], start: number): number {
  const y = pipes[start]!.gapY;
  let n = 1;
  for (let i = start + 1; i < pipes.length; i++) {
    if (!sameY(pipes[i]!.gapY, y)) break;
    n += 1;
  }
  return n;
}

describe("pipeSpeedMultiplier", () => {
  it("stays 1× until 15, then compounds +10% at 15/20/25/30…", () => {
    assert.equal(pipeSpeedMultiplier(0), 1);
    assert.equal(pipeSpeedMultiplier(14), 1);
    assert.equal(pipeSpeedMultiplier(15), Math.pow(1.1, 1));
    assert.equal(pipeSpeedMultiplier(19), Math.pow(1.1, 1));
    assert.equal(pipeSpeedMultiplier(20), Math.pow(1.1, 2));
    assert.equal(pipeSpeedMultiplier(24), Math.pow(1.1, 2));
    assert.equal(pipeSpeedMultiplier(25), Math.pow(1.1, 3));
    assert.equal(pipeSpeedMultiplier(29), Math.pow(1.1, 3));
    assert.equal(pipeSpeedMultiplier(30), Math.pow(1.1, 4));
    assert.equal(pipeSpeedMultiplier(35), Math.pow(1.1, 5));
  });
});

describe("push-up cadence", () => {
  it("makes the first ten spawned pipes alternate high ↔ low with a real dip", () => {
    const { pipes } = spawnMany("cadence-open", OPENING_REP_COUNT + 8);
    const first = pipes.slice(0, OPENING_REP_COUNT);
    const highY = first[0]!.gapY;
    const lowY = first[1]!.gapY;

    assert.ok(highY < lowY, "first pipe is the up (high) of a push-up");
    assert.ok(
      lowY - highY > H * 0.3,
      `amplitude ${lowY - highY} should use most of the playable band`
    );

    for (let i = 0; i < OPENING_REP_COUNT; i++) {
      const expected = i % 2 === 0 ? highY : lowY;
      assert.ok(
        sameY(first[i]!.gapY, expected),
        `pipe ${i} should be ${i % 2 === 0 ? "high" : "low"}`
      );
    }
  });

  it("follows the opening ten with a short mid-band hold, then reps again", () => {
    const { pipes } = spawnMany("cadence-hold", 40);
    const highY = pipes[0]!.gapY;
    const lowY = pipes[1]!.gapY;
    const mid = (highY + lowY) / 2;

    const holdLen = holdRunLength(pipes, OPENING_REP_COUNT);
    assert.ok(
      holdLen >= 2 && holdLen <= 4,
      `hold length ${holdLen} should be 2–4`
    );

    const holdY = pipes[OPENING_REP_COUNT]!.gapY;
    assert.ok(
      holdY > highY + (lowY - highY) * 0.25 &&
        holdY < lowY - (lowY - highY) * 0.2,
      `hold Y ${holdY} should sit mid-band, not a bottom/top plank`
    );
    assert.ok(
      Math.abs(holdY - mid) < (lowY - highY) * 0.3,
      "hold is near halfway down a push-up"
    );

    const after = OPENING_REP_COUNT + holdLen;
    assert.ok(!sameY(pipes[after]!.gapY, pipes[after + 1]!.gapY));
    assert.ok(sameY(pipes[after]!.gapY, highY) || sameY(pipes[after]!.gapY, lowY));
    assert.ok(
      sameY(pipes[after + 1]!.gapY, highY) ||
        sameY(pipes[after + 1]!.gapY, lowY)
    );
    assert.ok(!sameY(pipes[after]!.gapY, pipes[after + 1]!.gapY));
  });

  it("never uses a multi-pipe hold in the opening ten", () => {
    for (const seed of ["a", "b", "race-seed", "2026-09-12"]) {
      const { pipes } = spawnMany(seed, OPENING_REP_COUNT);
      for (let i = 1; i < pipes.length; i++) {
        assert.ok(
          !sameY(pipes[i]!.gapY, pipes[i - 1]!.gapY),
          `seed ${seed} pipe ${i} held from previous`
        );
      }
    }
  });

  it("keeps seedOverride / race seeds deterministic", () => {
    const seed = racePipeSeed("k7m2p");
    const a = spawnMany(seed, 30).pipes.map((p) => p.gapY);
    const b = spawnMany(seed, 30).pipes.map((p) => p.gapY);
    assert.deepEqual(a, b);

    const other = spawnMany(racePipeSeed("zzzzz"), 30).pipes.map((p) => p.gapY);
    // Opening ten is a fixed rep pattern; later hold height/length may differ.
    assert.deepEqual(a.slice(0, OPENING_REP_COUNT), other.slice(0, OPENING_REP_COUNT));
    assert.ok(
      a.slice(OPENING_REP_COUNT).some((y, i) => !sameY(y, other[OPENING_REP_COUNT + i]!))
    );

    const viaOverride = createInitialState(W, H, 0, "2026-01-01", seed);
    assert.equal(viaOverride.seed, seed);
  });

  it("startGame pre-spawns the opening high-low-high reps", () => {
    const ready = createInitialState(W, H, 0, "2026-01-01", "start-seed");
    const playing = startGame(ready);
    assert.equal(playing.pipes.length, 3);
    assert.ok(playing.pipes[0]!.gapY < playing.pipes[1]!.gapY);
    assert.ok(sameY(playing.pipes[0]!.gapY, playing.pipes[2]!.gapY));
    assert.equal(playing.pipeIndex, 3);
    assert.equal(playing.seed, "start-seed");
  });
});

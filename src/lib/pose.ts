/**
 * Pose → bird Y mapping for Push Flappy.
 *
 * Primary control (matches the viral "Push day killer" filter):
 * continuous body-Y tracking — bird Y follows torso height in the camera
 * frame with light EMA smoothing. No gravity/flap; your push-up depth IS
 * the bird height.
 *
 * Torso height = midpoint of shoulders (preferred), falling back to
 * hip–shoulder midpoint or nose if shoulders are missing.
 * MediaPipe Y: 0 = top of frame, 1 = bottom. Down in push-up → higher Y
 * → bird goes down. Up → lower Y → bird goes up.
 */

import { EMA_ALPHA, LM, MIN_VISIBILITY } from "./constants";

export type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
};

export type PoseSample = {
  /** Raw torso Y in [0,1] (MediaPipe coords) */
  torsoY: number;
  /** EMA-smoothed torso Y */
  smoothedY: number;
  /** Whether we have a usable pose this frame */
  hasPose: boolean;
  /** Optional push-up rep count */
  reps: number;
};

export function visible(lm: Landmark | undefined): boolean {
  if (!lm) return false;
  return (lm.visibility ?? 1) >= MIN_VISIBILITY;
}

/** Extract torso height (0–1, top→bottom) from pose landmarks. */
export function torsoHeight(landmarks: Landmark[]): number | null {
  const ls = landmarks[LM.LEFT_SHOULDER];
  const rs = landmarks[LM.RIGHT_SHOULDER];
  const lh = landmarks[LM.LEFT_HIP];
  const rh = landmarks[LM.RIGHT_HIP];
  const nose = landmarks[LM.NOSE];

  if (visible(ls) && visible(rs)) {
    return (ls.y + rs.y) / 2;
  }

  // Hip–shoulder midpoint if one side is visible
  const shoulders: number[] = [];
  const hips: number[] = [];
  if (visible(ls)) shoulders.push(ls.y);
  if (visible(rs)) shoulders.push(rs.y);
  if (visible(lh)) hips.push(lh.y);
  if (visible(rh)) hips.push(rh.y);

  if (shoulders.length && hips.length) {
    const s = shoulders.reduce((a, b) => a + b, 0) / shoulders.length;
    const h = hips.reduce((a, b) => a + b, 0) / hips.length;
    return (s + h) / 2;
  }
  if (shoulders.length) {
    return shoulders.reduce((a, b) => a + b, 0) / shoulders.length;
  }
  if (visible(nose)) return nose.y;
  return null;
}

/**
 * Map normalized torso Y → bird canvas Y (pixels).
 * Pads edges so bird stays fully on-screen.
 */
export function mapTorsoToBirdY(
  torsoY: number,
  canvasH: number,
  birdRadius: number
): number {
  const pad = birdRadius + 4;
  const t = Math.min(1, Math.max(0, torsoY));
  return pad + t * (canvasH - 2 * pad);
}

export class PoseTracker {
  private smoothed: number | null = null;
  private reps = 0;
  private phase: "up" | "down" | "unknown" = "unknown";
  private minY = 1;
  private maxY = 0;
  private calibrated = false;

  /** Call each frame with landmarks (or null if none). */
  update(landmarks: Landmark[] | null): PoseSample {
    if (!landmarks || landmarks.length < 25) {
      return {
        torsoY: this.smoothed ?? 0.5,
        smoothedY: this.smoothed ?? 0.5,
        hasPose: false,
        reps: this.reps,
      };
    }

    const raw = torsoHeight(landmarks);
    if (raw == null) {
      return {
        torsoY: this.smoothed ?? 0.5,
        smoothedY: this.smoothed ?? 0.5,
        hasPose: false,
        reps: this.reps,
      };
    }

    if (this.smoothed == null) {
      this.smoothed = raw;
    } else {
      this.smoothed = EMA_ALPHA * raw + (1 - EMA_ALPHA) * this.smoothed;
    }

    this.updateReps(this.smoothed);

    return {
      torsoY: raw,
      smoothedY: this.smoothed,
      hasPose: true,
      reps: this.reps,
    };
  }

  /**
   * Simple peak/valley rep counter: requires enough vertical travel
   * (calibrated from observed range) then counts down→up transitions.
   */
  private updateReps(y: number) {
    this.minY = Math.min(this.minY, y);
    this.maxY = Math.max(this.maxY, y);
    const range = this.maxY - this.minY;
    if (range < 0.08) return; // not enough motion yet
    this.calibrated = true;

    const mid = (this.minY + this.maxY) / 2;
    const lowThresh = mid + range * 0.2; // deeper = higher Y
    const highThresh = mid - range * 0.2;

    if (this.phase === "unknown") {
      this.phase = y > mid ? "down" : "up";
      return;
    }

    if (this.phase === "up" && y >= lowThresh) {
      this.phase = "down";
    } else if (this.phase === "down" && y <= highThresh) {
      this.phase = "up";
      this.reps += 1;
    }
  }

  resetReps() {
    this.reps = 0;
    this.phase = "unknown";
    this.minY = 1;
    this.maxY = 0;
    this.calibrated = false;
  }

  get isCalibrated() {
    return this.calibrated;
  }
}

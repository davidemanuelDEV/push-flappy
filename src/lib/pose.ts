/**
 * Pose → bird Y mapping for Push Flappy.
 *
 * Primary control (matches the viral "Push day killer" filter):
 * continuous body-Y tracking — bird Y follows torso height in the camera
 * frame with light EMA smoothing. No gravity/flap; your push-up depth IS
 * the bird height.
 *
 * Start calibration: player holds the top of a push-up (plank). That stable
 * torso Y becomes upY so the bird sits near the top of the playable range.
 * Going down increases MediaPipe Y and moves the bird down.
 */

import {
  CALIB_HOLD_MS,
  CALIB_MAX_STD,
  CALIB_UP_BIRD_FRAC,
  DEFAULT_DOWN_OFFSET,
  EMA_ALPHA,
  LM,
  MIN_LEARNED_RANGE,
  MIN_VISIBILITY,
} from "./constants";

export type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
};

export type CalibPhase = "waiting" | "holding" | "set";

export type PoseSample = {
  /** Raw torso Y in [0,1] (MediaPipe coords) */
  torsoY: number;
  /** EMA-smoothed torso Y */
  smoothedY: number;
  /** Whether we have a usable pose this frame */
  hasPose: boolean;
  /** Optional push-up rep count */
  reps: number;
  /** Start-calibration phase */
  calibPhase: CalibPhase;
  /** 0–1 progress while holding a stable plank */
  holdProgress: number;
  /** Calibrated plank / top-of-push-up Y (MediaPipe), if set */
  upY: number | null;
  /**
   * Normalized depth in calibrated range: 0 = up (near top of canvas),
   * 1 = down. Uncalibrated falls back to raw smoothed Y.
   */
  mappedNorm: number;
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
 * Map normalized depth (0 = up / high bird, 1 = down / low bird) → canvas Y.
 * Calibrated up sits near the top of the playable band (not dead flush).
 */
export function mapNormToBirdY(
  mappedNorm: number,
  canvasH: number,
  birdRadius: number
): number {
  const pad = birdRadius + 4;
  const usable = canvasH - 2 * pad;
  const t = Math.min(1, Math.max(0, mappedNorm));
  const upFrac = Math.min(0.35, Math.max(0, CALIB_UP_BIRD_FRAC));
  return pad + upFrac * usable + t * (1 - upFrac) * usable;
}

/**
 * @deprecated Prefer mapNormToBirdY with PoseTracker.mappedNorm.
 * Kept for simple uncalibrated fallback: raw MediaPipe Y → canvas.
 */
export function mapTorsoToBirdY(
  torsoY: number,
  canvasH: number,
  birdRadius: number
): number {
  return mapNormToBirdY(torsoY, canvasH, birdRadius);
}

type HistSample = { t: number; y: number };

export class PoseTracker {
  private smoothed: number | null = null;
  private reps = 0;
  private phase: "up" | "down" | "unknown" = "unknown";
  private minY = 1;
  private maxY = 0;
  private rangeCalibrated = false;

  /** Plank / top-of-push-up Y locked after a stable hold */
  private upY: number | null = null;
  /** Deepest (highest MediaPipe Y) observed after upY is set */
  private downY: number | null = null;
  private holdProgress = 0;
  private stableSince: number | null = null;
  private history: HistSample[] = [];

  /** Call each frame with landmarks (or null if none). `now` defaults to performance.now(). */
  update(landmarks: Landmark[] | null, now = performance.now()): PoseSample {
    const empty = (): PoseSample => ({
      torsoY: this.smoothed ?? 0.5,
      smoothedY: this.smoothed ?? 0.5,
      hasPose: false,
      reps: this.reps,
      calibPhase: this.calibPhase(),
      holdProgress: this.upY != null ? 1 : 0,
      upY: this.upY,
      mappedNorm: this.computeMappedNorm(this.smoothed ?? 0.5),
    });

    if (!landmarks || landmarks.length < 25) {
      this.breakHold();
      return empty();
    }

    const raw = torsoHeight(landmarks);
    if (raw == null) {
      this.breakHold();
      return empty();
    }

    if (this.smoothed == null) {
      this.smoothed = raw;
    } else {
      this.smoothed = EMA_ALPHA * raw + (1 - EMA_ALPHA) * this.smoothed;
    }

    this.pushHistory(now, this.smoothed);
    this.updateStartCalibration(now, this.smoothed);
    this.updateReps(this.smoothed);

    if (this.upY != null) {
      const provisionalDown = this.upY + DEFAULT_DOWN_OFFSET;
      const candidate = Math.max(this.smoothed, this.downY ?? this.upY);
      // Only expand downY once they've moved meaningfully below up
      if (candidate > this.upY + MIN_LEARNED_RANGE * 0.5) {
        this.downY = Math.max(this.downY ?? provisionalDown, candidate);
      }
    }

    return {
      torsoY: raw,
      smoothedY: this.smoothed,
      hasPose: true,
      reps: this.reps,
      calibPhase: this.calibPhase(),
      holdProgress: this.upY != null ? 1 : this.holdProgress,
      upY: this.upY,
      mappedNorm: this.computeMappedNorm(this.smoothed),
    };
  }

  private calibPhase(): CalibPhase {
    if (this.upY != null) return "set";
    if (this.holdProgress > 0) return "holding";
    return "waiting";
  }

  private pushHistory(now: number, y: number) {
    this.history.push({ t: now, y });
    const cutoff = now - Math.max(CALIB_HOLD_MS, 400);
    while (this.history.length && this.history[0].t < cutoff) {
      this.history.shift();
    }
  }

  private windowStd(now: number): number | null {
    const window = this.history.filter((s) => now - s.t <= CALIB_HOLD_MS);
    if (window.length < 6) return null;
    const mean = window.reduce((a, s) => a + s.y, 0) / window.length;
    const varSum = window.reduce((a, s) => a + (s.y - mean) ** 2, 0);
    return Math.sqrt(varSum / window.length);
  }

  private windowMean(now: number): number | null {
    const window = this.history.filter((s) => now - s.t <= CALIB_HOLD_MS);
    if (window.length < 6) return null;
    return window.reduce((a, s) => a + s.y, 0) / window.length;
  }

  private breakHold() {
    this.stableSince = null;
    this.holdProgress = 0;
  }

  /**
   * While upY is unset: require ~CALIB_HOLD_MS of low-variance smoothed Y
   * (plank / top of push-up), then lock upY.
   */
  private updateStartCalibration(now: number, y: number) {
    if (this.upY != null) {
      this.holdProgress = 1;
      return;
    }

    const std = this.windowStd(now);
    if (std == null || std > CALIB_MAX_STD) {
      this.breakHold();
      return;
    }

    if (this.stableSince == null) {
      this.stableSince = now;
    }
    const elapsed = now - this.stableSince;
    this.holdProgress = Math.min(1, elapsed / CALIB_HOLD_MS);

    if (elapsed >= CALIB_HOLD_MS) {
      const mean = this.windowMean(now) ?? y;
      this.upY = mean;
      this.downY = mean + DEFAULT_DOWN_OFFSET;
      this.holdProgress = 1;
      this.stableSince = null;
    }
  }

  /**
   * 0 at calibrated up (bird near top), 1 at down.
   * Until calibrated, use raw smoothed Y so the bird still tracks.
   */
  private computeMappedNorm(y: number): number {
    if (this.upY == null) {
      return Math.min(1, Math.max(0, y));
    }
    const down =
      this.downY != null
        ? Math.max(this.downY, this.upY + DEFAULT_DOWN_OFFSET)
        : this.upY + DEFAULT_DOWN_OFFSET;
    const range = Math.max(down - this.upY, DEFAULT_DOWN_OFFSET * 0.5);
    return Math.min(1, Math.max(0, (y - this.upY) / range));
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
    this.rangeCalibrated = true;

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

  /** Reset reps + start calibration (call on Play again / before Start). */
  resetCalibration() {
    this.reps = 0;
    this.phase = "unknown";
    this.minY = 1;
    this.maxY = 0;
    this.rangeCalibrated = false;
    this.upY = null;
    this.downY = null;
    this.holdProgress = 0;
    this.stableSince = null;
    this.history = [];
    // keep smoothed so the bird doesn't jump wildly; next frames re-lock
  }

  resetReps() {
    this.resetCalibration();
  }

  get isCalibrated() {
    return this.upY != null;
  }

  get isRangeCalibrated() {
    return this.rangeCalibrated;
  }

  get startUpY() {
    return this.upY;
  }
}

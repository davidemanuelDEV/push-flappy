/** Game & pose constants for Push Flappy */

export const HIGH_SCORE_KEY = "push-flappy-high-score";

/** Bird stays at fixed X (fraction of canvas width) */
export const BIRD_X_FRAC = 0.22;

/** Bird size relative to canvas height */
export const BIRD_RADIUS_FRAC = 0.028;

/** Pipe width relative to canvas width */
export const PIPE_WIDTH_FRAC = 0.14;

/** Gap between top & bottom pipe (fraction of height) — desktop / tall */
export const PIPE_GAP_FRAC = 0.28;

/** Larger gap on short/narrow screens so phone play is fairer */
export const PIPE_GAP_FRAC_MOBILE = 0.34;

/** Treat canvas as "phone-ish" when below these CSS sizes */
export const MOBILE_GAP_MAX_HEIGHT = 700;
export const MOBILE_GAP_MAX_WIDTH = 500;

/** Horizontal speed in canvas-widths per second */
export const PIPE_SPEED = 0.22;

/** Spacing between successive pipe pairs (canvas widths) */
export const PIPE_SPACING = 0.55;

/** EMA alpha for torso→bird Y smoothing (higher = snappier) */
export const EMA_ALPHA = 0.35;

/** MediaPipe Pose landmark indices */
export const LM = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
} as const;

/** CDN paths for MediaPipe WASM + model (no API key) */
export const MEDIAPIPE_WASM =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
export const POSE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

/** Visibility threshold for using a landmark */
export const MIN_VISIBILITY = 0.5;

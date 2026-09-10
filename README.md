# Push Flappy

**Flappy Bird for push day** — control the bird with push-ups via your webcam (or phone camera) and [MediaPipe Pose](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker).

Inspired by the viral “Push day killer” camera filter: bird **Y follows your torso height**; copper pipes scroll; score for clearing gaps. Geometric bird/pipes (not copyrighted Flappy Bird sprites).

**Repo:** [https://github.com/davidemanuelDEV/push-flappy](https://github.com/davidemanuelDEV/push-flappy)

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Start**.

Production build:

```bash
npm run build && npm start
```

## Phone / HTTPS (recommended path)

Phone browsers require **HTTPS** (or localhost) for `getUserMedia`. The practical path:

1. Push this repo to GitHub (already set up).
2. Deploy to **Vercel** (or any HTTPS host) from the GitHub repo.
3. Open the Vercel URL on your phone → allow camera → phone on the floor facing up → play.

Local LAN `http://192.168.x.x:3000` often blocks the camera; use a tunnel or the Vercel deploy instead.

## Camera tips

- **Laptop first:** easiest path — allow the front camera and get into push-up position facing the webcam.
- **Phone:** portrait works with the phone on the floor facing up; landscape is optional.
- Face the camera in a push-up plank; hold the **top of a push-up** until you see **Start position set**, then hit **Start**.

## Pose → bird mapping

**Primary control: continuous body-Y tracking** (not classic gravity + flap). This matches the viral filter.

1. MediaPipe Pose Landmarker runs on each video frame (WASM + lite model from Google CDN / jsDelivr — no API keys).
2. **Torso height** = midpoint of left/right shoulders (landmarks 11 & 12). Fallbacks: hip–shoulder midpoint, then nose.
3. **Start calibration:** hold the top of a push-up (plank) with low torso-Y variance for ~1s. That locks `upY` so the bird sits near the **top** of the playable range. Start stays disabled until you see **Start position set**. Play again recalibrates.
4. Mapping uses the range from `upY` toward a default down offset (~0.30 MediaPipe Y), expanding as a real bottom is learned. Going **down** raises torso `y` → bird moves **down**; pressing **up** → bird moves **up**.
5. Light **EMA** smoothing (`α ≈ 0.35`) reduces jitter.
6. Bird **X** is fixed; pipes scroll right→left with gap collision, scoring, game over, restart, and **high score in `localStorage`**.
7. Optional **rep counter** detects down→up cycles from the same torso signal.
8. On short/narrow screens the pipe gap is slightly larger for fairer phone play; camera requests a lower ideal resolution on narrow viewports.

Classic gravity+flap is intentionally **not** used as primary — continuous Y feels better for push-ups and matches the inspiration.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4
- `@mediapipe/tasks-vision` (client-only)
- No backend, no API keys, no accounts, no analytics

## Routes

| Path   | Description                          |
|--------|--------------------------------------|
| `/`    | Marketing / how-to-play + Start CTA  |
| `/play`| Fullscreen camera game               |

## Share

Uses `navigator.share` when available (includes the live site URL); otherwise copies score text + URL to the clipboard.

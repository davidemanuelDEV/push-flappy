# Push Flappy

**Flappy Bird for push day** — control the bird with push-ups via your webcam (or phone camera) and [MediaPipe Pose](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker).

Inspired by the viral “Push day killer” camera filter: bird **Y follows your torso height**; copper pipes scroll; score for clearing gaps. Geometric bird/pipes (not copyrighted Flappy Bird sprites).

**Live:** [https://pushflappy.com](https://pushflappy.com)  
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

## Viral sharing & daily board

### Beat-me challenges
- On wipeout, **Share challenge** builds a deep link: `https://pushflappy.com/play?beat={score}` (optional `&reps=`).
- Share text includes score + wipeout quip + dare CTA. Prefer `navigator.share`; clipboard fallback.
- Opening `/play?beat=N` shows a **bar-to-beat** in the HUD. Clearing a higher score triggers a **you beat them** share prompt.
- Optional canvas share card (1080×1080) attaches when the OS share sheet supports files.

### Daily seeded runs
- Pipe gap RNG is seeded from the calendar day in **America/Los_Angeles** (`YYYY-MM-DD`).
- Everyone faces the same pipe layout that day → scores are comparable on the daily board.

### Leaderboard API
- `GET /api/leaderboard?day=YYYY-MM-DD` — top scores for that day.
- `POST /api/leaderboard` — `{ nick, emoji?, score, reps, dayKey? }` (today only). Anonymous nick (2–16 chars); no accounts.
- In-memory IP rate limits (GET ~60/min, POST ~12/min per IP).
- Best score per nick kept per day.

#### Persistence (Vercel KV / Upstash)

When these env vars are set on the Vercel project, scores persist via Redis REST:

| Env var | Purpose |
|---------|---------|
| `KV_REST_API_URL` | Upstash / Vercel KV REST URL |
| `KV_REST_API_TOKEN` | REST token |

In the Vercel dashboard: **Storage → Create Database → KV (Upstash)** → connect to the `push-flappy` project (auto-injects the vars), then redeploy.

Without KV, the API still works with an **in-memory** store (fine for demos; lost on cold starts / multi-instance). The board UI labels this as “demo store”.

## Phone / HTTPS

Phone browsers require **HTTPS** (or localhost) for `getUserMedia`. Deploy to Vercel and open [pushflappy.com](https://pushflappy.com) (or your `*.vercel.app` URL).

## Camera tips

- **Laptop first:** allow the front camera and get into push-up position facing the webcam.
- **Phone:** portrait works with the phone on the floor facing up; landscape is optional.
- Face the camera in a push-up plank; hold the **top of a push-up** until you see **Start position set**, then hit **Start**.

## Pose → bird mapping

**Primary control: continuous body-Y tracking** (not classic gravity + flap).

1. MediaPipe Pose Landmarker on each video frame (WASM + lite model from CDN — no API keys).
2. **Torso height** = midpoint of shoulders (11 & 12), with hip/nose fallbacks.
3. **Start calibration:** hold plank ~1s to lock `upY`.
4. Light **EMA** smoothing; bird **X** fixed; pipes scroll with gap collision + scoring.
5. Optional **rep counter** from the same torso signal.
6. Short/narrow screens get a slightly larger pipe gap.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4
- `@mediapipe/tasks-vision` (client-only)
- Optional Vercel KV / Upstash for the daily board
- No accounts, no company branding

## Routes

| Path | Description |
|------|-------------|
| `/` | Marketing / how-to-play + Start CTA |
| `/play` | Fullscreen camera game (`?beat=N` challenge) |
| `/api/leaderboard` | Daily board GET/POST |

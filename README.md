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
- On wipeout, the run is **POSTed once** to `/api/leaderboard` automatically (saved nick/emoji, default Anon / 🐦). The wipeout Post CTA shows **Posted** / disabled after success — Challenge a friend stays the filled primary.
- On wipeout, **Share challenge** builds a deep link: `https://pushflappy.com/play?beat={score}` (optional `&reps=`). In a race, the primary CTA shares the race link instead (`/race/{id}`).
- Share text includes score + wipeout quip + dare CTA. Prefer `navigator.share`; clipboard fallback.
- Opening `/play?beat=N` shows a **bar-to-beat** in the HUD. Clearing a higher score triggers a **you beat them** share prompt.
- Wipeout / victory share UI includes a secondary **Squat Flappy** outline row under Challenge a friend (Growth lock: “Arms cooked? Legs next → squatflappy.com”) → `https://squatflappy.com/play`.
- Landing hero (and `/play` ready/idle chrome) shows a rounded-full **Also play Squat Flappy** promo pill → `https://squatflappy.com/play`. Hidden during active play.
- Optional canvas share card (1080×1080) attaches when the OS share sheet supports files.

### Daily seeded runs
- Pipe gap RNG is seeded from the calendar day in **America/Los_Angeles** (`YYYY-MM-DD`).
- Everyone faces the same pipe layout that day → scores are comparable on the daily board.

### Race (async lobby)
- `/race` mints a short id and copies `https://pushflappy.com/race/{id}`.
- `/race/[id]` is the dare-first page: a real nick (2–16 letters/numbers) is required. Join POSTs that nick at score 0 / reps 0 so the live top-10 has names before anyone flies. Play (`/play?race={id}`) stays off until join succeeds. Spectators need no camera.
- Same pipe seed for everyone in that race. `/play?race=` shows a compact live top-10 during ready and play (your row highlighted). Scores POST as you clear pipes (~1s) and on wipeout — latest per nick, cap 10, same nick updates in place. Spectators on `/race/{id}` and `/overlay` poll the same board (~1s). Not frame-sync.
- OBS: `/race/[id]/overlay` or `/race/[id]?obs=1` — big ranks, no camera.
- Persistence: same Blob / KV / memory backends as the daily board (`push-flappy/race/{id}.json`).

### Leaderboard API
- `GET /api/leaderboard?day=YYYY-MM-DD` — top scores for that day.
- `POST /api/leaderboard` — `{ nick, emoji?, score, reps, dayKey? }` (today only). Anonymous nick (2–16 chars); no accounts.
- In-memory IP rate limits (GET ~60/min, POST ~12/min per IP).
- Best score per nick kept per day.


### Challenge reminders (email capture)
- Compact opt-in on **game over**, plus light forms on `/board` and the landing page.
- Copy: “Get reminder to challenge again” → success: “You’re on the list”.
- No accounts. Capture only unless Resend is configured.

#### Reminders API
- `POST /api/reminders` — body:
  ```json
  { "email": "you@example.com", "source": "gameover|board|landing", "timezone?": "America/Los_Angeles", "dayKey?": "YYYY-MM-DD" }
  ```
- Validates email; IP rate-limit (~8/min); dedupes by normalized email.
- Stores `email`, `createdAt`, `dayKey`, `timezone` (default America/Los_Angeles), `source`.
- Persistence: same KV env as the leaderboard (`KV_REST_API_URL` / `KV_REST_API_TOKEN`). Without KV → in-memory (not durable across cold starts).

| Env var | Purpose |
|---------|---------|
| `KV_REST_API_URL` | Upstash / Vercel KV REST URL (required for durable reminder storage) |
| `KV_REST_API_TOKEN` | REST token |
| `UPSTASH_REDIS_REST_URL` | Alias for `KV_REST_API_URL` (raw Upstash Redis REST) |
| `UPSTASH_REDIS_REST_TOKEN` | Alias for `KV_REST_API_TOKEN` |
| `RESEND_API_KEY` | Optional. If set, sends a one-line welcome. If absent, **capture-only** — wire a cron later to email “Push day — beat today’s board”. |
| `RESEND_FROM` | Optional From header for Resend (defaults to Resend onboarding address) |

Production paths avoid logging full emails (masked if logged in dev).

#### Persistence (Vercel Blob / KV / Upstash)

Daily scores persist when any of these are set on the Vercel project:

| Env var | Purpose |
|---------|---------|
| `BLOB_READ_WRITE_TOKEN` | Private Vercel Blob store (pathname `push-flappy/lb/{day}.json`) |
| `KV_REST_API_URL` | Upstash / Vercel KV REST URL |
| `KV_REST_API_TOKEN` | REST token |
| `UPSTASH_REDIS_REST_URL` | Alias for `KV_REST_API_URL` (same REST protocol) |
| `UPSTASH_REDIS_REST_TOKEN` | Alias for `KV_REST_API_TOKEN` |

Blob wins when `BLOB_READ_WRITE_TOKEN` is set; else a complete `KV_*` or `UPSTASH_REDIS_REST_*` pair. Memory only if none of those are set. Responses include `storage: "blob" | "kv" | "memory"` — wipeout treats any non-memory value as posted.

In the Vercel dashboard: connect a **private Blob** store (or **Storage → KV / Upstash**), then redeploy. Never commit `.env.local`.

**Demo seeds:** fake board rows are **off in production** unless `ALLOW_DEMO_LEADERBOARD=1`. In development they still fill an empty board. An empty production board shows clear empty-state copy (not a fake-full list).

| Env var | Purpose |
|---------|---------|
| `ALLOW_DEMO_LEADERBOARD` | Set to `1` to force demo seeds even in production (local/staging only) |

**David / deploy:** Blob token on the project persists the daily board. Reminders still use the KV / Upstash REST pair.

### Growth analytics
- `@vercel/analytics` + `@vercel/speed-insights` in the root layout (free tier).
- Client events: `play_start`, `play_wipeout`, `challenge_open` (beat), `share_click` (channel wa|x|copy|native|card), `board_submit`, `reminder_optin`, `sibling_click` (`from: push`, `surface: wipeout|victory|landing|play`), `race_create`, `race_join`, `race_score`, `race_share`.
- Optional `GET /api/stats` — `{ dayKey, boardEntriesToday, reminderCount, storage, demoAllowed }` (no PII).

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
- Optional Vercel Blob (daily board) + KV / Upstash (board fallback + reminder emails)
- Optional Resend (`RESEND_API_KEY`) for welcome mail; otherwise capture-only
- No accounts, no company branding

## Streamers (OBS)

OBS pack (Phase 1). Live setup: [https://pushflappy.com/streamers](https://pushflappy.com/streamers). Repo notes: [STREAMERS.md](./STREAMERS.md).

- **Play Browser Source:** [https://pushflappy.com/stream](https://pushflappy.com/stream) (same as `/play?obs=1`)
- **Recommended size:** 1920×1080
- **Chest/cam:** phone face-up on the floor, or webcam on a plank — allow camera, hold the top of a push-up; existing 3-2-1 starts on its own
- **Viewer dare:** chat opens the beat-me link on their phone (`/play?beat={score}`)
- **Optional second source:** [https://pushflappy.com/overlay](https://pushflappy.com/overlay) — read-only daily board, no camera
- **Race overlay:** [https://pushflappy.com/race/{id}/overlay](https://pushflappy.com/race) — live race top-10, no camera

Do not add paid Twitch Extensions or a `!beat` bot here.

## Routes

| Path | Description |
|------|-------------|
| `/` | Marketing / how-to-play + Start CTA |
| `/play` | Fullscreen camera game (`?beat=N` challenge; `?obs=1` capture chrome) |
| `/stream` | OBS play view (same game, no marketing chrome, larger HUD) — noindex |
| `/streamers` | Human/SEO OBS setup (Browser Source, cam, plank, overlays) |
| `/overlay` | Read-only daily board widget for a second Browser Source |
| `/race` | Mint a race link |
| `/race/[id]` | Join + live top-10 (camera-free spectate). `?obs=1` = overlay |
| `/race/[id]/overlay` | OBS race board, no chrome |
| `/api/leaderboard` | Daily board GET/POST |
| `/api/race` | `POST` mint / ensure a race |
| `/api/race/[id]` | `GET` board; `POST` score (`0`/`0` = join, names before play) |
| `/api/reminders` | Email reminder capture POST |
| `/board` | Camera-free daily board + reminder opt-in |

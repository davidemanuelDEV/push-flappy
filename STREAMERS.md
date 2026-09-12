# Stream Push Flappy (OBS)

**Live setup page:** [https://pushflappy.com/streamers](https://pushflappy.com/streamers)

Phase 1 streamer pack — play view + optional board widget. Chat `!beat` bots stay out of scope. Race overlay is a second Browser Source (no Twitch Extension).

## Browser Source (play)

**URL:** [https://pushflappy.com/stream](https://pushflappy.com/stream)  
Same crop: [https://pushflappy.com/play?obs=1](https://pushflappy.com/play?obs=1)

**Recommended size:** `1920 × 1080` (16:9). Dark margins sit outside the playfield so a scene crop stays clean.

1. OBS → **Sources → Browser** → URL above, width 1920, height 1080.
2. Allow the camera when Chromium prompts (OBS is its own browser).
3. Hold a plank until **Start position set** — the existing **3-2-1** countdown starts on its own. Drop to dive; press up to rise.

`/stream` hides Home / Board / Squat promo / FAQ chrome that fights a 1080p capture. Score and beat-me target render larger on the HUD.

### Chest / cam

Phone face-up on the floor under you, or a webcam aimed at a push-up plank (shoulders visible). Same setup as `/play`.

### Dare the streamer

Viewers open the **beat-me / challenge link on their phone** — `https://pushflappy.com/play?beat={score}` (optional `&reps=`). Wipeout still leads with **Challenge a friend**. No Twitch Extension or chat bot in this pack.

Streamer can also load a target on the capture:  
`https://pushflappy.com/stream?beat=12`

## Optional board widget (second Browser Source)

**URL:** [https://pushflappy.com/overlay](https://pushflappy.com/overlay)  
Suggested size: `480 × 1080` (sidebar) or `720 × 720`. No camera. Polls `GET /api/leaderboard` for today’s Pacific board.

### Race board (same idea)

Mint a race at [https://pushflappy.com/race](https://pushflappy.com/race), then add:

**URL:** `https://pushflappy.com/race/{id}/overlay`  
(or `/race/{id}?obs=1`)

Polls `GET /api/race/{id}` ~1s — nicks appear as soon as someone joins (score 0), then live scores as pipes are cleared (latest per nick, cap 10). Players see the same board on `/play?race={id}` while flying. Viewers join via the same `/race/{id}` link on their phone (name first, then `/play?race={id}`). Async scores, not lockstep frames.

## Docs in the app

This file + the README **Streamers (OBS)** section. `/stream` is the play view, not a marketing page.

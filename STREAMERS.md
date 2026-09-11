# Stream Push Flappy (OBS)

Phase 1 streamer pack — play view + optional board widget. Chat `!beat` bots and live race boards are later.

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

## Docs in the app

This file + the README **Streamers (OBS)** section. `/stream` is the play view, not a marketing page.

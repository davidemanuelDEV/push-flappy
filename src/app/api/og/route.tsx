import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

function parseScore(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

const GUIDE_OG: Record<
  string,
  { kicker: string; headline: string; sub: string }
> = {
  webcam: {
    kicker: "How to play",
    headline: "Webcam push-up Flappy",
    sub: "Your torso is the bird",
  },
  obs: {
    kicker: "OBS",
    headline: "Push-up overlay",
    sub: "Browser Source · 1920×1080",
  },
  race: {
    kicker: "Race friends",
    headline: "Async fitness race",
    sub: "Nick first · live top-10",
  },
  squat: {
    kicker: "Same family",
    headline: "Squat Flappy",
    sub: "Arms cooked? Legs next",
  },
};

function clipOgTitle(raw: string | null): string | null {
  if (!raw) return null;
  const title = raw.trim().replace(/\s+/g, " ");
  if (title.length < 2 || title.length > 32) return null;
  if (!/^[\p{L}\p{N} .,'!?\-:&()+#]+$/u.test(title)) return null;
  return title;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const guideKey = (searchParams.get("guide") ?? "").trim().toLowerCase();
  const guide = GUIDE_OG[guideKey];
  const raceTitle = clipOgTitle(searchParams.get("title"));
  const beat = parseScore(searchParams.get("beat")) ?? 0;
  const reps = parseScore(searchParams.get("reps"));
  const sub = guide
    ? guide.sub
    : raceTitle
      ? "Nick first · live top-10"
      : reps != null && reps > 0
        ? `${reps} push-ups`
        : "pipes cleared — beat me";
  const headline = guide ? guide.headline : raceTitle ? raceTitle : String(beat);
  const kicker = guide ? guide.kicker : raceTitle ? "Race friends" : "Push Flappy";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background:
            "linear-gradient(180deg, #0c122a 0%, #1c1624 40%, #3a2012 75%, #2a180a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* copper glow */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 420,
            width: 360,
            height: 360,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(184,115,51,0.55) 0%, rgba(184,115,51,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            zIndex: 1,
          }}
        >
          <div
            style={{
              color: "#fbbf24",
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </div>

          {/* geometric bird — simple ellipses via nested divs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 12,
              marginBottom: 8,
              position: "relative",
              width: 120,
              height: 90,
            }}
          >
            <div
              style={{
                width: 88,
                height: 72,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 35% 30%, #ff6b5a 0%, #e8453c 45%, #8b1a14 100%)",
                border: "3px solid #3b0a08",
                display: "flex",
                position: "relative",
              }}
            />
            {/* Satori cannot render CSS border-triangles (they become rectangles). */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 28,
                width: 32,
                height: 28,
                display: "flex",
              }}
            >
              <svg width="32" height="28" viewBox="0 0 32 28">
                <polygon
                  points="0,2 32,14 0,26"
                  fill="#f5c542"
                  stroke="#7a4e0a"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div
              style={{
                position: "absolute",
                right: 36,
                top: 18,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#fff",
                border: "2px solid #1a0a08",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#1a1a1a",
                  display: "flex",
                }}
              />
            </div>
          </div>

          <div
            style={{
              color: "#fff8e7",
              fontSize: guide || raceTitle ? 64 : 160,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: guide || raceTitle ? -1 : -4,
              textAlign: "center",
              paddingLeft: 40,
              paddingRight: 40,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              color: "#d6b896",
              fontSize: 32,
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            {sub}
          </div>
          <div
            style={{
              marginTop: 28,
              color: "#fff8e7",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            {guide || raceTitle ? "Free in the browser" : "Think you can beat me?"}
          </div>
          <div
            style={{
              marginTop: 16,
              color: "#b87333",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            pushflappy.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

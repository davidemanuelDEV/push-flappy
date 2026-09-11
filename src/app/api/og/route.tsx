import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

function parseScore(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const beat = parseScore(searchParams.get("beat")) ?? 0;
  const reps = parseScore(searchParams.get("reps"));
  const sub =
    reps != null && reps > 0 ? `${reps} push-ups` : "pipes cleared — beat me";

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
            Push Flappy
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
              fontSize: 160,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -4,
            }}
          >
            {String(beat)}
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
            Think you can beat me?
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

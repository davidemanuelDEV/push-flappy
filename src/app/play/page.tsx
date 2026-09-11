import type { Metadata } from "next";
import PlayClient from "./PlayClient";

const SITE = "https://pushflappy.com";

type PlaySearch = {
  beat?: string | string[];
  reps?: string | string[];
};

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function parseNonNegInt(raw: string | undefined): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PlaySearch>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const beat = parseNonNegInt(first(sp.beat));
  const reps = parseNonNegInt(first(sp.reps));

  if (beat == null) {
    return {
      title: "Play — Push Flappy",
      description:
        "Play Push Flappy with push-ups. Camera + on-device pose. Challenge friends with beat-me links.",
      openGraph: {
        title: "Play — Push Flappy",
        description:
          "Play Push Flappy with push-ups. Camera + on-device pose. Challenge friends with beat-me links.",
        url: `${SITE}/play`,
        type: "website",
        siteName: "Push Flappy",
        images: [
          {
            url: "/og.png",
            width: 1200,
            height: 630,
            alt: "Push Flappy",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Play — Push Flappy",
        description:
          "Play Push Flappy with push-ups. Camera + on-device pose. Challenge friends with beat-me links.",
        images: ["/og.png"],
      },
    };
  }

  const repsBit = reps != null && reps > 0 ? ` · ${reps} push-ups` : "";
  const title = `Beat my ${beat} on Push Flappy`;
  const description = `Think you can beat ${beat}${repsBit}? Open the link, allow camera, and clear more copper pipes with push-ups.`;
  const playUrl = new URL("/play", SITE);
  playUrl.searchParams.set("beat", String(beat));
  if (reps != null && reps > 0) playUrl.searchParams.set("reps", String(reps));

  const ogPath = new URL("/api/og", SITE);
  ogPath.searchParams.set("beat", String(beat));
  if (reps != null && reps > 0) ogPath.searchParams.set("reps", String(reps));

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: playUrl.toString(),
      type: "website",
      siteName: "Push Flappy",
      images: [
        {
          url: ogPath.toString(),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogPath.toString()],
    },
  };
}

export default function PlayPage() {
  return <PlayClient />;
}

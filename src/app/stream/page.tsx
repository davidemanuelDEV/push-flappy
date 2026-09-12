import type { Metadata } from "next";
import { canonicalUrl, ogImageUrl } from "@/lib/seo";
import PlayClient from "../play/PlayClient";

type StreamSearch = {
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
  searchParams: Promise<StreamSearch>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const beat = parseNonNegInt(first(sp.beat));
  const reps = parseNonNegInt(first(sp.reps));

  const ogImage = new URL(ogImageUrl());
  if (beat != null) {
    ogImage.searchParams.set("beat", String(beat));
    if (reps != null && reps > 0) ogImage.searchParams.set("reps", String(reps));
  }

  const title =
    beat != null ? `Beat my ${beat} on stream — Push Flappy` : "Stream — Push Flappy";
  const description =
    beat != null
      ? `OBS play view. Allow camera, hold a plank, then beat ${beat}.`
      : "OBS Browser Source play view for Push Flappy. Allow camera, hold a plank, existing 3-2-1 countdown.";

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl("/stream") },
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalUrl("/stream"),
      type: "website",
      siteName: "Push Flappy",
      images: [
        {
          url: ogImage.toString(),
          width: 1200,
          height: 630,
          alt: "Push Flappy stream",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.toString()],
    },
  };
}

/** OBS-friendly play — same game as /play, capture chrome hidden. */
export default function StreamPage() {
  return <PlayClient />;
}

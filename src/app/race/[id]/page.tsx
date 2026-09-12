import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RaceLobby from "@/components/RaceLobby";
import StreamOverlay from "@/components/StreamOverlay";
import { sanitizeRaceId } from "@/lib/race";

const SITE = "https://pushflappy.com";

type RaceParams = { id: string };
type RaceSearch = { obs?: string | string[] };

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RaceParams>;
}): Promise<Metadata> {
  const { id: raw } = await params;
  const id = sanitizeRaceId(raw);
  const ogImage = new URL("/api/og", SITE).toString();
  if (!id) {
    return { title: "Race — Push Flappy" };
  }
  const title = `Race ${id.toUpperCase()} — Push Flappy`;
  const description =
    "Same pipes. Live top-10. Open play or spectate this race — no camera needed to watch.";
  const url = `${SITE}/race/${id}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Push Flappy",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function RaceIdPage({
  params,
  searchParams,
}: {
  params: Promise<RaceParams>;
  searchParams: Promise<RaceSearch>;
}) {
  const { id: raw } = await params;
  const id = sanitizeRaceId(raw);
  if (!id) notFound();
  const sp = await searchParams;
  const obs = first(sp.obs) === "1";
  if (obs) return <StreamOverlay raceId={id} />;
  return <RaceLobby raceId={id} />;
}

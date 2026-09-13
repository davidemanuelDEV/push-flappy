import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RaceLobby from "@/components/RaceLobby";
import StreamOverlay from "@/components/StreamOverlay";
import { raceDisplayTitle, sanitizeRaceId } from "@/lib/race";
import { getRace } from "@/lib/race-store";
import { canonicalUrl, ogImageUrl } from "@/lib/seo";

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
  if (!id) {
    return {
      title: "Race — Push Flappy",
      alternates: { canonical: canonicalUrl("/race") },
    };
  }
  const race = await getRace(id);
  const heading = raceDisplayTitle(id, race?.title);
  const title = race?.title
    ? `${heading} — Push Flappy`
    : `Race ${id.toUpperCase()} — Push Flappy`;
  const description =
    "Same pipes. Put a nick on the live top-10, then play — or spectate with no camera.";
  const url = canonicalUrl(`/race/${id}`);
  const ogImage = ogImageUrl(race?.title ? { title: race.title } : undefined);
  return {
    title,
    description,
    alternates: { canonical: url },
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

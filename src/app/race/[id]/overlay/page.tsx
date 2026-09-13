import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StreamOverlay from "@/components/StreamOverlay";
import { raceDisplayTitle, sanitizeRaceId } from "@/lib/race";
import { getRace } from "@/lib/race-store";
import { canonicalUrl } from "@/lib/seo";

type RaceParams = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<RaceParams>;
}): Promise<Metadata> {
  const { id: raw } = await params;
  const id = sanitizeRaceId(raw);
  const race = id ? await getRace(id) : null;
  const heading = id ? raceDisplayTitle(id, race?.title) : "Race overlay";
  const title = id
    ? race?.title
      ? `${heading} overlay — Push Flappy`
      : `Race overlay ${id.toUpperCase()} — Push Flappy`
    : "Race overlay — Push Flappy";
  const url = id
    ? canonicalUrl(`/race/${id}/overlay`)
    : canonicalUrl("/race");
  return {
    title,
    description: "OBS race board — big ranks, no camera, polls live scores.",
    alternates: { canonical: url },
    openGraph: {
      title,
      description: "OBS race board — big ranks, no camera.",
      url,
      type: "website",
      siteName: "Push Flappy",
    },
  };
}

export default async function RaceOverlayPage({
  params,
}: {
  params: Promise<RaceParams>;
}) {
  const { id: raw } = await params;
  const id = sanitizeRaceId(raw);
  if (!id) notFound();
  return <StreamOverlay raceId={id} />;
}

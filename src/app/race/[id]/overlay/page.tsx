import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StreamOverlay from "@/components/StreamOverlay";
import { sanitizeRaceId } from "@/lib/race";

const SITE = "https://pushflappy.com";

type RaceParams = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<RaceParams>;
}): Promise<Metadata> {
  const { id: raw } = await params;
  const id = sanitizeRaceId(raw);
  const title = id
    ? `Race overlay ${id.toUpperCase()} — Push Flappy`
    : "Race overlay — Push Flappy";
  return {
    title,
    description: "OBS race board — big ranks, no camera, polls live scores.",
    openGraph: {
      title,
      description: "OBS race board — big ranks, no camera.",
      url: id ? `${SITE}/race/${id}/overlay` : `${SITE}/race`,
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

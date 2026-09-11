import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RaceCreate from "@/components/RaceCreate";
import { sanitizeRaceId } from "@/lib/race";

const SITE = "https://pushflappy.com";
const ogImage = new URL("/api/og", SITE).toString();

export const metadata: Metadata = {
  title: "Race friends — Push Flappy",
  description:
    "Mint one link. Friends play the same pipes and a live top-10 updates as wipeouts post. No accounts.",
  openGraph: {
    title: "Race friends — Push Flappy",
    description:
      "Mint one link. Friends play the same pipes and a live top-10 updates as wipeouts post. No accounts.",
    url: `${SITE}/race`,
    type: "website",
    siteName: "Push Flappy",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Push Flappy race" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Race friends — Push Flappy",
    description:
      "Mint one link. Friends play the same pipes and a live top-10 updates as wipeouts post.",
    images: [ogImage],
  },
};

type RaceSearch = { code?: string | string[] };

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function RaceIndexPage({
  searchParams,
}: {
  searchParams: Promise<RaceSearch>;
}) {
  const sp = await searchParams;
  const id = sanitizeRaceId(first(sp.code));
  if (id) redirect(`/race/${id}`);
  return <RaceCreate />;
}

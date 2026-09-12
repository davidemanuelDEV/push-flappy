import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RaceCreate from "@/components/RaceCreate";
import { sanitizeRaceId } from "@/lib/race";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Race friends — Push Flappy",
  description:
    "Mint one link. Friends play the same pipes and a live top-10 updates as scores tick. No accounts. Spectate without a camera.",
  path: "/race",
  imageAlt: "Push Flappy race",
});

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

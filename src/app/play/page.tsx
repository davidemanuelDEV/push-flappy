import type { Metadata } from "next";
import Link from "next/link";
import { sanitizeRaceId } from "@/lib/race";
import { canonicalUrl, ogImageUrl, pageMetadata } from "@/lib/seo";
import PlayClient from "./PlayClient";

type PlaySearch = {
  beat?: string | string[];
  reps?: string | string[];
  race?: string | string[];
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
  const race = sanitizeRaceId(first(sp.race));

  const ogImage = new URL(ogImageUrl());
  const playCanonical = { alternates: { canonical: canonicalUrl("/play") } };

  if (race) {
    const title = `Race ${race.toUpperCase()} — Push Flappy`;
    const description =
      "Same pipes as this race. Live top-10 updates while you fly. Camera to play; spectate on the race link.";
    return {
      ...playCanonical,
      title,
      description,
      openGraph: {
        title,
        description,
        url: canonicalUrl("/play"),
        type: "website",
        siteName: "Push Flappy",
        images: [{ url: ogImage.toString(), width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage.toString()],
      },
    };
  }

  if (beat == null) {
    return pageMetadata({
      title: "Play — Push Flappy",
      description:
        "Play Push Flappy with push-ups. Camera + on-device pose. Challenge friends with beat-me links.",
      path: "/play",
    });
  }

  const repsBit = reps != null && reps > 0 ? ` · ${reps} push-ups` : "";
  const title = `Beat my ${beat} on Push Flappy`;
  const description = `Think you can beat ${beat}${repsBit}? Open the link, allow camera, and clear more copper pipes with push-ups.`;
  ogImage.searchParams.set("beat", String(beat));
  if (reps != null && reps > 0) ogImage.searchParams.set("reps", String(reps));

  return {
    ...playCanonical,
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl("/play"),
      type: "website",
      siteName: "Push Flappy",
      images: [
        {
          url: ogImage.toString(),
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
      images: [ogImage.toString()],
    },
  };
}

/** SSR teaser so crawlers see an H1 + definition instead of “Loading game…”. */
function PlaySeoTeaser() {
  return (
    <section className="sr-only">
      <h1>Play Push Flappy</h1>
      <p>
        Browser push-up Flappy. Your torso is the bird. On-device pose. No
        account.
      </p>
      <p>
        <Link href="/faq">FAQ</Link>
        {" · "}
        <Link href="/board">Daily board</Link>
      </p>
    </section>
  );
}

export default function PlayPage() {
  return (
    <>
      <PlaySeoTeaser />
      <PlayClient />
    </>
  );
}

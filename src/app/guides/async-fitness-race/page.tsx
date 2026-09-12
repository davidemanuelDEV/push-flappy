import type { Metadata } from "next";
import Link from "next/link";
import { GuideCard, GuidePage } from "@/components/GuidePage";
import { guideOgUrl, pageMetadata } from "@/lib/seo";

const path = "/guides/async-fitness-race";

export const metadata: Metadata = pageMetadata({
  title: "Async fitness race — Push Flappy",
  description:
    "Mint one link. Friends enter a nick first, then play the same pipes. Live top-10, spectators, no accounts.",
  path,
  imageAlt: "Async fitness race",
  imageUrl: guideOgUrl("race"),
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Start an async Push Flappy race",
  description:
    "Share one race link. Nicks land on the live top-10 before anyone flies. Spectators need no camera.",
  step: [
    {
      "@type": "HowToStep",
      name: "Mint a link",
      text: "Open /race and start a race. One share URL like /race/abc12.",
    },
    {
      "@type": "HowToStep",
      name: "Nick first",
      text: "Friends enter a nick (2–16 letters/numbers). That name lands on the live top-10 at 0.",
    },
    {
      "@type": "HowToStep",
      name: "Same pipes",
      text: "Everyone plays the same seed. Scores update on the live board. Not lockstep multiplayer.",
    },
    {
      "@type": "HowToStep",
      name: "Spectate",
      text: "Watch on the race page or /race/{id}/overlay without a camera.",
    },
  ],
};

export default function AsyncRaceGuidePage() {
  return (
    <GuidePage
      kicker="Race · Live top-10"
      title="Async fitness race"
      lede="One link. Nick first. Same pipes. A live top-10 — spectators welcome, no accounts."
      jsonLd={jsonLd}
      primaryHref="/race"
      primaryLabel="Start a race"
      secondaryHref="/faq"
      secondaryLabel="FAQ"
    >
      <GuideCard title="Nick first">
        <p>
          Friends tap the share link and enter a nick (2–16 letters/numbers)
          before play unlocks. That name lands on the live top-10 at score 0 so
          the board has faces before anyone flies.
        </p>
      </GuideCard>
      <GuideCard title="Async top-10, not lockstep">
        <p>
          Everyone faces the same pipe seed. Scores tick on the compact in-play
          board and on the race page. Latest score per nick, cap about 10. This
          is async scores — not frame-sync multiplayer.
        </p>
      </GuideCard>
      <GuideCard title="Spectators">
        <p>
          Stay on{" "}
          <Link
            href="/race"
            className="font-semibold text-amber-200/90 underline-offset-2 hover:underline"
          >
            /race
          </Link>{" "}
          or add{" "}
          <code className="text-amber-100/80">/race/{"{id}"}/overlay</code> in
          OBS. No camera required to watch. Streamers checklist:{" "}
          <Link
            href="/streamers"
            className="font-semibold text-amber-200/90 underline-offset-2 hover:underline"
          >
            Streamers / OBS
          </Link>
          .
        </p>
      </GuideCard>
    </GuidePage>
  );
}

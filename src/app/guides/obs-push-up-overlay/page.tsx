import type { Metadata } from "next";
import Link from "next/link";
import { GuideCard, GuidePage } from "@/components/GuidePage";
import { guideOgUrl, pageMetadata } from "@/lib/seo";

const path = "/guides/obs-push-up-overlay";

export const metadata: Metadata = pageMetadata({
  title: "OBS push-up overlay — Push Flappy",
  description:
    "Add Push Flappy to OBS. Browser Source https://pushflappy.com/stream at 1920×1080. Optional /overlay and race overlay.",
  path,
  imageAlt: "OBS push-up overlay setup",
  imageUrl: guideOgUrl("obs"),
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Add a push-up Flappy overlay in OBS",
  description:
    "Chrome-free Browser Source play view, optional daily board widget, and live race overlay.",
  step: [
    {
      "@type": "HowToStep",
      name: "Play view",
      text: "Add https://pushflappy.com/stream as a Browser Source at 1920×1080.",
    },
    {
      "@type": "HowToStep",
      name: "Camera and plank",
      text: "Allow the camera. Hold a plank until the 3-2-1 countdown starts.",
    },
    {
      "@type": "HowToStep",
      name: "Board widget",
      text: "Optional second source: https://pushflappy.com/overlay — no camera.",
    },
    {
      "@type": "HowToStep",
      name: "Race overlay",
      text: "For a live race board use https://pushflappy.com/race/{id}/overlay.",
    },
  ],
};

export default function ObsOverlayGuidePage() {
  return (
    <GuidePage
      kicker="OBS · Overlay"
      title="OBS push-up overlay"
      lede="Chrome-free play view for OBS. Viewers dare you with beat-me links from their phone."
      jsonLd={jsonLd}
      primaryHref="/streamers"
      primaryLabel="Full streamers setup"
      secondaryHref="/faq"
      secondaryLabel="FAQ"
    >
      <GuideCard title="Browser Source">
        <p>
          URL:{" "}
          <code className="text-amber-100/80">https://pushflappy.com/stream</code>
          . Size: <strong className="font-semibold text-stone-200">1920×1080</strong>.
          Same crop as <code className="text-amber-100/80">/play?obs=1</code>.
          Allow the camera, hold a plank, and the usual 3-2-1 starts.
        </p>
      </GuideCard>
      <GuideCard title="Optional /overlay">
        <p>
          Second Browser Source:{" "}
          <code className="text-amber-100/80">https://pushflappy.com/overlay</code>
          . Today’s Pacific board. No camera. Suggested 480×1080 or 720×720.
        </p>
      </GuideCard>
      <GuideCard title="Race overlay">
        <p>
          Mint a race at{" "}
          <Link
            href="/race"
            className="font-semibold text-amber-200/90 underline-offset-2 hover:underline"
          >
            /race
          </Link>
          , then add{" "}
          <code className="text-amber-100/80">
            https://pushflappy.com/race/{"{id}"}/overlay
          </code>
          . Async scores, not lockstep frames. Full checklist on{" "}
          <Link
            href="/streamers"
            className="font-semibold text-amber-200/90 underline-offset-2 hover:underline"
          >
            /streamers
          </Link>
          .
        </p>
      </GuideCard>
    </GuidePage>
  );
}

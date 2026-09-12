import type { Metadata } from "next";
import Link from "next/link";
import { GuideCard, GuidePage } from "@/components/GuidePage";
import { guideOgUrl, pageMetadata } from "@/lib/seo";

const path = "/guides/webcam-push-up-game";

export const metadata: Metadata = pageMetadata({
  title: "Webcam push-up game — Push Flappy",
  description:
    "Play Flappy in the browser with push-ups. Your torso is the bird. On-device pose, no account, no app.",
  path,
  imageAlt: "Webcam push-up Flappy how-to",
  imageUrl: guideOgUrl("webcam"),
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Play Push Flappy with a webcam",
  description:
    "Use a phone or webcam so your torso height drives a Flappy bird through copper pipes.",
  step: [
    {
      "@type": "HowToStep",
      name: "Open the browser game",
      text: "Go to pushflappy.com/play on a phone or laptop over HTTPS. No app, no account.",
    },
    {
      "@type": "HowToStep",
      name: "Allow the camera",
      text: "Place the phone face-up on the floor or face a webcam. Allow camera permission.",
    },
    {
      "@type": "HowToStep",
      name: "Lock plank height",
      text: "Hold the top of a push-up so pose can map torso height to the bird.",
    },
    {
      "@type": "HowToStep",
      name: "Clear copper pipes",
      text: "Drop to dive, press up to rise. Frames stay on your device.",
    },
  ],
};

export default function WebcamPushUpGuidePage() {
  return (
    <GuidePage
      kicker="How to · Browser"
      title="Webcam push-up game"
      lede="Browser Flappy you play with push-ups. Your torso is the bird. Pose stays on-device."
      jsonLd={jsonLd}
      primaryHref="/play"
      primaryLabel="Start playing"
      secondaryHref="/faq"
      secondaryLabel="Read the FAQ"
    >
      <GuideCard title="Your torso is the bird">
        <p>
          Push Flappy is a free browser game — no app. A phone or webcam plus
          on-device pose tracking maps your torso height to the bird’s Y. Drop
          into a push-up to dive through copper pipes; press up to rise.
        </p>
      </GuideCard>
      <GuideCard title="Privacy stays on-device">
        <p>
          MediaPipe Pose runs in the browser. Video frames are for tracking on
          your device; we do not upload the camera feed for pose. Daily board
          posts are an optional anonymous nick + emoji.
        </p>
      </GuideCard>
      <GuideCard title="No account">
        <p>
          Local high score stays on the device. Challenge friends with a beat-me
          link. Browse the{" "}
          <Link
            href="/board"
            className="font-semibold text-amber-200/90 underline-offset-2 hover:underline"
          >
            daily board
          </Link>{" "}
          without turning the camera on.
        </p>
      </GuideCard>
    </GuidePage>
  );
}

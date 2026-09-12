import type { Metadata } from "next";
import StreamOverlay from "@/components/StreamOverlay";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Overlay — Push Flappy",
  description:
    "Read-only daily board widget for OBS. No camera. Polls today’s leaderboard.",
  path: "/overlay",
  index: false,
  imageAlt: "Push Flappy overlay",
});

export default function OverlayPage() {
  return <StreamOverlay />;
}

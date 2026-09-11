import type { Metadata } from "next";
import StreamOverlay from "@/components/StreamOverlay";

const SITE = "https://pushflappy.com";
const ogImage = new URL("/api/og", SITE).toString();

export const metadata: Metadata = {
  title: "Overlay — Push Flappy",
  description:
    "Read-only daily board widget for OBS. No camera. Polls today’s leaderboard.",
  openGraph: {
    title: "Overlay — Push Flappy",
    description:
      "Read-only daily board widget for OBS. No camera. Polls today’s leaderboard.",
    url: `${SITE}/overlay`,
    type: "website",
    siteName: "Push Flappy",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Push Flappy overlay" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Overlay — Push Flappy",
    description:
      "Read-only daily board widget for OBS. No camera. Polls today’s leaderboard.",
    images: [ogImage],
  },
};

export default function OverlayPage() {
  return <StreamOverlay />;
}

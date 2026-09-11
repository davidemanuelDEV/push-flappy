import type { Metadata } from "next";
import DailyBoardPage from "@/components/DailyBoardPage";

const SITE = "https://pushflappy.com";
const ogImage = new URL("/api/og", SITE).toString();

export const metadata: Metadata = {
  title: "Daily board — Push Flappy",
  description:
    "Today’s Push Flappy daily board (Pacific pipe seed). No camera required.",
  openGraph: {
    title: "Daily board — Push Flappy",
    description:
      "Today’s Push Flappy daily board (Pacific pipe seed). No camera required.",
    url: `${SITE}/board`,
    type: "website",
    siteName: "Push Flappy",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Push Flappy daily board",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily board — Push Flappy",
    description:
      "Today’s Push Flappy daily board (Pacific pipe seed). No camera required.",
    images: [ogImage],
  },
};

export default function BoardRoute() {
  return <DailyBoardPage />;
}

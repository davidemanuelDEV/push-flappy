import type { Metadata } from "next";
import DailyBoardPage from "@/components/DailyBoardPage";

const SITE = "https://pushflappy.com";

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
        url: "/og.png",
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
    images: ["/og.png"],
  },
};

export default function BoardRoute() {
  return <DailyBoardPage />;
}

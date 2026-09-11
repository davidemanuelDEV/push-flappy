import type { Metadata } from "next";
import DailyBoardPage from "@/components/DailyBoardPage";

export const metadata: Metadata = {
  title: "Daily board — Push Flappy",
  description:
    "Today’s Push Flappy daily board (Pacific pipe seed). No camera required.",
};

export default function BoardRoute() {
  return <DailyBoardPage />;
}

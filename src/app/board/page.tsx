import type { Metadata } from "next";
import Link from "next/link";
import DailyBoardPage from "@/components/DailyBoardPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Daily board — Push Flappy",
  description:
    "Today’s Push Flappy daily board (Pacific pipe seed). Same copper pipes for everyone. Browse without a camera — no account.",
  path: "/board",
  imageAlt: "Push Flappy daily board",
});

export default function BoardRoute() {
  return (
    <>
      <section className="sr-only">
        <h1>Daily board</h1>
        <p>
          Same pipe seed every day (Pacific time). Anonymous nick + emoji — no
          account. No camera required to browse.
        </p>
        <p>
          <Link href="/play">Play</Link>
          {" · "}
          <Link href="/faq">FAQ</Link>
        </p>
      </section>
      <DailyBoardPage />
    </>
  );
}

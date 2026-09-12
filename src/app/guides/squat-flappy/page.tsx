import type { Metadata } from "next";
import Link from "next/link";
import { GuideCard, GuidePage } from "@/components/GuidePage";
import { SQUAT_FLAPPY_ORIGIN, SQUAT_FLAPPY_PLAY_URL } from "@/lib/sibling";
import { guideOgUrl, pageMetadata } from "@/lib/seo";

const path = "/guides/squat-flappy";

export const metadata: Metadata = pageMetadata({
  title: "Squat Flappy — same family as Push Flappy",
  description:
    "Push Flappy is push day. Squat Flappy is the squat-camera sibling — same Flappy pipes idea, legs instead of arms. Free in the browser.",
  path,
  imageAlt: "Squat Flappy family",
  imageUrl: guideOgUrl("squat"),
});

export default function SquatFlappyGuidePage() {
  return (
    <GuidePage
      kicker="Family · Legs day"
      title="Squat Flappy"
      lede="Same copper-pipe idea, different day. Push Flappy is arms. Squat Flappy is legs."
      primaryHref={SQUAT_FLAPPY_PLAY_URL}
      primaryLabel="Play Squat Flappy"
      secondaryHref="/play"
      secondaryLabel="Stay on Push Flappy"
    >
      <GuideCard title="Why two games">
        <p>
          Push Flappy is a free browser push-up Flappy — torso height is the
          bird, no app, no account. When arms are cooked, the sibling game is{" "}
          <a
            href={SQUAT_FLAPPY_ORIGIN}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-amber-200/90 underline-offset-2 hover:underline"
          >
            squatflappy.com
          </a>
          : same pipe-clearing dare, driven by squats instead of push-ups.
        </p>
      </GuideCard>
      <GuideCard title="What stays the same">
        <p>
          Camera in the browser. On-device pose. Beat-me links. Geometric bird
          and copper pipes — original art, not copyrighted sprites. You can
          bounce between{" "}
          <Link
            href="/play"
            className="font-semibold text-amber-200/90 underline-offset-2 hover:underline"
          >
            /play
          </Link>{" "}
          here and Squat Flappy without creating an account.
        </p>
      </GuideCard>
      <GuideCard title="Open the sibling">
        <p>
          <a
            href={SQUAT_FLAPPY_ORIGIN}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-amber-200/90 underline-offset-2 hover:underline"
          >
            {SQUAT_FLAPPY_ORIGIN.replace("https://", "")}
          </a>
          {" · "}
          <a
            href={SQUAT_FLAPPY_PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-amber-200/90 underline-offset-2 hover:underline"
          >
            Play now
          </a>
        </p>
      </GuideCard>
    </GuidePage>
  );
}

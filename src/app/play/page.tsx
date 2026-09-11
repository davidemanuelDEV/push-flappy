"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import PlaySplash from "@/components/PlaySplash";

const PushFlappyGame = dynamic(() => import("@/components/PushFlappyGame"), {
  ssr: false,
  loading: () => <PlaySplash label="Loading game…" />,
});

export default function PlayPage() {
  useEffect(() => {
    document.body.classList.add("play-lock");
    return () => {
      document.body.classList.remove("play-lock");
    };
  }, []);

  return (
    <Suspense fallback={<PlaySplash label="Loading game…" />}>
      <PushFlappyGame />
    </Suspense>
  );
}

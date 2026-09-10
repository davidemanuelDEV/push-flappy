"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

const PushFlappyGame = dynamic(() => import("@/components/PushFlappyGame"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[100dvh] items-center justify-center bg-zinc-950 text-white">
      <p className="text-lg font-medium">Loading game…</p>
    </div>
  ),
});

export default function PlayPage() {
  useEffect(() => {
    document.body.classList.add("play-lock");
    return () => {
      document.body.classList.remove("play-lock");
    };
  }, []);

  return <PushFlappyGame />;
}

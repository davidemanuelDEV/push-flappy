"use client";

import { useEffect, useState } from "react";
import { hasFlapped } from "@/lib/install-flag";

/** Subtle “Add to Home Screen” tip for iOS Safari (no beforeinstallprompt there). */
export default function IosInstallTip() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("pf-ios-tip-dismissed") === "1") return;
    } catch {
      /* ignore */
    }
    const ua = navigator.userAgent || "";
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true;
    // Soft PWA tip only after a successful flap — never on a cold first load.
    if (isIOS && !isStandalone && hasFlapped()) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="rounded-2xl border border-amber-900/45 bg-stone-900/70 px-4 py-3 text-sm text-stone-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-amber-50">Add to Home Screen</p>
          <p className="mt-1 leading-relaxed text-stone-400">
            In Safari, tap <span className="text-amber-100">Share</span> →{" "}
            <span className="text-amber-100">Add to Home Screen</span> for a
            full-screen app icon.
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          className="min-h-11 min-w-11 shrink-0 rounded-xl text-stone-500 hover:text-amber-100"
          onClick={() => {
            try {
              localStorage.setItem("pf-ios-tip-dismissed", "1");
            } catch {
              /* ignore */
            }
            setShow(false);
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

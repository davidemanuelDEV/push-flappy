"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { MEDIAPIPE_WASM, POSE_MODEL } from "@/lib/constants";
import { cameraConstraints, loadHighScore, saveHighScore } from "@/lib/camera";
import {
  createInitialState,
  startGame,
  tick,
  birdRadius,
  birdX,
  type GameState,
} from "@/lib/game";
import { laDayKey } from "@/lib/daily";
import { track } from "@/lib/analytics";
import {
  mapNormToBirdY,
  PoseTracker,
  type CalibPhase,
  type Landmark,
} from "@/lib/pose";
import { drawBird, drawHud, drawPipes, drawPlayfield } from "@/lib/draw";
import {
  createCrashBurst,
  drawCrash,
  pickWipeoutLine,
  tickCrash,
  type CrashBurst,
} from "@/lib/crash";
import {
  buildSharePayload,
  downloadShareCard,
  openShareWindow,
  parseBeatFromSearch,
  renderShareCard,
  shareCardFile,
  shareOrCopy,
  whatsappShareUrl,
  xIntentUrl,
  copyToClipboard,
} from "@/lib/share";
import {
  parseRaceFromSearch,
  racePath,
  RACE_POLL_MS,
  RACE_PROGRESS_MIN_MS,
  withLocalRaceScore,
} from "@/lib/race";
import { fetchRace, postRaceJoin, postRaceScore } from "@/lib/race-client";
import RaceLiveBoard from "@/components/RaceLiveBoard";
import type {
  LeaderboardEntry,
  LeaderboardStorage,
} from "@/lib/leaderboard-store";
import { sanitizeNick } from "@/lib/leaderboard-store";
import type { RaceEntry } from "@/lib/race-store";
import {
  CoachBanner,
  CountdownOverlay,
  GameOverPanel,
  LeaderboardPanel,
  OrientationTip,
  ReadyPanel,
} from "@/components/GamePanels";
import PlaySplash from "@/components/PlaySplash";
import SiblingPromoPill from "@/components/SiblingPromoPill";

type CamStatus = "idle" | "requesting" | "ready" | "error" | "denied";

const NICK_KEY = "push-flappy-nick";
const EMOJI_KEY = "push-flappy-emoji";

export default function PushFlappyGame() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const beatChallenge = parseBeatFromSearch(searchParams);
  const beatTarget = beatChallenge?.score ?? null;
  const raceId = parseRaceFromSearch(searchParams);
  const raceSeedRef = useRef<string | null>(null);
  /** Race play requires a real nick already on the board (lobby join). */
  const [raceAllowed, setRaceAllowed] = useState(!raceId);
  // Deep-link ?board=1 goes to dedicated camera-free /board
  const boardDeepLink = searchParams.get("board") === "1";
  // /stream and /play?obs=1 — OBS Browser Source crop (no marketing chrome)
  const obsMode = searchParams.get("obs") === "1" || pathname === "/stream";
  const obsModeRef = useRef(obsMode);
  obsModeRef.current = obsMode;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const trackerRef = useRef(new PoseTracker());
  const gameRef = useRef<GameState | null>(null);
  const lastTsRef = useRef(0);
  const lastBirdYRef = useRef(0);
  const rafRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const runningRef = useRef(true);
  const beatTargetRef = useRef<number | null>(beatTarget);
  const victoryFiredRef = useRef(false);
  const lastPoseSampleRef = useRef({
    hasPose: false,
    smoothedY: 0.5,
    reps: 0,
    calibPhase: "waiting" as CalibPhase,
    holdProgress: 0,
    mappedNorm: 0.5,
  });

  const [camStatus, setCamStatus] = useState<CamStatus>("idle");
  const [modelReady, setModelReady] = useState(false);
  const [hasPose, setHasPose] = useState(false);
  const [calibPhase, setCalibPhase] = useState<CalibPhase>("waiting");
  const [holdProgress, setHoldProgress] = useState(0);
  const [ui, setUi] = useState({
    status: "ready" as GameState["status"],
    score: 0,
    highScore: 0,
    reps: 0,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showOrientationTip, setShowOrientationTip] = useState(false);
  const [wipeoutLine, setWipeoutLine] = useState<string | null>(null);
  const [beatVictory, setBeatVictory] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const crashRef = useRef<CrashBurst | null>(null);
  const pendingWipeoutRef = useRef<string | null>(null);
  const lastWipeoutRef = useRef<string | null>(null);

  const [boardOpen, setBoardOpen] = useState(false);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [boardEntries, setBoardEntries] = useState<LeaderboardEntry[]>([]);
  const [boardStorage, setBoardStorage] = useState<LeaderboardStorage | null>(null);
  const [boardDay, setBoardDay] = useState(laDayKey());
  const [nick, setNick] = useState("Anon");
  const [emoji, setEmoji] = useState("🐦");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [scorePosted, setScorePosted] = useState(false);
  const scorePostedRef = useRef(false);
  const submittingRef = useRef(false);
  const autoPostedRef = useRef(false);
  const progressBusyRef = useRef(false);
  const pendingProgressRef = useRef<{ score: number; reps: number } | null>(
    null
  );
  const lastProgressAtRef = useRef(0);
  const lastPostedProgressRef = useRef({ score: 0, reps: 0 });
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    beatTargetRef.current = beatTarget;
    victoryFiredRef.current = false;
    setBeatVictory(false);
  }, [beatTarget]);

  useEffect(() => {
    if (beatTarget != null && beatTarget >= 0) {
      track("challenge_open", { beat: beatTarget });
    }
  }, [beatTarget]);

  useEffect(() => {
    if (!raceId) {
      setRaceAllowed(true);
      return;
    }
    let stored = "";
    let face = "🐦";
    try {
      stored = localStorage.getItem(NICK_KEY) ?? "";
      face = localStorage.getItem(EMOJI_KEY) || "🐦";
    } catch {
      /* ignore */
    }
    const clean = sanitizeNick(stored);
    if (!clean) {
      router.replace(racePath(raceId));
      return;
    }
    setNick(clean);
    setEmoji(face);
    setRaceAllowed(true);

    let cancelled = false;
    (async () => {
      try {
        const joined = await postRaceJoin(raceId, clean, face);
        if (cancelled) return;
        if (joined.seed) raceSeedRef.current = joined.seed;
        setBoardEntries(asBoardEntries(joined.entries ?? []));
        setBoardStorage(joined.storage);
        const g = gameRef.current;
        if (g && g.status === "ready" && g.seed !== joined.seed) {
          gameRef.current = {
            ...createInitialState(g.width, g.height, g.highScore, g.dayKey, joined.seed),
            birdY: g.birdY,
          };
        }
      } catch {
        try {
          const res = await fetch(
            `/api/race/${encodeURIComponent(raceId)}?ensure=1`,
            { cache: "no-store" }
          );
          if (!res.ok || cancelled) return;
          const data = (await res.json()) as {
            seed?: string;
            entries?: RaceEntry[];
            storage?: LeaderboardStorage;
          };
          if (typeof data.seed === "string") raceSeedRef.current = data.seed;
          if (data.entries) setBoardEntries(asBoardEntries(data.entries));
          if (data.storage) setBoardStorage(data.storage);
        } catch {
          /* daily seed fallback */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [raceId, router]);

  useEffect(() => {
    if (raceId) return;
    try {
      const n = localStorage.getItem(NICK_KEY);
      const e = localStorage.getItem(EMOJI_KEY);
      if (n) setNick(n);
      if (e) setEmoji(e);
    } catch {
      /* ignore */
    }
  }, [raceId]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const hs = gameRef.current?.highScore ?? loadHighScore();
    const day = laDayKey();
    if (!gameRef.current || gameRef.current.status === "ready") {
      gameRef.current = createInitialState(
        w,
        h,
        hs,
        day,
        raceSeedRef.current ?? undefined
      );
    } else {
      gameRef.current = { ...gameRef.current, width: w, height: h };
    }
  }, []);

  useEffect(() => {
    const update = () => {
      const portrait = window.matchMedia("(orientation: portrait)").matches;
      const narrow = window.innerWidth < 768;
      setShowOrientationTip(portrait && narrow);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  const stopCameraStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
  }, []);

  // Redirect legacy ?board=1 deep-link to camera-free /board (no getUserMedia / MediaPipe)
  useEffect(() => {
    if (!boardDeepLink) return;
    router.replace("/board");
  }, [boardDeepLink, router]);

  // Camera: only while board is closed and not on board / race-nick redirect
  useEffect(() => {
    if (boardDeepLink || boardOpen || !raceAllowed) {
      stopCameraStream();
      setCamStatus("idle");
      return;
    }
    let cancelled = false;
    async function initCam() {
      setCamStatus("requesting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: cameraConstraints(),
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        setCamStatus("ready");
      } catch (e) {
        const name = e instanceof DOMException ? e.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setCamStatus("denied");
          setErrorMsg("Camera permission denied. Allow camera access and reload.");
        } else {
          setCamStatus("error");
          setErrorMsg(e instanceof Error ? e.message : "Could not open camera.");
        }
      }
    }
    void initCam();
    return () => {
      cancelled = true;
      stopCameraStream();
    };
  }, [boardOpen, boardDeepLink, raceAllowed, stopCameraStream]);

  // Pose / MediaPipe: defer until board closed (and not redirecting to /board)
  useEffect(() => {
    if (boardDeepLink || boardOpen || !raceAllowed) return;
    let cancelled = false;
    async function initPose() {
      if (landmarkerRef.current) {
        setModelReady(true);
        return;
      }
      try {
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
        if (cancelled) return;
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: POSE_MODEL, delegate: "GPU" },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setModelReady(true);
      } catch (e) {
        console.error("Pose model failed (trying CPU)", e);
        try {
          const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
          if (cancelled) return;
          const landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: POSE_MODEL, delegate: "CPU" },
            runningMode: "VIDEO",
            numPoses: 1,
          });
          if (cancelled) {
            landmarker.close();
            return;
          }
          landmarkerRef.current = landmarker;
          setModelReady(true);
        } catch (e2) {
          console.error(e2);
          setErrorMsg("Failed to load pose model. Check network access to Google CDN / jsDelivr.");
        }
      }
    }
    void initPose();
    return () => {
      cancelled = true;
    };
  }, [boardOpen, boardDeepLink, raceAllowed]);

  // Unmount: always tear down camera + pose
  useEffect(() => {
    return () => {
      stopCameraStream();
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [stopCameraStream]);

  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(() => resizeCanvas());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("orientationchange", resizeCanvas);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", resizeCanvas);
    };
  }, [resizeCanvas]);

  useEffect(() => {
    const id = setInterval(() => {
      const g = gameRef.current;
      const sample = lastPoseSampleRef.current;
      if (!g) return;
      setUi({ status: g.status, score: g.score, highScore: g.highScore, reps: sample.reps });
      setHasPose(sample.hasPose);
      setCalibPhase(sample.calibPhase);
      setHoldProgress(sample.holdProgress);
      if (pendingWipeoutRef.current != null) {
        const line = pendingWipeoutRef.current;
        pendingWipeoutRef.current = null;
        lastWipeoutRef.current = line;
        setWipeoutLine(line);
      }
      if (g.status === "over") {
        saveHighScore(g.highScore);
        const target = beatTargetRef.current;
        if (target != null && g.score > target && !victoryFiredRef.current) {
          victoryFiredRef.current = true;
          setBeatVictory(true);
        }
      }
      if (g.status === "playing" && beatTargetRef.current != null && g.score > beatTargetRef.current && !victoryFiredRef.current) {
        victoryFiredRef.current = true;
        setBeatVictory(true);
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    runningRef.current = true;
    lastTsRef.current = 0;
    const loop = (ts: number) => {
      if (!runningRef.current) return;
      rafRef.current = requestAnimationFrame(loop);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (!gameRef.current) {
        gameRef.current = createInitialState(
          cssW,
          cssH,
          loadHighScore(),
          laDayKey(),
          raceSeedRef.current ?? undefined
        );
      }
      let state = gameRef.current;
      if (state.width !== cssW || state.height !== cssH) {
        state = { ...state, width: cssW, height: cssH };
        gameRef.current = state;
      }
      ctx.save();
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.translate(cssW, 0);
      ctx.scale(-1, 1);
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;
      const scale = Math.max(cssW / vw, cssH / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const ox = (cssW - dw) / 2;
      const oy = (cssH - dh) / 2;
      ctx.drawImage(video, ox, oy, dw, dh);
      ctx.restore();
      const landmarker = landmarkerRef.current;
      let birdY = state.birdY;
      if (landmarker && modelReady) {
        try {
          const result: PoseLandmarkerResult = landmarker.detectForVideo(video, ts);
          const lm = result.landmarks?.[0] as Landmark[] | undefined;
          const sample = trackerRef.current.update(lm ?? null, ts);
          lastPoseSampleRef.current = {
            hasPose: sample.hasPose,
            smoothedY: sample.smoothedY,
            reps: sample.reps,
            calibPhase: sample.calibPhase,
            holdProgress: sample.holdProgress,
            mappedNorm: sample.mappedNorm,
          };
          if (sample.hasPose) {
            const br = birdRadius(cssH);
            birdY = mapNormToBirdY(sample.mappedNorm, cssH, br);
          }
        } catch {
          /* transient */
        }
      }
      const dt = lastTsRef.current === 0 ? 0 : Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;
      const velHint = lastBirdYRef.current === 0 ? 0 : (birdY - lastBirdYRef.current) / Math.max(dt, 0.001) / cssH;
      lastBirdYRef.current = birdY;
      const prevStatus = state.status;
      if (state.status === "playing") {
        state = tick(state, dt, birdY);
      } else if (state.status !== "over") {
        state = { ...state, birdY };
      }
      if (prevStatus === "playing" && state.status === "over") {
        const bx = birdX(cssW);
        const br = birdRadius(cssH);
        crashRef.current = createCrashBurst(bx, state.birdY, Math.max(0.7, br / 14));
        const line = pickWipeoutLine(lastWipeoutRef.current);
        lastWipeoutRef.current = line;
        pendingWipeoutRef.current = line;
        track("play_wipeout", { score: state.score, reps: lastPoseSampleRef.current.reps });
      }
      gameRef.current = state;
      if (crashRef.current) {
        crashRef.current = tickCrash(crashRef.current, dt);
      }
      drawPlayfield(ctx, cssW, cssH);
      drawPipes(ctx, state);
      const crash = crashRef.current;
      const showBird = state.status !== "over" || (crash != null && crash.age < 0.07);
      if (showBird) {
        drawBird(ctx, state, state.status === "over" ? 0 : velHint);
      }
      if (crash) {
        drawCrash(ctx, crash);
      }
      drawHud(ctx, state, lastPoseSampleRef.current.reps, beatTargetRef.current, {
        capture: obsModeRef.current,
      });
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [modelReady]);

  const beginCalibration = () => {
    trackerRef.current.resetCalibration();
    setCalibPhase("waiting");
    setHoldProgress(0);
    lastPoseSampleRef.current = { ...lastPoseSampleRef.current, calibPhase: "waiting", holdProgress: 0, reps: 0 };
  };

  const clearCountdownTimer = () => {
    if (countdownTimerRef.current != null) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  const beginPlay = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    if (!trackerRef.current.isCalibrated) return;
    crashRef.current = null;
    pendingWipeoutRef.current = null;
    setWipeoutLine(null);
    setShareStatus(null);
    victoryFiredRef.current = false;
    setBeatVictory(false);
    setCountdown(null);
    autoPostedRef.current = false;
    scorePostedRef.current = false;
    submittingRef.current = false;
    pendingProgressRef.current = null;
    lastPostedProgressRef.current = { score: 0, reps: 0 };
    setScorePosted(false);
    setSubmitMsg(null);
    setSubmitting(false);
    const day = laDayKey();
    gameRef.current = startGame({
      ...createInitialState(
        g.width,
        g.height,
        loadHighScore(),
        day,
        raceSeedRef.current ?? undefined
      ),
      birdY: g.birdY,
    });
    setUi((u) => ({
      ...u,
      status: "playing",
      score: 0,
      reps: 0,
      highScore: loadHighScore(),
    }));
    track("play_start", {
      ...(beatTarget != null ? { beat: beatTarget } : {}),
      ...(obsMode ? { obs: 1 } : {}),
      ...(raceId ? { race: raceId } : {}),
    });
  }, [beatTarget, obsMode, raceId]);

  const onStart = () => {
    if (!gameRef.current) return;
    if (!trackerRef.current.isCalibrated) return;
    if (countdown != null) return;
    clearCountdownTimer();
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown == null) return;
    if (countdown <= 0) {
      clearCountdownTimer();
      beginPlay();
      return;
    }
    clearCountdownTimer();
    countdownTimerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c == null) return null;
        if (c <= 1) return 0;
        return c - 1;
      });
    }, 1000);
    return () => clearCountdownTimer();
  }, [countdown, beginPlay]);

  const onRestart = () => {
    const g = gameRef.current;
    if (!g) return;
    clearCountdownTimer();
    setCountdown(null);
    crashRef.current = null;
    pendingWipeoutRef.current = null;
    beginCalibration();
    setShareStatus(null);
    victoryFiredRef.current = false;
    setBeatVictory(false);
    autoPostedRef.current = false;
    scorePostedRef.current = false;
    submittingRef.current = false;
    pendingProgressRef.current = null;
    lastPostedProgressRef.current = { score: 0, reps: 0 };
    setScorePosted(false);
    setSubmitMsg(null);
    setSubmitting(false);
    gameRef.current = {
      ...createInitialState(
        g.width,
        g.height,
        loadHighScore(),
        laDayKey(),
        raceSeedRef.current ?? undefined
      ),
      birdY: g.birdY,
    };
    setUi((u) => ({ ...u, status: "ready", score: 0, reps: 0, highScore: loadHighScore() }));
  };

  const flashShareStatus = (result: string) => {
    if (result === "copied") setShareStatus("Copied!");
    else if (result === "shared") setShareStatus("Shared!");
    else if (result === "prompted") setShareStatus("Copy the text shown");
    else if (result === "saved") setShareStatus("Card saved");
    else if (result === "opened") setShareStatus("Opening share…");
    else setShareStatus(null);
  };

  const currentSharePayload = () =>
    buildSharePayload({
      mode: beatVictory && beatTarget != null ? "victory" : "challenge",
      score: ui.score,
      reps: ui.reps,
      wipeoutLine,
      beatTarget,
      raceId,
    });

  const trackShare = (channel: "wa" | "x" | "copy" | "native" | "card" | "primary") => {
    track("share_click", { channel, ...(raceId ? { race: raceId } : {}) });
    if (raceId) track("race_share", { race: raceId, channel });
  };

  const currentShareCard = () =>
    renderShareCard({
      score: ui.score,
      reps: ui.reps,
      wipeoutLine,
      beatTarget,
      mode: beatVictory && beatTarget != null ? "victory" : "challenge",
    });

  const onShareWhatsApp = () => {
    const payload = currentSharePayload();
    trackShare("wa");
    openShareWindow(whatsappShareUrl(payload.text));
    flashShareStatus("opened");
  };

  const onShareX = () => {
    const payload = currentSharePayload();
    trackShare("x");
    openShareWindow(xIntentUrl({ text: payload.textNoUrl, url: payload.url }));
    flashShareStatus("opened");
  };

  const onCopyLink = async () => {
    const payload = currentSharePayload();
    trackShare("copy");
    // Prefer beat-me URL; include full challenge text for paste-anywhere sharing.
    const result = await copyToClipboard(`${payload.text}`);
    flashShareStatus(result);
  };

  const onSaveCard = () => {
    trackShare("card");
    try {
      const card = currentShareCard();
      downloadShareCard(
        card,
        beatVictory ? "push-flappy-victory.png" : "push-flappy-challenge.png"
      );
      flashShareStatus("saved");
    } catch {
      setShareStatus("Couldn’t save card");
    }
  };

  const onShareMore = async () => {
    const payload = currentSharePayload();
    trackShare("native");
    let file: File | null = null;
    try {
      file = await shareCardFile(currentShareCard());
    } catch {
      file = null;
    }
    const result = await shareOrCopy({
      text: payload.text,
      url: payload.url,
      file,
    });
    flashShareStatus(result);
  };

  const onSharePrimary = async () => {
    const payload = currentSharePayload();
    trackShare("primary");
    const canNative =
      typeof navigator !== "undefined" && typeof navigator.share === "function";
    if (canNative) {
      let file: File | null = null;
      try {
        file = await shareCardFile(currentShareCard());
      } catch {
        file = null;
      }
      const result = await shareOrCopy({
        text: payload.text,
        url: payload.url,
        file,
      });
      flashShareStatus(result);
      return;
    }
    const mobileish =
      typeof window !== "undefined" &&
      (window.matchMedia("(max-width: 640px)").matches ||
        /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
    if (mobileish) {
      openShareWindow(whatsappShareUrl(payload.text));
      flashShareStatus("opened");
      return;
    }
    const result = await shareOrCopy({
      text: payload.text,
      url: payload.url,
    });
    flashShareStatus(result);
  };

  const loadBoard = useCallback(async () => {
    setBoardLoading(true);
    setBoardError(null);
    try {
      if (raceId) {
        const res = await fetch(`/api/race/${encodeURIComponent(raceId)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Board error ${res.status}`);
        const data = (await res.json()) as {
          entries?: RaceEntry[];
          storage: LeaderboardStorage;
        };
        setBoardEntries(asBoardEntries(data.entries ?? []));
        setBoardStorage(data.storage);
        setBoardDay(raceId);
        return;
      }
      const day = laDayKey();
      setBoardDay(day);
      const res = await fetch(`/api/leaderboard?day=${encodeURIComponent(day)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Board error ${res.status}`);
      const data = (await res.json()) as { dayKey: string; entries: LeaderboardEntry[]; storage: LeaderboardStorage; demo?: boolean };
      setBoardEntries(data.entries ?? []);
      setBoardStorage(data.storage);
      setBoardDay(data.dayKey);
    } catch (e) {
      setBoardError(e instanceof Error ? e.message : "Failed to load board");
    } finally {
      setBoardLoading(false);
    }
  }, [raceId]);

  const onOpenBoard = () => {
    // Stops getUserMedia via boardOpen effect; pose init stays gated while open
    stopCameraStream();
    setCamStatus("idle");
    setBoardOpen(true);
    setSubmitMsg(null);
    void loadBoard();
  };

  useEffect(() => {
    if (!raceId || !raceAllowed) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const data = await fetchRace(raceId);
        if (cancelled) return;
        setBoardEntries(asBoardEntries(data.entries ?? []));
        setBoardStorage(data.storage);
        setBoardDay(raceId);
      } catch {
        /* keep last snapshot */
      }
    };
    void tick();
    const id = setInterval(() => void tick(), RACE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [raceId, raceAllowed]);

  const flushRaceProgress = useCallback(async () => {
    if (!raceId) return;
    const clean = sanitizeNick(nick);
    if (!clean) return;
    if (progressBusyRef.current) return;
    const pending = pendingProgressRef.current;
    if (!pending) return;
    if (pending.score === 0 && pending.reps === 0) return;
    if (
      pending.score === lastPostedProgressRef.current.score &&
      pending.reps === lastPostedProgressRef.current.reps
    ) {
      pendingProgressRef.current = null;
      return;
    }
    const wait = RACE_PROGRESS_MIN_MS - (Date.now() - lastProgressAtRef.current);
    if (wait > 0) {
      if (progressTimerRef.current != null) {
        clearTimeout(progressTimerRef.current);
      }
      progressTimerRef.current = setTimeout(() => {
        progressTimerRef.current = null;
        void flushRaceProgress();
      }, wait);
      return;
    }
    progressBusyRef.current = true;
    pendingProgressRef.current = null;
    try {
      const data = await postRaceScore(
        raceId,
        clean,
        emoji.trim() || "🐦",
        pending.score,
        pending.reps
      );
      lastProgressAtRef.current = Date.now();
      lastPostedProgressRef.current = {
        score: pending.score,
        reps: pending.reps,
      };
      setBoardEntries(asBoardEntries(data.entries ?? []));
      setBoardStorage(data.storage);
    } catch {
      pendingProgressRef.current = pending;
    } finally {
      progressBusyRef.current = false;
      if (pendingProgressRef.current) void flushRaceProgress();
    }
  }, [emoji, nick, raceId]);

  useEffect(() => {
    if (!raceId || ui.status !== "playing") return;
    pendingProgressRef.current = { score: ui.score, reps: ui.reps };
    void flushRaceProgress();
  }, [flushRaceProgress, raceId, ui.reps, ui.score, ui.status]);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current != null) {
        clearTimeout(progressTimerRef.current);
      }
    };
  }, []);

  // Legacy ?board=1 is redirected to /board above — do not open overlay or touch camera.

  const onSubmitScore = useCallback(async () => {
    if (scorePostedRef.current || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      try {
        localStorage.setItem(NICK_KEY, nick);
        localStorage.setItem(EMOJI_KEY, emoji);
      } catch {
        /* ignore */
      }
      const cleanNick = sanitizeNick(nick);
      const savedEmoji = emoji.trim() || "🐦";
      if (raceId) {
        if (!cleanNick) throw new Error("Nick must be 2–16 letters/numbers");
        const savedNick = cleanNick;
        const data = await postRaceScore(
          raceId,
          savedNick,
          savedEmoji,
          ui.score,
          ui.reps
        );
        lastPostedProgressRef.current = { score: ui.score, reps: ui.reps };
        lastProgressAtRef.current = Date.now();
        setBoardEntries(asBoardEntries(data.entries ?? []));
        setBoardStorage(data.storage);
        track("race_score", { race: raceId, score: ui.score, reps: ui.reps, storage: data.storage });
        scorePostedRef.current = true;
        setScorePosted(true);
        setSubmitMsg(
          data.storage === "memory"
            ? "Posted to race (memory — set BLOB_READ_WRITE_TOKEN for persistence)"
            : "Posted to this race!"
        );
        return;
      }
      const savedNick = cleanNick ?? (nick.trim() || "Anon");
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nick: savedNick,
          emoji: savedEmoji,
          score: ui.score,
          reps: ui.reps,
          dayKey: laDayKey(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Submit failed (${res.status})`);
      setBoardEntries(data.entries ?? []);
      setBoardStorage(data.storage);
      track("board_submit", { score: ui.score, reps: ui.reps, storage: data.storage });
      scorePostedRef.current = true;
      setScorePosted(true);
      setSubmitMsg(
        data.storage === "memory"
          ? "Posted (memory — set BLOB_READ_WRITE_TOKEN or KV/Upstash REST for persistence)"
          : "Posted to today’s board!"
      );
    } catch (e) {
      setBoardError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [nick, emoji, ui.score, ui.reps, raceId]);

  // Auto-POST once when a run ends — Challenge / Play again must not skip the board.
  useEffect(() => {
    if (ui.status !== "over") return;
    if (autoPostedRef.current) return;
    autoPostedRef.current = true;
    void onSubmitScore();
  }, [ui.status, onSubmitScore]);

  const startReady = camStatus === "ready" && modelReady && ui.status === "ready";
  const calibSet = calibPhase === "set";
  const canStart = startReady && hasPose && calibSet;
  const showReadyChrome = ui.status === "ready" && countdown == null && !obsMode;

  // OBS: after camera + plank lock, fire the existing 1-2-3 (no new start mechanic).
  useEffect(() => {
    if (!obsMode) return;
    if (!canStart || countdown != null || ui.status !== "ready") return;
    if (!trackerRef.current.isCalibrated) return;
    clearCountdownTimer();
    setCountdown(3);
  }, [obsMode, canStart, countdown, ui.status]);

  const coachMessage = (() => {
    if (!startReady) return null;
    if (!hasPose) {
      return { tone: "amber" as const, title: "Get into push-up position", detail: "Face the camera in a plank so we can see your shoulders." };
    }
    if (calibPhase === "waiting" || calibPhase === "holding") {
      return {
        tone: "amber" as const,
        title: "Hold the top of a push-up to set your start",
        detail: holdProgress > 0 ? `Hold steady… ${Math.round(holdProgress * 100)}%` : "Stay still in plank — this locks bird “up” near the top.",
      };
    }
    return {
      tone: "emerald" as const,
      title: "Start position set",
      detail: obsMode
        ? "Bird “up” is your plank. Countdown starts next — drop to dive."
        : "Bird “up” is your plank. Go down to dive. Tap Start when ready.",
    };
  })();

  if (boardDeepLink) {
    return <PlaySplash label="Opening daily board…" />;
  }

  if (raceId && !raceAllowed) {
    return <PlaySplash label="Join with a nick…" />;
  }

  return (
    <div
      className={`relative flex h-[100dvh] w-full flex-col overflow-hidden overscroll-none text-white ${
        obsMode ? "bg-black p-3 sm:p-5" : "bg-[#0c0a09]"
      }`}
    >
      {!obsMode && (
        <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 pointer-events-none">
          <Link href="/" className="pointer-events-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/55 px-3 py-2 text-sm backdrop-blur-md hover:bg-black/70">← Home</Link>
          <div className="font-display rounded-full bg-stone-950/70 px-3 py-2 text-sm font-bold tracking-tight text-amber-100 backdrop-blur-md">Push Flappy</div>
          <button type="button" onClick={onOpenBoard} className="pointer-events-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/55 px-3 py-2 text-sm backdrop-blur-md hover:bg-black/70">{raceId ? "Race" : "Board"}</button>
        </header>
      )}
      {showReadyChrome && (
        <div className="absolute inset-x-0 top-[max(3.4rem,calc(env(safe-area-inset-top)+2.85rem))] z-20 flex justify-center px-3 pointer-events-none">
          <SiblingPromoPill surface="play" className="pointer-events-auto" />
        </div>
      )}
      <div ref={containerRef} className="relative min-h-0 flex-1 touch-none">
        <video ref={videoRef} playsInline muted autoPlay className="pointer-events-none absolute h-px w-px opacity-0" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />
        {(camStatus === "requesting" || (camStatus === "ready" && !modelReady)) && (
          <div className="absolute inset-0 z-10">
            <PlaySplash
              label={
                camStatus === "requesting"
                  ? "Requesting camera…"
                  : "Loading pose model…"
              }
            />
          </div>
        )}
        {(camStatus === "denied" || camStatus === "error") && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 p-6 text-center">
            <div className="max-w-sm space-y-3">
              <p className="text-lg font-semibold">Camera needed</p>
              <p className="text-sm text-zinc-300">{errorMsg || "Enable your camera to play."}</p>
              <p className="text-xs text-zinc-400">Camera requires localhost or HTTPS. Deploy to an HTTPS host for the best phone experience.</p>
            </div>
          </div>
        )}
        {showOrientationTip && !obsMode && ui.status === "ready" && camStatus === "ready" && (
          <OrientationTip show shifted={showReadyChrome} />
        )}
        {ui.status === "ready" && <CoachBanner coachMessage={coachMessage} calibPhase={calibPhase} holdProgress={holdProgress} />}
        {startReady && countdown == null && !obsMode && (
          <ReadyPanel canStart={canStart} hasPose={hasPose} calibSet={calibSet} beatTarget={beatTarget} raceId={raceId} onStart={onStart} />
        )}
        {raceId && (ui.status === "ready" || ui.status === "playing") && (
          <div
            className={`absolute z-20 pointer-events-none ${
              obsMode
                ? "left-3 top-3"
                : "left-3 top-[max(3.55rem,calc(env(safe-area-inset-top)+3.05rem))]"
            }`}
          >
            <RaceLiveBoard
              entries={withLocalRaceScore(
                boardEntries,
                ui.status === "playing"
                  ? {
                      nick,
                      emoji,
                      score: ui.score,
                      reps: ui.reps,
                    }
                  : null
              )}
              youNick={nick}
            />
          </div>
        )}
        {countdown != null && countdown > 0 && <CountdownOverlay count={countdown} />}
        {ui.status === "over" && (
          <GameOverPanel
            score={ui.score}
            highScore={ui.highScore}
            reps={ui.reps}
            wipeoutLine={wipeoutLine}
            beatTarget={beatTarget}
            beatVictory={beatVictory}
            shareStatus={shareStatus}
            onRestart={onRestart}
            onSharePrimary={onSharePrimary}
            onShareWhatsApp={onShareWhatsApp}
            onShareX={onShareX}
            onCopyLink={onCopyLink}
            onSaveCard={onSaveCard}
            onShareMore={onShareMore}
            onOpenBoard={onOpenBoard}
            scorePosted={scorePosted}
            scorePosting={submitting}
            onSubmitScore={() => void onSubmitScore()}
            raceId={raceId}
          />
        )}
        <LeaderboardPanel
          open={boardOpen}
          dayKey={boardDay}
          entries={boardEntries}
          storage={boardStorage}
          loading={boardLoading}
          error={boardError}
          nick={nick}
          emoji={emoji}
          score={ui.score}
          reps={ui.reps}
          submitting={submitting}
          submitMsg={submitMsg}
          scorePosted={scorePosted}
          onNick={setNick}
          onEmoji={setEmoji}
          onClose={() => { setBoardOpen(false); }}
          onRefresh={() => void loadBoard()}
          onSubmit={() => void onSubmitScore()}
          title={raceId ? "Race board" : "Daily board"}
          subtitle={
            raceId
              ? `${raceId} · same pipes · ${
                  boardStorage && boardStorage !== "memory"
                    ? "live"
                    : boardStorage === "memory"
                      ? "memory (not durable)"
                      : "…"
                }`
              : undefined
          }
        />
      </div>
    </div>
  );
}

function asBoardEntries(entries: RaceEntry[]): LeaderboardEntry[] {
  return entries.map((e) => ({
    nick: e.nick,
    emoji: e.emoji,
    score: e.score,
    reps: e.reps,
    at: e.at,
    country: e.country,
    dayKey: "",
    demo: false,
  }));
}

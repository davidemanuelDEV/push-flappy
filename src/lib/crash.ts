/**
 * Lightweight canvas crash burst — no sprites/assets.
 */

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  color: string;
};

export type CrashBurst = {
  x: number;
  y: number;
  age: number;
  duration: number;
  particles: Particle[];
  flash: number;
};

const COLORS = ["#e8453c", "#f5c542", "#f0c078", "#fff8e7", "#b87333", "#ff7a59"];

export function createCrashBurst(x: number, y: number, scale = 1): CrashBurst {
  const n = 18 + Math.floor(Math.random() * 8);
  const particles: Particle[] = [];
  for (let i = 0; i < n; i++) {
    const ang = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.4;
    const speed = (120 + Math.random() * 220) * scale;
    particles.push({
      x,
      y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - 40 * scale,
      life: 1,
      maxLife: 0.35 + Math.random() * 0.35,
      r: (3 + Math.random() * 5) * scale,
      color: COLORS[i % COLORS.length],
    });
  }
  return {
    x,
    y,
    age: 0,
    duration: 0.7,
    particles,
    flash: 1,
  };
}

/** Advance burst; returns null when finished. */
export function tickCrash(burst: CrashBurst, dt: number): CrashBurst | null {
  const age = burst.age + dt;
  if (age > burst.duration) return null;
  const flash = Math.max(0, 1 - age / 0.18);
  const particles = burst.particles
    .map((p) => {
      const life = p.life - dt / p.maxLife;
      if (life <= 0) return null;
      return {
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        vx: p.vx * 0.96,
        vy: p.vy * 0.96 + 380 * dt,
        life,
        r: p.r * (0.85 + 0.15 * life),
      };
    })
    .filter((p): p is Particle => p != null);
  return { ...burst, age, flash, particles };
}

export function drawCrash(ctx: CanvasRenderingContext2D, burst: CrashBurst) {
  ctx.save();
  if (burst.flash > 0.02) {
    const a = burst.flash * 0.55;
    const rad = 28 + (1 - burst.flash) * 70;
    const g = ctx.createRadialGradient(burst.x, burst.y, 0, burst.x, burst.y, rad);
    g.addColorStop(0, `rgba(255,240,200,${a})`);
    g.addColorStop(0.45, `rgba(232,69,60,${a * 0.55})`);
    g.addColorStop(1, "rgba(255,120,40,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(burst.x, burst.y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const p of burst.particles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, p.r), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Curated PG wipeout one-liners — new pick each game over. */
export const WIPEOUT_LINES = [
  "Copper 1, wings 0.",
  "That pipe filed a complaint.",
  "Form check: bird needs work.",
  "Push day claimed another avian.",
  "You hugged the copper. Bold.",
  "Gravity called. It wants a tip.",
  "Plank was cute. Pipes were mean.",
  "Beak meets metal — classic.",
  "Reps good. Navigation… spicy.",
  "The gap was a suggestion.",
  "Bird tried parkour. Pipe said no.",
  "Top of push-up: strong. Aim: pending.",
  "Feathers everywhere. Metaphorically.",
  "That wasn’t a gap, that was a vibe.",
  "Chest to floor? Fine. Bird to pipe? Less fine.",
] as const;

export function pickWipeoutLine(exclude?: string | null): string {
  const list = WIPEOUT_LINES as readonly string[];
  if (list.length === 1) return list[0];
  let pick = list[Math.floor(Math.random() * list.length)];
  if (exclude && list.length > 1) {
    let guard = 0;
    while (pick === exclude && guard++ < 8) {
      pick = list[Math.floor(Math.random() * list.length)];
    }
  }
  return pick;
}

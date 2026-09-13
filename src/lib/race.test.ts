import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  RACE_NICK_CAP,
  raceDisplayTitle,
  sanitizeRaceTitle,
  withLocalRaceScore,
} from "./race";

describe("sanitizeRaceTitle", () => {
  it("accepts 2–32 letters, numbers, spaces, and basic punctuation", () => {
    assert.equal(sanitizeRaceTitle("Eng vs Sales"), "Eng vs Sales");
    assert.equal(sanitizeRaceTitle("  Q3: Eng-Sales!  "), "Q3: Eng-Sales!");
    assert.equal(sanitizeRaceTitle("A1"), "A1");
    assert.equal(sanitizeRaceTitle("x".repeat(32)), "x".repeat(32));
  });

  it("rejects empty, too short, too long, and unsafe chars", () => {
    assert.equal(sanitizeRaceTitle(""), undefined);
    assert.equal(sanitizeRaceTitle("   "), undefined);
    assert.equal(sanitizeRaceTitle("A"), undefined);
    assert.equal(sanitizeRaceTitle("x".repeat(33)), undefined);
    assert.equal(sanitizeRaceTitle("<script>"), undefined);
    assert.equal(sanitizeRaceTitle("hello@world"), undefined);
  });

  it("collapses internal whitespace", () => {
    assert.equal(sanitizeRaceTitle("Eng   vs\tSales"), "Eng vs Sales");
  });
});

describe("raceDisplayTitle", () => {
  it("uses the title when present, otherwise the id-only label", () => {
    assert.equal(raceDisplayTitle("abc12", "Eng vs Sales"), "Eng vs Sales");
    assert.equal(raceDisplayTitle("abc12"), "ABC12");
    assert.equal(raceDisplayTitle("abc12", undefined), "ABC12");
  });
});

describe("withLocalRaceScore", () => {
  it("overlays the local nick in place and ticks their score before poll", () => {
    const rows = withLocalRaceScore(
      [
        { nick: "Maya", emoji: "🐦", score: 0, reps: 0 },
        { nick: "David", emoji: "🔥", score: 0, reps: 0 },
      ],
      { nick: "david", emoji: "🔥", score: 3, reps: 4 }
    );
    assert.equal(rows.length, 2);
    assert.equal(rows[0]!.nick, "David");
    assert.equal(rows[0]!.score, 3);
    assert.equal(rows[0]!.reps, 4);
    assert.equal(rows[1]!.nick, "Maya");
    assert.equal(rows[1]!.score, 0);
  });

  it("inserts a missing local nick and keeps the cap at 10", () => {
    const filled = Array.from({ length: 10 }, (_, i) => ({
      nick: `P${i}`,
      emoji: "🐦",
      score: 10 - i,
      reps: 0,
    }));
    const rows = withLocalRaceScore(filled, {
      nick: "You",
      emoji: "🐔",
      score: 4,
      reps: 1,
    });
    assert.equal(rows.length, RACE_NICK_CAP);
    assert.ok(rows.some((e) => e.nick === "You" && e.score === 4));
    assert.equal(
      rows.filter((e) => e.nick === "P9").length,
      0,
      "lowest other row drops when local is inserted at cap"
    );
  });
});

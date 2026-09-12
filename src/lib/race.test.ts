import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RACE_NICK_CAP, withLocalRaceScore } from "./race";

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

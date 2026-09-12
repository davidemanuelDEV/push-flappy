import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalUrl } from "./seo";

test("canonicalUrl is origin + path with no query", () => {
  assert.equal(canonicalUrl("/"), "https://pushflappy.com/");
  assert.equal(canonicalUrl(""), "https://pushflappy.com/");
  assert.equal(canonicalUrl("/play"), "https://pushflappy.com/play");
  assert.equal(
    canonicalUrl("/play?beat=12&obs=1"),
    "https://pushflappy.com/play",
  );
  assert.equal(
    canonicalUrl("/race/abc12?obs=1#hud"),
    "https://pushflappy.com/race/abc12",
  );
  assert.equal(
    canonicalUrl("/race/abc12/overlay"),
    "https://pushflappy.com/race/abc12/overlay",
  );
  assert.equal(canonicalUrl("/streamers"), "https://pushflappy.com/streamers");
});

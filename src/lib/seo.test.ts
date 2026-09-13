import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalUrl, guideOgUrl, ogImageUrl } from "./seo";

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
  assert.equal(
    canonicalUrl("/guides/webcam-push-up-game?utm=x"),
    "https://pushflappy.com/guides/webcam-push-up-game",
  );
  assert.equal(
    guideOgUrl("obs"),
    "https://pushflappy.com/api/og?guide=obs",
  );
  assert.equal(
    ogImageUrl({ title: "Eng vs Sales" }),
    "https://pushflappy.com/api/og?title=Eng+vs+Sales",
  );
  assert.equal(ogImageUrl(), "https://pushflappy.com/api/og");
});

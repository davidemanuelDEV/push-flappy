import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: canonicalUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: canonicalUrl("/play"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: canonicalUrl("/board"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: canonicalUrl("/race"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: canonicalUrl("/faq"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: canonicalUrl("/streamers"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: canonicalUrl("/guides/webcam-push-up-game"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: canonicalUrl("/guides/obs-push-up-overlay"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: canonicalUrl("/guides/async-fitness-race"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: canonicalUrl("/guides/squat-flappy"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}

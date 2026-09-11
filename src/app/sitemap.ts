import type { MetadataRoute } from "next";

const BASE = "https://pushflappy.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${BASE}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/play`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/board`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE}/faq`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}

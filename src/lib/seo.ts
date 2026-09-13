import type { Metadata } from "next";

export const SITE_URL = "https://pushflappy.com";
export const SITE_NAME = "Push Flappy";
export const OG_IMAGE_PATH = "/api/og";

export function ogImageUrl(opts?: { title?: string }): string {
  const url = new URL(OG_IMAGE_PATH, SITE_URL);
  if (opts?.title) url.searchParams.set("title", opts.title);
  return url.toString();
}

/** Absolute https://pushflappy.com/{path} — never query or hash. */
export function canonicalUrl(path = "/"): string {
  const raw = path.trim() || "/";
  const noHash = raw.split("#")[0] ?? raw;
  const noQuery = noHash.split("?")[0] ?? noHash;
  let pathname = noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");
  if (pathname === "" || pathname === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${pathname}`;
}

export function guideOgUrl(slug: string): string {
  const url = new URL(OG_IMAGE_PATH, SITE_URL);
  url.searchParams.set("guide", slug);
  return url.toString();
}

export function pageMetadata({
  title,
  description,
  path,
  index = true,
  imageAlt,
  imageUrl,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  imageAlt?: string;
  imageUrl?: string;
}): Metadata {
  const canonical = canonicalUrl(path);
  const image = imageUrl ?? ogImageUrl();
  return {
    title,
    description,
    alternates: { canonical },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

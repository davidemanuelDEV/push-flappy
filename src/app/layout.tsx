import type { Metadata, Viewport } from "next";
import { Fredoka, Geist, Geist_Mono } from "next/font/google";
import RegisterSW from "@/components/RegisterSW";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { canonicalUrl, ogImageUrl } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const siteTitle =
  "Push Flappy: Free browser push-up Flappy — no app";
const siteDescription =
  "Free in the browser — no app. Flappy pipes, your torso is the bird. Share a beat-me link. On-device pose, no accounts. OBS-ready.";
const siteUrl = "https://pushflappy.com";
const ogImage = ogImageUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: { canonical: canonicalUrl("/") },
  applicationName: "Push Flappy",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Push Flappy",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    siteName: "Push Flappy",
    url: siteUrl,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Push Flappy — Push-up camera game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1c120c" },
    { media: "(prefers-color-scheme: light)", color: "#1c120c" },
  ],
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} min-h-[100dvh] antialiased`}
      >
        {children}
        <RegisterSW />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "Push Flappy — Flappy Bird for push day";
const siteDescription =
  "Control Flappy Bird with push-ups. Webcam or phone camera + MediaPipe Pose. No downloads, no accounts. Works on phone over HTTPS.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  applicationName: "Push Flappy",
  appleWebApp: {
    capable: true,
    title: "Push Flappy",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    siteName: "Push Flappy",
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
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
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-[100dvh] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

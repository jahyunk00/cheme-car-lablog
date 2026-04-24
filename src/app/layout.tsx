import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { clubBrandLogo, clubIntro } from "@/lib/club-intro";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const siteDescription =
  clubIntro.tagline.length > 160 ? `${clubIntro.tagline.slice(0, 157).trim()}…` : clubIntro.tagline;

function siteMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  if (process.env.VERCEL_URL) return new URL(`https://${process.env.VERCEL_URL}`);
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: siteMetadataBase(),
  applicationName: "LabLog",
  title: {
    default: `${clubIntro.clubName} · LabLog`,
    template: `%s · LabLog`,
  },
  description: `${clubIntro.clubName} — ${siteDescription}`,
  icons: {
    icon: [{ url: clubBrandLogo.src, type: "image/png" }],
    shortcut: clubBrandLogo.src,
    apple: clubBrandLogo.src,
  },
  openGraph: {
    type: "website",
    siteName: "LabLog",
    title: `${clubIntro.clubName} · LabLog`,
    description: siteDescription,
    images: [{ url: clubBrandLogo.src, alt: clubBrandLogo.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${clubIntro.clubName} · LabLog`,
    description: siteDescription,
    images: [clubBrandLogo.src],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

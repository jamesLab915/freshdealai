import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, warnMissingEnv } from "@/lib/env";

import "./globals.css";

warnMissingEnv();

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "FlashDealAI — Today’s Best Deals, Powered by AI",
    template: "%s · FlashDealAI",
  },
  description:
    "Real-time US deal discovery with AI normalization, scoring, and price context. Browse categories, brands, and AI-picked offers.",
  openGraph: {
    title: "FlashDealAI",
    description: "AI-assisted discount discovery for US shoppers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrains.variable} min-h-screen antialiased text-neutral-900`}
      >
        <SiteHeader />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

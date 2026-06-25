import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScreenAnalyzer - Mobile Screenshot Analyzer & Design Builder",
  description:
    "Upload a mobile app screenshot and get measurements, color palettes, font specs, component detection, and a clean wireframe. Build, prototype, and export code.",
};

const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_SCRIPT_URL =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://analytics.umami.is/script.js";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">

      <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}>
        <Navbar />
        <main className="pt-16">{children}</main>

        {/* Umami Analytics — loads after page is interactive */}
        {UMAMI_WEBSITE_ID && (
          <Script
            src={UMAMI_SCRIPT_URL}
            data-website-id={UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}

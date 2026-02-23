import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoachForge — Hang up the call. Everything else is done.",
  description: "AI-powered coaching platform that records, transcribes, and generates session summaries, action items, and follow-up emails automatically. Be fully present. Never write a note again.",
  metadataBase: new URL("https://coachforge.pro"),
  openGraph: {
    title: "CoachForge — AI-Powered Coaching Platform",
    description: "Hang up the call. Everything else is done. Session summaries, action items, and follow-up emails — automatically.",
    url: "https://coachforge.pro",
    siteName: "CoachForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoachForge — AI-Powered Coaching Platform",
    description: "Hang up the call. Everything else is done.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}

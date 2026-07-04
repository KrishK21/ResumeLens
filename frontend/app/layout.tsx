import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";

// Body — clean, neutral, highly readable
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Data / the processing build-log — mono gives it that "machine at work" feel
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Display — Fraunces, a warm high-contrast face for headings.
// Its soft, architectural character suits the "modern house" direction
// without the generic geometric-sans look every SaaS reaches for.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ResumeLens — Tailor your resume to any job",
  description:
    "Reshape your real experience to match a job description. Never invents anything.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable}`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Newsreader, Outfit } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aria | Interactive Storefront & Voice Concierge",
  description:
    "Luxury botanical beauty storefront with Aria, an intelligent real-time voice customer support specialist powered by Gemini Live API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${newsreader.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="font-sans bg-[#fcf9f4] text-[#4a2d30] antialiased min-h-screen selection:bg-[#d89a9e]/30 selection:text-[#3d2427]"
      >
        {children}
      </body>
    </html>
  );
}


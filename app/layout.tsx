import type { Metadata, Viewport } from "next";
import { Anton, Archivo } from "next/font/google";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import "./globals.css";

const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

const poster = Anton({
  variable: "--font-poster",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "MeisterBlick: where AI pays off for your business",
  description:
    "We don't tell you what AI can do. We tell you where it pays off for you. And where it doesn't. One ROI number in 10 minutes.",
};

export const viewport: Viewport = { themeColor: "#f5f4f0" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${poster.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}

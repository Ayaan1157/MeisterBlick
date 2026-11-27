import type { Metadata, Viewport } from "next";
import { Archivo, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],

});

export const metadata: Metadata = {
  title: "MeisterBlick: where AI pays off for your business",
  description:
    "We don't tell you what AI can do. We tell you where it pays off for you. And where it doesn't. One ROI number in 10 minutes.",
};

export const viewport: Viewport = { themeColor: "#eef0ea" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

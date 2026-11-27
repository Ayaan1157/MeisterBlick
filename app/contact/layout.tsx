import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | MeisterBlick",
  description: "Talk to MeisterBlick: offices in Germany, working with craft firms worldwide.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

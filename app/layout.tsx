import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Only in NYC — AI Captions",
  description: "Turn NYC moments into AI captions, share photos and GIFs, and vote on your favorites.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

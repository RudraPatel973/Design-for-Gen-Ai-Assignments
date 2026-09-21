import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hello World! — The Hello Project",
  description: "One small page. One big entrance. A colorful, maximalist hello to the world.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

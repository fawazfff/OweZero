import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OweZero â€” Paste the chaos. Settle the math.",
  description: "Turn messy group expense messages into the fairest, shortest settlement plan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

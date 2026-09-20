import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OweZero — Paste the chaos. Settle the math.",
  description: "Turn messy group expense messages into the fairest, shortest settlement plan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fawazfff/OweZero@edbbc6adffcfab7cf357af1e6b295bce5181d18b/app/globals.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}


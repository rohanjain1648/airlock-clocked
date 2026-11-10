import type { Metadata } from "next";
import { Barlow_Condensed, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Airlock — a trust layer for autonomous agents, built on Clocked",
  description:
    "Airlock runs every ticket and every action an autonomous IT agent takes through ten Clocked endpoints: Guard, Protect and Inspect for safety; Extract, Decide and Fill to understand; Rerank, Compare and Verify for reliable answers. Each gate's output changes what the agent is allowed to do.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

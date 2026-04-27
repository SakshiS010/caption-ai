import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CaptionAI – Auto-generate video captions free",
  description: "Upload a video and instantly generate accurate captions powered by Whisper AI — free, private, runs in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-950`}>
        {children}
      </body>
    </html>
  );
}

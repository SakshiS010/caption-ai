import type { Metadata } from 'next';
import { Fredoka } from 'next/font/google';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Olly-AI 🥑 — Avocado Voice-to-Caption Translator',
  description: 'Meet Olly, your avocado AI voice translator. Turn spoken words into beautiful captions instantly — free, private, runs entirely in your browser.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} antialiased`}>{children}</body>
    </html>
  );
}

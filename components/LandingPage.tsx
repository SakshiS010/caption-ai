'use client';

import { useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onUpload: (file: File) => void;
}

const FEATURES = [
  {
    icon: '🎙️',
    title: 'Whisper AI Transcription',
    desc: 'OpenAI Whisper runs directly in your browser via a Web Worker — no server, no API key, no cost.',
    grad: 'from-blue-600/25 to-blue-950/10',
    ring: 'ring-blue-700/40',
    delay: 0,
  },
  {
    icon: '✨',
    title: '5 Animation Styles',
    desc: 'Fade, Word Pop, Karaoke highlight, Impact bounce — or keep it static. All burned with pixel-accurate ASS subtitles.',
    grad: 'from-violet-600/25 to-violet-950/10',
    ring: 'ring-violet-700/40',
    delay: 80,
  },
  {
    icon: '✍️',
    title: '18 Pro Fonts',
    desc: 'Bebas Neue, Poppins, Pacifico and 15 more. The live preview uses the exact same TTF that gets burned into the video.',
    grad: 'from-pink-600/25 to-pink-950/10',
    ring: 'ring-pink-700/40',
    delay: 160,
  },
  {
    icon: '🖊️',
    title: 'Click-to-Edit Captions',
    desc: 'Click any caption directly on the video player to edit it inline — VEED-style. Changes reflect everywhere instantly.',
    grad: 'from-cyan-600/25 to-cyan-950/10',
    ring: 'ring-cyan-700/40',
    delay: 0,
  },
  {
    icon: '🔥',
    title: 'Burn Into MP4',
    desc: 'Export a finished MP4 with captions permanently baked in. H.264 + AAC, moov-at-front, plays on any device.',
    grad: 'from-orange-600/25 to-orange-950/10',
    ring: 'ring-orange-700/40',
    delay: 80,
  },
  {
    icon: '📄',
    title: 'SRT & VTT Export',
    desc: 'Download universal subtitle files for YouTube Studio, Premiere Pro, DaVinci Resolve, or any NLE.',
    grad: 'from-emerald-600/25 to-emerald-950/10',
    ring: 'ring-emerald-700/40',
    delay: 160,
  },
];

const STEPS = [
  { n: '01', icon: '📤', title: 'Upload Your Video', desc: 'Drag & drop or browse for any MP4, MOV, WebM, MKV or AVI. Nothing leaves your device.' },
  { n: '02', icon: '🤖', title: 'AI Generates Captions', desc: 'Whisper-base runs in a background thread and streams captions segment by segment as it transcribes.' },
  { n: '03', icon: '🚀', title: 'Edit, Style & Export', desc: 'Tweak text inline, choose a font & animation, then burn into MP4 or grab an SRT/VTT file.' },
];

const BADGES = [
  { icon: '💰', label: '100% Free' },
  { icon: '🔓', label: 'No Login' },
  { icon: '🛡️', label: 'Runs in Browser' },
  { icon: '📶', label: 'Private & Offline' },
];

function UploadZone({ onUpload }: { onUpload: (f: File) => void }) {
  const onDrop = useCallback((accepted: File[]) => { if (accepted[0]) onUpload(accepted[0]); }, [onUpload]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative w-full max-w-2xl mx-auto rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ring-2 ${
        isDragActive
          ? 'ring-blue-400 bg-blue-500/15 scale-[1.02]'
          : 'ring-gray-700 hover:ring-blue-600/60 bg-gray-900/60 hover:bg-gray-900/90'
      }`}
      style={{ backdropFilter: 'blur(12px)' }}
    >
      <input {...getInputProps()} />

      {/* Subtle animated corner glow when drag active */}
      {isDragActive && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: '0 0 40px 6px rgba(59,130,246,.3)' }} />
      )}

      <div className="upload-icon-anim text-5xl mb-4 select-none">
        {isDragActive ? '🎯' : '🎬'}
      </div>
      <p className="text-xl font-bold text-white mb-1">
        {isDragActive ? 'Drop to caption it!' : 'Drop your video here'}
      </p>
      <p className="text-gray-400 text-sm mb-5">or click to browse &middot; MP4, MOV, AVI, WebM, MKV</p>

      <button
        type="button"
        className="inline-flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-sm transition-colors"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <span>✨</span> Get Started Free
      </button>

      <p className="text-gray-600 text-xs mt-4">No account required &middot; 100% private</p>
    </div>
  );
}

export function LandingPage({ onUpload }: Props) {
  // Scroll-reveal
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(3,7,18,0.75)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm select-none">C</div>
          <span className="font-bold text-lg">CaptionAI</span>
          <span className="hidden sm:inline text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-800 rounded-full ml-1">beta</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
        </div>
        <button
          onClick={() => document.getElementById('upload-anchor')?.scrollIntoView({ behavior: 'smooth' })}
          className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
        >
          Try Free
        </button>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center overflow-hidden">

        {/* Floating gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float-slow absolute top-24 left-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="animate-float-medium absolute top-48 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
          <div className="animate-float-fast absolute bottom-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        {/* Dot grid overlay */}
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 80% 60% at center, black 30%, transparent 100%)',
          }} />

        {/* Badge */}
        <div className="relative mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-blue-300 ring-1 ring-blue-700/50 bg-blue-950/40"
          style={{ backdropFilter: 'blur(8px)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Powered by OpenAI Whisper · Runs 100% in your browser
        </div>

        {/* Headline — words animate in with staggered delay */}
        <h1 className="relative text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6 max-w-4xl">
          {['Auto-Caption', 'Your', 'Videos'].map((word, i) => (
            <span
              key={word}
              className="hero-word mr-3"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {i < 2 ? word : <span className="shimmer-text">{word}</span>}
            </span>
          ))}
          <br />
          {['in', 'Seconds.'].map((word, i) => (
            <span
              key={word}
              className="hero-word mr-3"
              style={{ animationDelay: `${360 + i * 120}ms` }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Sub */}
        <p className="hero-word relative text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed"
          style={{ animationDelay: '600ms' }}>
          AI captions, 18 pro fonts, 5 animation styles, VEED-style inline editing, and MP4 burn — all free, all private, all in your browser.
        </p>

        {/* Dropzone */}
        <div id="upload-anchor" className="relative w-full max-w-2xl hero-word" style={{ animationDelay: '750ms' }}>
          <UploadZone onUpload={onUpload} />
        </div>

        {/* Trust row */}
        <div className="hero-word flex flex-wrap justify-center gap-4 mt-8" style={{ animationDelay: '880ms' }}>
          {BADGES.map((b) => (
            <span key={b.label} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <span>{b.icon}</span> {b.label}
            </span>
          ))}
        </div>

        {/* Scroll cue */}
        <div className="hero-word absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 text-xs"
          style={{ animationDelay: '1000ms' }}>
          <span>scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-700 to-transparent" />
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">Everything you need</p>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Built for creators who move fast</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              No subscriptions. No watermarks. Just powerful caption tooling that runs on your own machine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                data-reveal
                style={{ transitionDelay: `${f.delay}ms` }}
                className={`feature-card relative rounded-2xl p-6 bg-gradient-to-br ${f.grad} ring-1 ${f.ring} overflow-hidden`}
              >
                {/* glow corner */}
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-30"
                  style={{ background: 'white' }} />
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section id="how" className="relative py-24 px-6 overflow-hidden">
        {/* bg accent */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[400px] bg-violet-700/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">Dead simple</p>
            <h2 className="text-4xl md:text-5xl font-extrabold">From upload to export in 3 steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                data-reveal
                style={{ transitionDelay: `${i * 120}ms` }}
                className="relative rounded-2xl p-7 bg-gray-900/70 ring-1 ring-gray-800 text-center"
              >
                {/* connector line (desktop) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-gray-700 to-transparent z-10" />
                )}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-800 text-3xl mb-5 mx-auto">
                  {s.icon}
                </div>
                <div className="text-xs font-mono text-gray-600 mb-1">{s.n}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANIMATION SHOWCASE ─────────────────────────────────────── */}
      <section className="py-20 px-6" data-reveal>
        <div className="max-w-4xl mx-auto rounded-3xl p-10 md:p-14 text-center ring-1 ring-gray-800 bg-gray-900/50 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/3 w-64 h-40 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/3 w-64 h-40 bg-violet-600/10 rounded-full blur-3xl" />
          </div>
          <p className="relative text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-4">Creator-grade animations</p>
          <h2 className="relative text-3xl md:text-4xl font-extrabold mb-4">
            Stand out with <span className="shimmer-text">cinematic captions</span>
          </h2>
          <p className="relative text-gray-400 mb-8 max-w-lg mx-auto">
            Word-by-word Impact bounce for Reels. Karaoke highlight for tutorials. Fade-in for polished documentaries. No plugins, no plugins, no subscriptions.
          </p>
          <div className="relative flex flex-wrap justify-center gap-3">
            {['None (static)', 'Fade', 'Word Pop', 'Karaoke', 'Impact'].map((label) => (
              <span key={label} className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-800 ring-1 ring-gray-700 text-gray-300">
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────── */}
      <section className="py-28 px-6 text-center" data-reveal>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Ready to caption your next video?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            It takes under 60 seconds. No account, no payment, no nonsense.
          </p>
          <UploadZone onUpload={onUpload} />
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-900 py-8 px-6 text-center text-gray-600 text-xs">
        CaptionAI &middot; Powered by Whisper + FFmpeg.wasm &middot; Runs 100% in your browser &middot; Free forever
      </footer>
    </div>
  );
}

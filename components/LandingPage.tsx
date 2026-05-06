'use client';

import { useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onUpload: (file: File) => void;
}

const FEATURES = [
  { icon: '🎙️', title: 'AI Voice Transcription', desc: 'Whisper AI runs right in your browser tab — no cloud, no servers, zero data collection.' },
  { icon: '🎨', title: '18 Gorgeous Fonts', desc: 'Bebas Neue, Poppins, Pacifico and 15 more — previewed live and burned with pixel precision.' },
  { icon: '✨', title: '5 Animation Styles', desc: 'Fade, Word Pop, Karaoke, Impact bounce, or static. Captions that move like your content.' },
  { icon: '🔥', title: 'Burn to MP4', desc: 'Download a finished video with captions permanently embedded. Plays on any device.' },
  { icon: '📄', title: 'SRT & VTT Export', desc: 'Universal subtitle files for YouTube, Premiere Pro, DaVinci Resolve and more.' },
  { icon: '🛡️', title: '100% Private', desc: 'Your video never leaves your device. Nothing uploaded. Ever. No account needed.' },
];

const STEPS = [
  { n: '01', icon: '📤', title: 'Drop Your Video', desc: 'Any MP4, MOV, MKV or WebM — Olly handles it.' },
  { n: '02', icon: '🤖', title: 'Olly Listens', desc: 'AI transcription streams captions as it goes — watch the magic happen.' },
  { n: '03', icon: '🌸', title: 'Style & Export', desc: 'Fonts, colours, animations — then burn to MP4 or grab an SRT file.' },
];

function UploadZone({ onUpload }: { onUpload: (f: File) => void }) {
  const onDrop = useCallback((accepted: File[]) => { if (accepted[0]) onUpload(accepted[0]); }, [onUpload]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'] },
    maxFiles: 1,
  });

  return (
    <div {...getRootProps()} className="cursor-pointer select-none">
      <input {...getInputProps()} />
      <div
        className="relative rounded-3xl p-10 text-center transition-all duration-300"
        style={{
          border: `3px dashed ${isDragActive ? '#40916c' : '#95d5b2'}`,
          background: isDragActive
            ? 'rgba(208,243,220,0.35)'
            : 'linear-gradient(145deg, rgba(255,251,240,0.95), rgba(240,250,244,0.85))',
          transform: isDragActive ? 'scale(1.025)' : 'scale(1)',
          boxShadow: isDragActive ? '0 0 0 6px rgba(64,145,108,0.15)' : '0 2px 24px rgba(45,106,79,0.08)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 rounded-tl-xl" style={{ borderColor: '#52b788' }} />
        <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 rounded-tr-xl" style={{ borderColor: '#52b788' }} />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 rounded-bl-xl" style={{ borderColor: '#52b788' }} />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 rounded-br-xl" style={{ borderColor: '#52b788' }} />

        <div
          className="text-7xl mb-4 inline-block transition-transform duration-300"
          style={{ transform: isDragActive ? 'scale(1.3) rotate(10deg)' : 'scale(1)' }}
        >
          {isDragActive ? '🎯' : '🥑'}
        </div>

        <h3 className="font-display text-2xl font-semibold mb-2" style={{ color: '#1b4332' }}>
          {isDragActive ? 'Yes! Drop it!' : 'Drop your video here'}
        </h3>
        <p className="text-sm mb-6" style={{ color: '#52b788' }}>
          or click to browse &middot; MP4, MOV, AVI, WebM, MKV
        </p>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-display font-semibold text-white text-lg transition-all duration-200 hover:-translate-y-1 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)', boxShadow: '0 6px 22px rgba(236,72,153,0.35)' }}
          onClick={(e) => e.stopPropagation()}
        >
          ✨ Start Captioning — it&apos;s free!
        </button>

        <p className="text-xs mt-4" style={{ color: '#95d5b2' }}>
          Nothing uploaded to any server &middot; 100% private &middot; no account needed
        </p>
      </div>
    </div>
  );
}

export function LandingPage({ onUpload }: Props) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--cream)', color: '#1c1917' }}>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(255,251,240,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1.5px solid #d8f3dc' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🥑</span>
          <span className="font-display text-xl font-bold" style={{ color: '#1b4332' }}>Olly-AI</span>
          <span className="hidden sm:inline px-2.5 py-0.5 rounded-full font-display text-[10px] font-bold uppercase tracking-wide"
            style={{ background: '#d8f3dc', color: '#1b4332' }}>avocado AI</span>
        </div>
        <div className="hidden md:flex items-center gap-6 font-display text-sm font-semibold" style={{ color: '#40916c' }}>
          <a href="#features" className="hover:text-[#1b4332] transition-colors">Features</a>
          <a href="#how" className="hover:text-[#1b4332] transition-colors">How it works</a>
        </div>
        <button
          onClick={() => document.getElementById('upload-zone')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-5 py-2 rounded-full font-display font-semibold text-white text-sm transition-all hover:-translate-y-0.5 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #40916c, #52b788)', boxShadow: '0 4px 14px rgba(64,145,108,.32)' }}
        >
          Try Olly Free ✨
        </button>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-6 text-center overflow-hidden">

        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-28 -right-28 w-[550px] h-[550px]" style={{
            background: 'radial-gradient(circle, #f9a8d4 0%, #ec4899 60%, transparent 100%)',
            opacity: 0.18, filter: 'blur(52px)', borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%',
          }} />
          <div className="absolute -bottom-28 -left-28 w-[500px] h-[500px]" style={{
            background: 'radial-gradient(circle, #95d5b2 0%, #2d6a4f 60%, transparent 100%)',
            opacity: 0.2, filter: 'blur(52px)', borderRadius: '40% 60% 70% 30%/40% 50% 60% 50%',
          }} />
          {/* Floating pips */}
          {([
            { style: { top: '22%', left: '7%', width: 12, height: 12, background: '#f472b6', opacity: 0.5, animationDuration: '4s', borderRadius: '50%' } },
            { style: { top: '40%', right: '7%', width: 8, height: 8, background: '#52b788', opacity: 0.5, animationDuration: '5s', animationDelay: '1s', borderRadius: '50%' } },
            { style: { bottom: '28%', left: '14%', width: 6, height: 6, background: '#f9a8d4', opacity: 0.6, animationDuration: '3.5s', animationDelay: '0.5s', borderRadius: '50%' } },
            { style: { bottom: '20%', right: '12%', width: 10, height: 10, background: '#74c69d', opacity: 0.45, animationDuration: '4.5s', animationDelay: '1.5s', borderRadius: '50%' } },
          ] as const).map((p, i) => (
            <div key={i} className="absolute avo-float" style={p.style as React.CSSProperties} />
          ))}
        </div>

        {/* Olly character */}
        <div
          className="avo-float select-none mb-7"
          style={{ fontSize: 100, filter: 'drop-shadow(0 18px 36px rgba(45,106,79,.22)) drop-shadow(0 6px 14px rgba(244,114,182,.18))' }}
        >
          🥑
        </div>

        {/* Pill badge */}
        <div
          className="slide-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-display font-semibold text-sm mb-5"
          style={{ background: '#d8f3dc', color: '#1b4332', animationDelay: '80ms' }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#52b788' }} />
          Avocado AI Voice Translator
        </div>

        {/* Heading */}
        <h1
          className="slide-up font-display font-bold leading-[1.1] mb-4 max-w-3xl"
          style={{ fontSize: 'clamp(3rem,7.5vw,5.5rem)', color: '#1b4332', animationDelay: '160ms' }}
        >
          Hi, I&apos;m{' '}
          <span className="shimmer-green">Olly!</span>
          {' '}🌸
        </h1>

        <h2
          className="slide-up font-display text-2xl md:text-3xl font-medium mb-4"
          style={{ color: '#2d6a4f', animationDelay: '260ms' }}
        >
          Your AI avocado voice-to-caption translator 🎤
        </h2>

        <p
          className="slide-up text-lg md:text-xl mb-10 max-w-xl leading-relaxed"
          style={{ color: '#78716c', animationDelay: '360ms' }}
        >
          Drop in any video — Olly listens, transcribes, and turns your words into beautiful styled captions. Free. Private. On your device.
        </p>

        {/* Feature pills */}
        <div className="slide-up flex flex-wrap justify-center gap-2 mb-10" style={{ animationDelay: '440ms' }}>
          {[
            ['🎙️', 'Whisper AI'], ['✨', '5 Animations'], ['🎨', '18 Fonts'],
            ['🔥', 'Burn MP4'], ['📄', 'SRT & VTT'], ['🛡️', 'Private'],
          ].map(([emoji, label]) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-display text-sm font-semibold"
              style={{ background: '#f0faf4', color: '#2d6a4f', border: '1.5px solid #95d5b2' }}
            >
              {emoji} {label}
            </span>
          ))}
        </div>

        {/* Upload */}
        <div id="upload-zone" className="slide-up w-full max-w-2xl" style={{ animationDelay: '540ms' }}>
          <UploadZone onUpload={onUpload} />
        </div>

        {/* Scroll cue */}
        <div className="slide-up absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          style={{ opacity: 0.4, animationDelay: '800ms' }}>
          <span className="font-display text-xs font-semibold" style={{ color: '#40916c' }}>see what Olly can do</span>
          <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, #52b788, transparent)' }} />
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6" style={{ background: 'var(--avo-700)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16" data-reveal>
            <p className="font-display text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#74c69d' }}>
              everything packed in
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: '#d8f3dc' }}>
              Olly&apos;s superpowers 💪
            </h2>
            <p className="text-lg max-w-md mx-auto" style={{ color: '#74c69d' }}>
              No signup. No limits. No hidden costs. Just caption magic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} data-reveal style={{ transitionDelay: `${(i % 3) * 75}ms` }}>
                <div
                  className="feature-card h-full rounded-3xl p-7"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(148,213,178,0.2)' }}
                >
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="font-display text-xl font-semibold mb-2" style={{ color: '#d8f3dc' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#74c69d' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16" data-reveal>
            <p className="font-display text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#40916c' }}>
              ridiculously simple
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold" style={{ color: '#1b4332' }}>
              3 steps to perfect captions ✨
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} data-reveal style={{ transitionDelay: `${i * 110}ms` }} className="text-center relative">
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-10 h-0.5"
                    style={{ left: '58%', right: '-42%', background: 'linear-gradient(to right, #95d5b2, transparent)' }}
                  />
                )}
                <div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl mb-5 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #d8f3dc, #f0faf4)', border: '2px solid #95d5b2' }}
                >
                  {s.icon}
                </div>
                <div className="font-display text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#74c69d' }}>
                  step {s.n}
                </div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: '#1b4332' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#78716c' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-center"
        data-reveal
        style={{ background: 'linear-gradient(135deg, #d8f3dc 0%, #fce7f3 100%)' }}
      >
        <div className="max-w-xl mx-auto">
          <div className="avo-wobble text-7xl mb-6 inline-block">🥑</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: '#1b4332' }}>
            Ready? Let&apos;s caption! 🌸
          </h2>
          <p className="text-lg mb-10" style={{ color: '#2d6a4f' }}>
            Olly is waiting to help you make amazing content.
          </p>
          <UploadZone onUpload={onUpload} />
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer
        className="py-8 px-6 text-center text-sm border-t font-display"
        style={{ color: '#74c69d', borderColor: '#d8f3dc', background: '#f0faf4' }}
      >
        Olly-AI 🥑 &middot; Powered by OpenAI Whisper + FFmpeg.wasm &middot; Your video stays on your device &middot; Free forever 🌸
      </footer>
    </div>
  );
}

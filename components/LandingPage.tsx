'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { OllyMascot, OllyBadge, type OllyPose } from './OllyMascot';

interface Props {
  onUpload: (file: File) => void;
}

type Phase = 'intake' | 'tour' | 'upload';

interface UserInfo {
  name:    string;
  age:     string;
  purpose: string;
}

const PURPOSES = [
  { v: 'social',   label: '📱 Social media (Reels, TikTok, Shorts)' },
  { v: 'youtube',  label: '🎬 YouTube videos' },
  { v: 'edu',      label: '📚 Tutorials & lessons' },
  { v: 'work',     label: '💼 Work / meetings' },
  { v: 'personal', label: '🌸 Personal project' },
  { v: 'explore',  label: '🌱 Just exploring' },
];

interface TourStep {
  pose: OllyPose;
  text: string;
}

const STORAGE_KEY = 'olly-user-info';

/* ─────────────────────────────────────────────────────────────────── */

export function LandingPage({ onUpload }: Props) {
  const [phase, setPhase]       = useState<Phase>('intake');
  const [info,  setInfo]        = useState<UserInfo>({ name: '', age: '', purpose: '' });
  const [tourIdx, setTourIdx]   = useState(0);

  /* Rehydrate any previous session so returning users skip the form */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as UserInfo;
      if (parsed.name) {
        setInfo(parsed);
        setPhase('upload');
      }
    } catch {/* ignore */}
  }, []);

  const submitIntake = () => {
    if (!info.name.trim() || !info.age || !info.purpose) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(info)); } catch {/* ignore */}
    setTourIdx(0);
    setPhase('tour');
  };

  const tourSteps: TourStep[] = [
    { pose: 'wave',    text: `Hi ${info.name || 'friend'}! I'm Olly 🥑 nice to meet you!` },
    { pose: 'point',   text: 'Drop any video into this page and I will listen carefully…' },
    { pose: 'happy',   text: 'Then I write out every word as captions ✨ automatically!' },
    { pose: 'love',    text: 'You can style them, animate them, even emphasize words 🎨' },
    { pose: 'curious', text: 'Ready? Let me show you the magic →' },
  ];
  const step = tourSteps[tourIdx];

  const nextTour = () => {
    if (tourIdx < tourSteps.length - 1) setTourIdx((i) => i + 1);
    else setPhase('upload');
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden relative"
      style={{ background: 'var(--cream)', color: '#1c1917' }}
    >
      <Backdrop />

      {/* ── NAV ────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-3.5"
        style={{
          background: 'rgba(255,251,240,0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '2px solid transparent',
          backgroundImage: 'linear-gradient(rgba(255,251,240,0.88), rgba(255,251,240,0.88)), linear-gradient(90deg, #40916c 0%, #f472b6 50%, #40916c 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight" style={{ color: '#1b4332' }}>Olly-AI</span>
          <OllyBadge size={36} blinkDelay={400} />
          <span
            className="hidden sm:inline px-2.5 py-0.5 rounded-full font-display text-[10px] font-bold uppercase tracking-wide"
            style={{ background: '#d8f3dc', color: '#1b4332' }}
          >
            avocado AI
          </span>
        </div>
        {phase === 'upload' && info.name && (
          <button
            onClick={() => { localStorage.removeItem(STORAGE_KEY); setInfo({ name: '', age: '', purpose: '' }); setPhase('intake'); }}
            className="font-display text-xs font-semibold transition-opacity hover:opacity-60"
            style={{ color: '#40916c' }}
          >
            Not {info.name}? ↺
          </button>
        )}
      </nav>

      <main className="relative pt-24 pb-20 px-5 min-h-screen flex items-center justify-center">
        {phase === 'intake' && <Intake info={info} setInfo={setInfo} onSubmit={submitIntake} />}
        {phase === 'tour'   && <Tour step={step} idx={tourIdx} total={tourSteps.length} onNext={nextTour} onSkip={() => setPhase('upload')} />}
        {phase === 'upload' && <UploadStage info={info} onUpload={onUpload} />}
      </main>

      {/* ── Features strip — appears on the upload phase ─────────── */}
      {phase === 'upload' && <FeaturesStrip />}

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer
        className="py-7 px-6 text-center text-xs border-t font-display relative z-10"
        style={{ color: '#74c69d', borderColor: '#d8f3dc', background: 'rgba(240,250,244,0.6)' }}
      >
        Olly-AI 🥑 · Whisper + FFmpeg.wasm · 100% on your device · Made with 💚
      </footer>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Backdrop — organic blobs, sparkles, soft texture
   ────────────────────────────────────────────────────────────────── */
function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Pink top-right blob */}
      <div className="absolute -top-32 -right-32 w-[620px] h-[620px]" style={{
        background: 'radial-gradient(circle, #f9a8d4 0%, #ec4899 50%, transparent 100%)',
        opacity: 0.26, filter: 'blur(55px)',
        borderRadius: '58% 42% 30% 70%/60% 30% 70% 40%',
      }} />
      {/* Olive green bottom-left blob */}
      <div className="absolute -bottom-32 -left-32 w-[580px] h-[580px]" style={{
        background: 'radial-gradient(circle, #95d5b2 0%, #2d6a4f 55%, transparent 100%)',
        opacity: 0.30, filter: 'blur(55px)',
        borderRadius: '40% 60% 70% 30%/40% 50% 60% 50%',
      }} />
      {/* Mid accent blobs */}
      <div className="absolute top-[30%] -left-24 w-[300px] h-[300px]" style={{
        background: 'radial-gradient(circle, #52b788 0%, #40916c 60%, transparent 100%)',
        opacity: 0.20, filter: 'blur(48px)', borderRadius: '50%',
      }} />
      <div className="absolute top-[55%] -right-16 w-[260px] h-[260px]" style={{
        background: 'radial-gradient(circle, #f472b6 0%, #ec4899 60%, transparent 100%)',
        opacity: 0.18, filter: 'blur(48px)', borderRadius: '50%',
      }} />
      {/* Floating dots */}
      {([
        { pos: { top: '12%', left: '5%'       }, w: 14, c: '#f472b6', d: 0   },
        { pos: { top: '28%', right: '7%'      }, w: 10, c: '#52b788', d: 1   },
        { pos: { top: '52%', left: '3%'       }, w: 8,  c: '#f9a8d4', d: 0.5 },
        { pos: { bottom: '18%', right: '6%'  }, w: 12, c: '#74c69d', d: 1.5 },
        { pos: { top: '68%', left: '12%'      }, w: 7,  c: '#40916c', d: 2   },
        { pos: { top: '10%', right: '30%'     }, w: 5,  c: '#ec4899', d: 0.8 },
        { pos: { bottom: '35%', left: '20%'  }, w: 9,  c: '#f472b6', d: 1.2 },
        { pos: { top: '42%', right: '22%'    }, w: 6,  c: '#95d5b2', d: 2.4 },
        { pos: { bottom: '10%', left: '42%' }, w: 8,  c: '#52b788', d: 0.3 },
      ] as { pos: React.CSSProperties; w: number; c: string; d: number }[]).map((p, i) => (
        <div
          key={i}
          className="absolute olly-float"
          style={{ ...p.pos, width: p.w, height: p.w, background: p.c, borderRadius: '50%', opacity: 0.6, animationDelay: `${p.d}s` }}
        />
      ))}
      {/* Sparkle ✦ accents */}
      {([
        { pos: { top: '22%', right: '18%'      }, c: '#40916c', d: 0.6 },
        { pos: { top: '65%', left: '28%'       }, c: '#f472b6', d: 1.8 },
        { pos: { bottom: '28%', right: '30%' }, c: '#52b788', d: 0   },
        { pos: { top: '38%', left: '42%'      }, c: '#ec4899', d: 1.1 },
      ] as { pos: React.CSSProperties; c: string; d: number }[]).map((s, i) => (
        <div key={`sp-${i}`} className="absolute olly-float text-lg select-none" style={{ ...s.pos, color: s.c, opacity: 0.40, animationDelay: `${s.d}s` }}>✦</div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   PHASE 1 — Intake
   ────────────────────────────────────────────────────────────────── */
function Intake({
  info, setInfo, onSubmit,
}: {
  info: UserInfo;
  setInfo: (i: UserInfo) => void;
  onSubmit: () => void;
}) {
  const ready = info.name.trim().length > 0 && info.age && info.purpose;

  return (
    <div className="max-w-5xl w-full mx-auto grid md:grid-cols-[auto_1fr] gap-8 md:gap-10 items-center">

      {/* Olly + speech bubble */}
      <div className="relative flex justify-center md:justify-end">
        <OllyMascot size={200} pose="wave" className="olly-glow-pink" />
        <div
          className="speech-bubble pink tail-left bubble-pop absolute"
          style={{
            top: '15%',
            left: 'calc(100% + 12px)',
            minWidth: 220,
            whiteSpace: 'nowrap',
            animationDelay: '300ms',
          }}
        >
          Hi! Who&apos;s ready to caption? 🌸
        </div>
      </div>

      {/* Form sticker */}
      <div className="sticker-in" style={{ animationDelay: '150ms' }}>
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          className="sticker-card p-7 md:p-9 max-w-md relative overflow-hidden"
        >
          {/* Gradient accent bar at top */}
          <div className="absolute inset-x-0 top-0 h-[5px] rounded-t-[18px]" style={{ background: 'linear-gradient(90deg, #40916c 0%, #f472b6 50%, #40916c 100%)' }} />
          <div className="mb-5">
            <p className="font-display text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#40916c' }}>
              step 1 of 1 · let&apos;s say hi
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#1b4332' }}>
              First, tell Olly{' '}
              <span style={{ color: '#ec4899' }}>about you</span>
              <span className="type-cursor inline-block w-[3px] h-7 align-middle ml-1" style={{ background: '#ec4899' }} />
            </h1>
            <p className="text-sm mt-2" style={{ color: '#52b788' }}>
              Just three quick questions 💚 nothing leaves your device.
            </p>
          </div>

          <Field label="What should Olly call you?" emoji="🌸">
            <input
              type="text"
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              placeholder="Your name…"
              autoFocus
              maxLength={40}
              className="w-full px-4 py-3 rounded-2xl outline-none transition-all font-display text-base"
              style={{
                background: '#f0faf4',
                border: '2px solid #95d5b2',
                color: '#1b4332',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#40916c'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(64,145,108,.15)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = '#95d5b2'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </Field>

          <Field label="How old are you?" emoji="🎂">
            <div className="grid grid-cols-4 gap-2">
              {['<18', '18–25', '26–35', '36+'].map((bucket) => (
                <button
                  key={bucket}
                  type="button"
                  onClick={() => setInfo({ ...info, age: bucket })}
                  className="py-2.5 rounded-xl font-display font-semibold text-sm transition-all"
                  style={{
                    background: info.age === bucket ? 'linear-gradient(135deg, #40916c, #52b788)' : '#f0faf4',
                    color:      info.age === bucket ? '#fff' : '#2d6a4f',
                    border: `1.5px solid ${info.age === bucket ? '#40916c' : '#95d5b2'}`,
                    boxShadow: info.age === bucket ? '0 3px 12px rgba(64,145,108,.3)' : 'none',
                  }}
                >
                  {bucket}
                </button>
              ))}
            </div>
          </Field>

          <Field label="What are you here for?" emoji="🎯">
            <div className="flex flex-col gap-1.5">
              {PURPOSES.map((p) => {
                const active = info.purpose === p.v;
                return (
                  <button
                    key={p.v}
                    type="button"
                    onClick={() => setInfo({ ...info, purpose: p.v })}
                    className="text-left px-3 py-2 rounded-xl font-display text-sm transition-all"
                    style={{
                      background: active ? 'rgba(244,114,182,0.12)' : '#f0faf4',
                      color:      active ? '#be185d' : '#2d6a4f',
                      border: `1.5px solid ${active ? '#f472b6' : '#d8f3dc'}`,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <button
            type="submit"
            disabled={!ready}
            className="w-full mt-3 py-4 rounded-2xl font-display font-bold text-lg text-white transition-all active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: ready ? 'linear-gradient(135deg, #ec4899, #f472b6)' : '#e5e7eb',
              boxShadow:  ready ? '0 6px 22px rgba(236,72,153,.4)' : 'none',
            }}
          >
            Meet Olly →
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, emoji, children }: { label: string; emoji: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="font-display font-semibold text-sm mb-2 flex items-center gap-1.5" style={{ color: '#2d6a4f' }}>
        <span>{emoji}</span>{label}
      </span>
      {children}
    </label>
  );
}

/* ──────────────────────────────────────────────────────────────────
   PHASE 2 — Tour
   ────────────────────────────────────────────────────────────────── */
function Tour({
  step, idx, total, onNext, onSkip,
}: {
  step: TourStep; idx: number; total: number; onNext: () => void; onSkip: () => void;
}) {
  return (
    <div className="max-w-3xl w-full text-center relative">

      {/* Confetti for the final step */}
      {idx === total - 1 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(14)].map((_, i) => {
            const colors = ['#f472b6', '#52b788', '#fde68a', '#a78bfa', '#74c69d'];
            return (
              <span
                key={i}
                className="confetti-bit absolute"
                style={{
                  left:  `${(i * 7) + 5}%`,
                  top: 0,
                  width: 8, height: 14,
                  background: colors[i % colors.length],
                  borderRadius: 3,
                  animationDelay: `${i * 0.13}s`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      )}

      {/* Olly */}
      <div className="flex justify-center mb-4">
        <OllyMascot key={step.pose} size={220} pose={step.pose} className={idx % 2 === 0 ? 'olly-glow-pink' : 'olly-glow-green'} />
      </div>

      {/* Speech bubble — alternates pink/green based on step */}
      <div className="flex justify-center mb-8">
        <div
          key={idx}
          className={`speech-bubble tail-down bubble-pop max-w-md ${idx % 2 === 0 ? 'pink' : ''}`}
          style={{ animationDelay: '120ms' }}
        >
          {step.text}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-7">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === idx ? 28 : 10,
              height: 10,
              background: i === idx ? '#ec4899' : i < idx ? '#52b788' : 'rgba(149,213,178,0.4)',
            }}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onNext}
          className="px-10 py-4 rounded-full font-display font-bold text-lg text-white transition-all hover:-translate-y-0.5 active:scale-95"
          style={{
            background: idx === total - 1
              ? 'linear-gradient(135deg, #ec4899, #f472b6)'
              : 'linear-gradient(135deg, #2d6a4f, #40916c)',
            boxShadow:  idx === total - 1
              ? '0 8px 24px rgba(236,72,153,.42)'
              : '0 6px 20px rgba(45,106,79,.35)',
          }}
        >
          {idx === total - 1 ? '✨ Let\'s caption!' : 'Next →'}
        </button>
        {idx < total - 1 && (
          <button
            onClick={onSkip}
            className="font-display text-sm font-semibold transition-opacity hover:opacity-60 underline underline-offset-4"
            style={{ color: '#40916c' }}
          >
            Skip the tour
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   PHASE 3 — Upload
   ────────────────────────────────────────────────────────────────── */
function UploadStage({ info, onUpload }: { info: UserInfo; onUpload: (f: File) => void }) {
  const onDrop = useCallback((accepted: File[]) => { if (accepted[0]) onUpload(accepted[0]); }, [onUpload]);
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'] },
    maxFiles: 1,
    noClick: true,
  });

  return (
    <div className="max-w-3xl w-full mx-auto text-center page-fade">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <OllyMascot size={150} pose={isDragActive ? 'love' : 'happy'} className={isDragActive ? 'olly-glow-pink' : 'olly-glow-green'} />
          <span
            className="absolute -top-2 -right-2 inline-block bubble-pop-r px-3 py-1 rounded-full font-display text-xs font-bold"
            style={{
              background: '#fce7f3',
              border: '2px solid #be185d',
              color: '#be185d',
              animationDelay: '200ms',
            }}
          >
            ready! ✨
          </span>
        </div>
      </div>

      <h1 className="font-display text-4xl md:text-5xl font-bold mb-2 leading-tight" style={{ color: '#1b4332' }}>
        Drop your video, <span style={{ color: '#ec4899' }}>{info.name || 'friend'}</span>
      </h1>
      <p className="text-base md:text-lg mb-8" style={{ color: '#52b788' }}>
        I&apos;ll do the rest 💚
      </p>

      <div {...getRootProps()} className="cursor-pointer select-none">
        <input {...getInputProps()} />
        <div
          className="relative rounded-3xl p-10 md:p-12 transition-all duration-300"
          style={{
            border: `3px dashed ${isDragActive ? '#40916c' : '#95d5b2'}`,
            background: isDragActive
              ? 'rgba(208,243,220,0.45)'
              : 'linear-gradient(145deg, rgba(255,251,240,0.95), rgba(240,250,244,0.85))',
            transform: isDragActive ? 'scale(1.025)' : 'scale(1)',
            boxShadow: isDragActive ? '0 0 0 6px rgba(64,145,108,.15)' : '0 4px 30px rgba(45,106,79,.08)',
          }}
        >
          {/* Corner crops — alternating olive/pink */}
          {[
            { top: 10, left: 10,   rot: 0,   color: '#40916c' },
            { top: 10, right: 10,  rot: 90,  color: '#f472b6' },
            { bottom: 10, right: 10, rot: 180, color: '#40916c' },
            { bottom: 10, left: 10,  rot: 270, color: '#f472b6' },
          ].map(({ color, rot, ...pos }, i) => (
            <span
              key={i}
              className="absolute"
              style={{ ...pos, width: 24, height: 24, borderLeft: `3px solid ${color}`, borderTop: `3px solid ${color}`, borderRadius: '6px 0 0 0', transform: `rotate(${rot}deg)` } as React.CSSProperties}
            />
          ))}

          <div className="text-5xl mb-3 arrow-bob inline-block">⬇️</div>
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1b4332' }}>
            {isDragActive ? 'Yes! Drop it!' : 'Drop your video here'}
          </h3>
          <p className="text-sm mb-6" style={{ color: '#52b788' }}>
            or click to browse · MP4 · MOV · AVI · WebM · MKV
          </p>

          <button
            type="button"
            onClick={open}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-display font-bold text-white text-lg transition-all hover:-translate-y-1 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)', boxShadow: '0 6px 22px rgba(236,72,153,.35)' }}
          >
            ✨ Choose video
          </button>

          <p className="text-xs mt-5" style={{ color: '#95d5b2' }}>
            Nothing uploaded to any server · 100% private · no account needed
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Features strip — small reminder cards below the upload zone
   ────────────────────────────────────────────────────────────────── */
function FeaturesStrip() {
  const FEATS = [
    { icon: '🎙️', title: 'Whisper AI',  desc: 'In-browser transcription, no servers.' },
    { icon: '✨',  title: '5 Animations', desc: 'Fade, Word Pop, Karaoke, Impact, Emphasis.' },
    { icon: '🎨', title: '18 Fonts',     desc: 'From Bebas to Pacifico — burned crisp.' },
    { icon: '🔥', title: 'Burn MP4',     desc: 'Captions locked into a downloadable video.' },
  ];
  return (
    <section className="relative z-10 py-14 px-6" style={{ background: 'rgba(240,250,244,0.75)', borderTop: '3px solid #52b788' }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-center font-display text-sm font-bold uppercase tracking-widest mb-7 shimmer-green">
          ✦ what Olly can do ✦
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATS.map((f, i) => (
            <div
              key={f.title}
              className={`sticker-card ${i % 2 === 1 ? 'pink' : ''} p-5 text-center`}
              style={{ transform: `rotate(${i % 2 ? 1.8 : -1.8}deg)` }}
            >
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-display font-bold text-base mb-1" style={{ color: '#1b4332' }}>{f.title}</h3>
              <p className="text-xs" style={{ color: i % 2 === 1 ? '#be185d' : '#52b788' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { OllyNav } from './OllyNav';
import { OllyMascot } from './OllyMascot';

interface Props {
  onBack: () => void;
  onHome: () => void;
}

const CATEGORIES = [
  { id: 'accuracy',  label: '🎯 Caption Accuracy' },
  { id: 'design',    label: '🌸 Design & Vibes' },
  { id: 'speed',     label: '⚡ Speed' },
  { id: 'export',    label: '🎬 Export Quality' },
  { id: 'fonts',     label: '🎨 Font Options' },
  { id: 'emphasis',  label: '✦ Emphasis' },
  { id: 'bug',       label: '🐛 Found a Bug' },
  { id: 'feature',   label: '💡 Feature Idea' },
];

const RATING_LABELS = ['', 'Needs work 😕', 'Meh 🙁', 'Decent 😊', 'Love it! 🥰', 'Obsessed!! 🥑💕'];
const MAKER_EMAIL = 'sakshisi9051@gmail.com';

export function FeedbackPage({ onBack, onHome }: Props) {
  const [rating, setRating]           = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selected, setSelected]       = useState<string[]>([]);
  const [message, setMessage]         = useState('');
  const [submitted, setSubmitted]     = useState(false);

  const toggleCat = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const canSubmit = rating > 0 || message.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const subject = `🥑 Olly-AI feedback ${rating ? '— ' + '⭐'.repeat(rating) : ''}`;
    const bodyLines = [
      'Hi Sakshi!',
      '',
      `Rating: ${rating ? `${rating}/5 — ${RATING_LABELS[rating]}` : '—'}`,
      `Topics: ${selected.length ? selected.map(id => CATEGORIES.find(c => c.id === id)?.label ?? id).join(', ') : '—'}`,
      '',
      'Message:',
      message.trim() || '(no message)',
      '',
      '— sent from Olly-AI',
    ];
    const mailto = `mailto:${MAKER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(155deg, #fdf2f8 0%, #fffbf0 45%, #f0faf4 100%)' }}
    >
      {/* Soft blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[540px] h-[540px]" style={{
          background: 'radial-gradient(circle, #f9a8d4 0%, #ec4899 55%, transparent 100%)',
          opacity: 0.26, filter: 'blur(55px)',
          borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%',
        }} />
        <div className="absolute -bottom-32 -left-32 w-[540px] h-[540px]" style={{
          background: 'radial-gradient(circle, #95d5b2 0%, #2d6a4f 55%, transparent 100%)',
          opacity: 0.28, filter: 'blur(55px)',
          borderRadius: '40% 60% 70% 30%/40% 50% 60% 50%',
        }} />
        <div className="absolute top-[40%] -right-16 w-[240px] h-[240px]" style={{
          background: 'radial-gradient(circle, #f472b6 0%, #ec4899 60%, transparent 100%)',
          opacity: 0.16, filter: 'blur(45px)', borderRadius: '50%',
        }} />
      </div>

      <OllyNav
        step={3}
        onHome={onHome}
        rightSlot={
          <button
            onClick={onBack}
            className="flex items-center gap-1 font-display text-sm font-semibold transition-colors hover:opacity-70"
            style={{ color: '#40916c' }}
          >
            ← Back
          </button>
        }
      />

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-10 md:py-14 gap-10 relative z-10 max-w-2xl mx-auto w-full">

        {submitted ? <ThankYou onBack={onBack} onHome={onHome} /> : (
          <FeedbackForm
            rating={rating} setRating={setRating}
            hoverRating={hoverRating} setHoverRating={setHoverRating}
            selected={selected} toggleCat={toggleCat}
            message={message} setMessage={setMessage}
            canSubmit={canSubmit} onSubmit={handleSubmit}
          />
        )}

        {/* Divider */}
        <hr className="avo-divider w-full" />

        {/* About the maker — always visible, even on thank-you state */}
        <AboutTheMaker />
      </main>

      <footer
        className="py-6 px-6 text-center text-xs border-t font-display relative z-10"
        style={{ color: '#74c69d', borderColor: '#d8f3dc', background: 'rgba(240,250,244,0.6)' }}
      >
        Olly-AI 🥑 · feedback travels by 📬, nothing else
      </footer>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Feedback form
   ────────────────────────────────────────────────────────────────── */
function FeedbackForm({
  rating, setRating, hoverRating, setHoverRating,
  selected, toggleCat, message, setMessage,
  canSubmit, onSubmit,
}: {
  rating: number; setRating: (n: number) => void;
  hoverRating: number; setHoverRating: (n: number) => void;
  selected: string[]; toggleCat: (id: string) => void;
  message: string; setMessage: (m: string) => void;
  canSubmit: boolean; onSubmit: () => void;
}) {
  return (
    <div className="page-fade w-full">
      <div className="flex justify-center mb-2">
        <OllyMascot size={120} pose="curious" className="olly-glow-green" />
      </div>

      <div className="text-center mb-7">
        <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-2" style={{ color: '#1b4332' }}>
          How was Olly? <span style={{ color: '#ec4899' }}>🌸</span>
        </h1>
        <p className="text-sm md:text-base" style={{ color: '#74c69d' }}>
          Your feedback travels straight to my inbox 💌 (you&apos;ll review it in your mail app)
        </p>
      </div>

      <div
        className="rounded-3xl p-7 md:p-9 relative overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          border: '2.5px solid #1b4332',
          boxShadow: '6px 6px 0 0 #1b4332',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-[5px] rounded-t-[22px]" style={{ background: 'linear-gradient(90deg, #40916c 0%, #f472b6 50%, #40916c 100%)' }} />
        {/* Stars */}
        <div className="mb-6">
          <p className="font-display font-semibold text-sm mb-3 text-center" style={{ color: '#2d6a4f' }}>
            Rate your experience
          </p>
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = n <= (hoverRating || rating);
              return (
                <button
                  key={n}
                  className="star-btn text-4xl transition-all duration-150"
                  style={{ filter: filled ? 'none' : 'grayscale(1) opacity(.4)', transform: filled ? 'scale(1.1)' : 'scale(1)' }}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${n} stars`}
                >
                  ⭐
                </button>
              );
            })}
          </div>
          {(hoverRating || rating) > 0 && (
            <p className="text-center font-display text-sm font-semibold" style={{ color: '#ec4899' }}>
              {RATING_LABELS[hoverRating || rating]}
            </p>
          )}
        </div>

        {/* Categories */}
        <div className="mb-6">
          <p className="font-display font-semibold text-sm mb-3" style={{ color: '#2d6a4f' }}>
            What would you like to talk about?
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCat(c.id)}
                  className="px-3.5 py-1.5 rounded-full font-display font-semibold text-xs md:text-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background: active ? 'linear-gradient(135deg, #40916c, #52b788)' : 'rgba(208,243,220,0.5)',
                    color:      active ? '#fff' : '#2d6a4f',
                    border: `1.5px solid ${active ? '#40916c' : '#95d5b2'}`,
                    boxShadow:  active ? '0 2px 10px rgba(64,145,108,.25)' : 'none',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Textarea */}
        <div className="mb-7">
          <p className="font-display font-semibold text-sm mb-2" style={{ color: '#2d6a4f' }}>
            Tell Olly more 💬
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="I loved the karaoke animation… Olly could also add… I found a bug where…"
            className="w-full rounded-2xl px-4 py-3 text-sm resize-none outline-none transition-all"
            style={{
              background: 'rgba(240,250,244,0.85)',
              border: '1.5px solid #95d5b2',
              color: '#1c1917',
              fontFamily: 'var(--font-body)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#40916c'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(64,145,108,.12)'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = '#95d5b2'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all hover:-translate-y-1 active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          style={{
            background: canSubmit ? 'linear-gradient(135deg, #ec4899, #f472b6)' : '#e5e7eb',
            boxShadow:  canSubmit ? '0 6px 24px rgba(236,72,153,.35)' : 'none',
          }}
        >
          💌 Send to Sakshi
        </button>

        <p className="text-xs text-center mt-4" style={{ color: '#95d5b2' }}>
          Opens your mail app · feedback goes to <span style={{ color: '#40916c', fontWeight: 600 }}>{MAKER_EMAIL}</span> 🥑
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Thank you state
   ────────────────────────────────────────────────────────────────── */
function ThankYou({ onBack, onHome }: { onBack: () => void; onHome: () => void }) {
  return (
    <div className="page-fade text-center w-full max-w-md">
      <div className="flex justify-center mb-4">
        <OllyMascot size={160} pose="love" className="olly-glow-pink" />
      </div>
      <h2 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: '#1b4332' }}>
        Olly loves you! 💚
      </h2>
      <p className="text-base md:text-lg mb-7" style={{ color: '#52b788' }}>
        Your mail app should have opened. Hit send and your feedback flies straight to Sakshi 💌
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={onBack}
          className="w-full py-3.5 rounded-2xl font-display font-semibold text-white transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #40916c, #52b788)', boxShadow: '0 4px 18px rgba(64,145,108,.3)' }}
        >
          ← Back to Editor
        </button>
        <button
          onClick={onHome}
          className="w-full py-3 rounded-2xl font-display font-semibold text-sm transition-all hover:opacity-80"
          style={{ background: 'rgba(45,106,79,0.08)', color: '#2d6a4f', border: '1.5px solid #95d5b2' }}
        >
          🥑 Start a new video
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   About the maker — author bio card with socials
   ────────────────────────────────────────────────────────────────── */
function AboutTheMaker() {
  const socials = [
    {
      label: 'LinkedIn',
      url:   'https://www.linkedin.com/in/sakshisi11/',
      bg:    'linear-gradient(135deg, #0a66c2, #1e88e5)',
      icon:  <LinkedInIcon />,
    },
    {
      label: 'GitHub',
      url:   'https://github.com/SakshiS010',
      bg:    'linear-gradient(135deg, #1c1917, #44403c)',
      icon:  <GitHubIcon />,
    },
    {
      label: 'Portfolio',
      url:   'https://sakshisingh.vercel.app/',
      bg:    'linear-gradient(135deg, #ec4899, #f472b6)',
      icon:  <PortfolioIcon />,
    },
  ];

  return (
    <section className="w-full page-fade" style={{ animationDelay: '180ms' }}>
      {/* Section label */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #95d5b2)' }} />
        <span className="font-display text-xs font-bold uppercase tracking-widest" style={{ color: '#40916c' }}>
          ✦ about the maker ✦
        </span>
        <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, #95d5b2, transparent)' }} />
      </div>

      <div className="sticker-card relative p-6 md:p-8 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[5px] rounded-t-[18px]" style={{ background: 'linear-gradient(90deg, #f472b6 0%, #40916c 50%, #f472b6 100%)' }} />
        {/* Polaroid tape */}
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block px-6 py-1 rotate-[-3deg] font-display text-[10px] font-bold tracking-widest uppercase"
          style={{
            background: 'rgba(244,114,182,0.45)',
            color: '#7c2d4b',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          ✦ hi, I&apos;m Sakshi ✦
        </span>

        <div className="flex flex-col md:flex-row gap-6 items-start mt-2">
          {/* Polaroid avatar */}
          <div className="mx-auto md:mx-0 flex-shrink-0">
            <div
              className="p-2 pb-6 inline-block"
              style={{
                background: '#fff',
                boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
                transform: 'rotate(-4deg)',
              }}
            >
              <div className="w-32 h-32 flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #f9a8d4, #74c69d)' }}>
                <span className="font-display text-6xl font-black text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>S</span>
              </div>
              <p className="text-center font-display text-xs mt-2" style={{ color: '#1b4332', fontFamily: 'Caveat, cursive', fontSize: 18 }}>
                ~ Sakshi ~
              </p>
            </div>
          </div>

          {/* Bio + socials */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-1.5" style={{ color: '#1b4332' }}>
              Sakshi Singh
            </h3>
            <p className="font-display text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#ec4899' }}>
              builder · creator · CSE major
            </p>
            <p
              className="text-base leading-relaxed mb-5"
              style={{ color: '#374151', fontStyle: 'italic', borderLeft: '3px solid #f472b6', paddingLeft: 12 }}
            >
              &ldquo;A passionate CSE major, who loves building and questioning, the environments and world around her, and loves to connect with like-minded people.&rdquo;
            </p>

            <div className="grid grid-cols-3 gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl font-display font-bold text-xs text-white transition-all hover:-translate-y-1 active:scale-95"
                  style={{ background: s.bg, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
                >
                  <span className="transition-transform group-hover:scale-110">{s.icon}</span>
                  <span>{s.label}</span>
                </a>
              ))}
            </div>

            <p className="text-xs mt-4 text-center md:text-left" style={{ color: '#95d5b2' }}>
              📬 reach out: <span style={{ color: '#40916c', fontWeight: 600 }}>{MAKER_EMAIL}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Inline SVG socials ─────────────────────────────────────────── */
function LinkedInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.7a1.8 1.8 0 110-3.6 1.8 1.8 0 010 3.6zM20 19h-3v-5.6c0-1.4-.5-2.4-1.8-2.4-1 0-1.6.7-1.8 1.3-.1.2-.1.5-.1.8V19h-3V8h3v1.3c.4-.6 1.1-1.5 2.7-1.5 2 0 3.5 1.3 3.5 4.2V19z" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3" />
    </svg>
  );
}
function PortfolioIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15 15 0 010 20a15 15 0 010-20z" />
    </svg>
  );
}

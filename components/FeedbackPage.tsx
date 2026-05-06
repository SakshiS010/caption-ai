'use client';

import { useState } from 'react';
import { OllyNav } from './OllyNav';

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
  { id: 'bug',       label: '🐛 Found a Bug' },
];

export function FeedbackPage({ onBack, onHome }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleCat = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const canSubmit = rating > 0 || message.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
  };

  const ratingLabels = ['', 'Needs work 😕', 'Meh 🙁', 'Decent 😊', 'Love it! 🥰', 'Obsessed!! 🥑💕'];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(145deg, #fdf2f8 0%, #fffbf0 45%, #f0faf4 100%)' }}
    >
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

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {submitted ? (
          /* ── Thank you state ───────────────────────────────────── */
          <div className="page-fade text-center max-w-sm">
            <div className="text-8xl mb-6 avo-float inline-block">🥑</div>
            <div
              className="avo-wobble text-5xl mb-4 inline-block"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(244,114,182,.4))' }}
            >
              💕
            </div>
            <h2
              className="font-display text-4xl font-bold mb-3"
              style={{ color: '#1b4332' }}
            >
              Olly loves you!
            </h2>
            <p className="text-lg mb-8" style={{ color: '#52b788' }}>
              Thank you for helping make Olly better. You&apos;re a star! ⭐
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
        ) : (
          /* ── Feedback form ─────────────────────────────────────── */
          <div
            className="page-fade w-full max-w-lg rounded-3xl p-8 md:p-10"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(149,213,178,0.35)',
              boxShadow: '0 20px 60px rgba(45,106,79,0.12), 0 4px 20px rgba(244,114,182,0.1)',
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="text-7xl mb-4 avo-float inline-block"
                style={{ filter: 'drop-shadow(0 8px 20px rgba(45,106,79,.2))' }}
              >
                🥑
              </div>
              <h1 className="font-display text-4xl font-bold mb-2" style={{ color: '#1b4332' }}>
                How was Olly? 🌸
              </h1>
              <p className="text-sm" style={{ color: '#74c69d' }}>
                Your feedback helps Olly grow into the best avocado AI it can be!
              </p>
            </div>

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
                      style={{
                        filter: filled ? 'none' : 'grayscale(1) opacity(.4)',
                        transform: filled ? 'scale(1.1)' : 'scale(1)',
                      }}
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
                  {ratingLabels[hoverRating || rating]}
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
                      className="px-4 py-2 rounded-full font-display font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: active ? 'linear-gradient(135deg, #40916c, #52b788)' : 'rgba(208,243,220,0.5)',
                        color: active ? '#fff' : '#2d6a4f',
                        border: `1.5px solid ${active ? '#40916c' : '#95d5b2'}`,
                        boxShadow: active ? '0 2px 12px rgba(64,145,108,.25)' : 'none',
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
                placeholder="I loved the karaoke animation... Olly could also add... I found a bug where..."
                className="w-full rounded-2xl px-4 py-3 text-sm resize-none outline-none transition-all duration-200"
                style={{
                  background: 'rgba(240,250,244,0.8)',
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
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all duration-200 hover:-translate-y-1 active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: canSubmit
                  ? 'linear-gradient(135deg, #ec4899, #f472b6)'
                  : '#e5e7eb',
                boxShadow: canSubmit ? '0 6px 24px rgba(236,72,153,.35)' : 'none',
              }}
            >
              💌 Send to Olly
            </button>

            <p className="text-xs text-center mt-4" style={{ color: '#95d5b2' }}>
              Feedback is anonymous &middot; no account needed 🥑
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import type { CSSProperties } from 'react';

export type OllyPose = 'idle' | 'happy' | 'wave' | 'curious' | 'love' | 'point' | 'sleep';

interface Props {
  size?: number;
  pose?: OllyPose;
  className?: string;
  style?: CSSProperties;
  /** Stagger blink so multiple Ollys don't blink in sync. */
  blinkDelay?: number;
  /** Disable the float animation. */
  still?: boolean;
}

/**
 * Olly — the avocado mascot. Replaces the static 🥑 emoji with a real
 * SVG character whose eyes blink, body floats, and mouth/pose can be
 * swapped to show different moods.
 */
export function OllyMascot({
  size = 140,
  pose = 'idle',
  className = '',
  style,
  blinkDelay = 0,
  still = false,
}: Props) {
  const mouth = MOUTHS[pose];
  const eyes  = EYE_VARIANTS[pose];
  const arm   = pose === 'wave' ? 'wave' : pose === 'point' ? 'point' : 'rest';

  return (
    <svg
      viewBox="0 0 220 260"
      width={size}
      height={size * (260 / 220)}
      className={`${className} ${still ? '' : 'olly-float'}`}
      style={{ overflow: 'visible', ...style }}
      aria-label="Olly the avocado"
    >
      <defs>
        <radialGradient id="olly-skin" cx="35%" cy="30%" r="80%">
          <stop offset="0%"  stopColor="#74c69d" />
          <stop offset="55%" stopColor="#40916c" />
          <stop offset="100%" stopColor="#1b4332" />
        </radialGradient>
        <radialGradient id="olly-flesh" cx="35%" cy="35%" r="80%">
          <stop offset="0%"  stopColor="#fffbf0" />
          <stop offset="45%" stopColor="#f0faf4" />
          <stop offset="100%" stopColor="#b7e4c7" />
        </radialGradient>
        <radialGradient id="olly-pit" cx="35%" cy="30%" r="75%">
          <stop offset="0%"  stopColor="#d97706" />
          <stop offset="60%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </radialGradient>
        <radialGradient id="blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#f472b6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="110" cy="248" rx="62" ry="6" fill="rgba(15,31,22,0.28)" />

      {/* Stem & leaf */}
      <g transform="translate(110 22)">
        <path d="M 0 0 Q -2 -10 3 -16 Q 9 -13 6 -2 Z" fill="#2d6a4f" />
        <path d="M 6 -2 Q 26 -18 30 -8 Q 22 4 6 -2 Z" fill="#52b788" />
        <path d="M 12 -4 Q 22 -10 25 -6" stroke="#1b4332" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>

      {/* Outer skin (the pear-shaped avocado body) */}
      <path
        d="M 110 24
           C 65 24, 38 70, 38 130
           C 38 195, 70 240, 110 240
           C 150 240, 182 195, 182 130
           C 182 70, 155 24, 110 24 Z"
        fill="url(#olly-skin)"
        stroke="#1b4332"
        strokeWidth="2.5"
      />

      {/* Skin highlight */}
      <path
        d="M 70 65 Q 60 110, 75 160"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Inner flesh */}
      <path
        d="M 110 42
           C 78 42, 56 80, 56 132
           C 56 188, 82 226, 110 226
           C 138 226, 164 188, 164 132
           C 164 80, 142 42, 110 42 Z"
        fill="url(#olly-flesh)"
      />

      {/* Arms (leaf hands) */}
      {arm === 'rest' && (
        <>
          <ellipse cx="42" cy="160" rx="14" ry="22" fill="#40916c" transform="rotate(-20 42 160)" />
          <ellipse cx="178" cy="160" rx="14" ry="22" fill="#40916c" transform="rotate(20 178 160)" />
        </>
      )}
      {arm === 'wave' && (
        <>
          <ellipse cx="42" cy="160" rx="14" ry="22" fill="#40916c" transform="rotate(-20 42 160)" />
          <g className="olly-wave-arm" style={{ transformOrigin: '178px 165px' }}>
            <ellipse cx="178" cy="135" rx="14" ry="22" fill="#40916c" transform="rotate(35 178 135)" />
            <circle cx="190" cy="115" r="6" fill="#52b788" />
          </g>
        </>
      )}
      {arm === 'point' && (
        <>
          <ellipse cx="42" cy="160" rx="14" ry="22" fill="#40916c" transform="rotate(-20 42 160)" />
          <ellipse cx="186" cy="150" rx="12" ry="20" fill="#40916c" transform="rotate(55 186 150)" />
          <circle cx="200" cy="138" r="5" fill="#52b788" />
        </>
      )}

      {/* The pit — Olly's face lives here */}
      <g>
        <ellipse cx="110" cy="148" rx="48" ry="50" fill="url(#olly-pit)" stroke="#451a03" strokeWidth="1.5" />
        <ellipse cx="95" cy="125" rx="22" ry="14" fill="rgba(255,255,255,0.12)" />

        {/* Blush */}
        <circle cx="80" cy="160" r="12" fill="url(#blush)" />
        <circle cx="140" cy="160" r="12" fill="url(#blush)" />

        {/* Eyes */}
        {eyes === 'open' && (
          <>
            <Eye cx={92}  cy={140} delay={blinkDelay} />
            <Eye cx={128} cy={140} delay={blinkDelay} />
          </>
        )}
        {eyes === 'crescent' && (
          <>
            <path d="M 84 142 Q 92 134 100 142" stroke="#fffbf0" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 120 142 Q 128 134 136 142" stroke="#fffbf0" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
        {eyes === 'heart' && (
          <>
            <Heart cx={92} cy={140} />
            <Heart cx={128} cy={140} />
          </>
        )}
        {eyes === 'wonky' && (
          <>
            <Eye cx={92}  cy={138} delay={blinkDelay} small />
            <Eye cx={128} cy={142} delay={blinkDelay} />
          </>
        )}
        {eyes === 'closed' && (
          <>
            <path d="M 84 142 Q 92 148 100 142" stroke="#fffbf0" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 120 142 Q 128 148 136 142" stroke="#fffbf0" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Z's for sleep */}
            <text x="150" y="115" fontSize="18" fill="#fffbf0" fontFamily="Caveat, cursive">z</text>
            <text x="160" y="100" fontSize="14" fill="#fffbf0" fontFamily="Caveat, cursive">z</text>
          </>
        )}

        {/* Mouth */}
        {mouth}
      </g>

      {/* Pink bow hair accessory — rendered last so it sits on top */}
      <g transform="translate(110 36)">
        <ellipse cx="-13" cy="-1" rx="12" ry="7" fill="#f472b6" stroke="#be185d" strokeWidth="1.2" transform="rotate(-20 -13 -1)" />
        <ellipse cx="13" cy="-1" rx="12" ry="7" fill="#f472b6" stroke="#be185d" strokeWidth="1.2" transform="rotate(20 13 -1)" />
        <circle cx="0" cy="-1" r="5" fill="#be185d" />
        <circle cx="0" cy="-1" r="2.2" fill="#fce7f3" />
      </g>
    </svg>
  );
}

/* ── Eye component (with blink) ─────────────────────────────────────── */
function Eye({ cx, cy, delay = 0, small = false }: { cx: number; cy: number; delay?: number; small?: boolean }) {
  const r = small ? 5.5 : 7;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r} ry={r + 1} fill="#fffbf0" />
      <ellipse
        cx={cx}
        cy={cy + 1}
        rx={r - 2}
        ry={r - 1}
        fill="#0f1f16"
        style={{ transformOrigin: `${cx}px ${cy}px`, animation: `olly-blink 5s ${delay}ms infinite` }}
      />
      <circle cx={cx - 1.5} cy={cy - 2} r="1.5" fill="#fffbf0" />
    </g>
  );
}

function Heart({ cx, cy }: { cx: number; cy: number }) {
  return (
    <path
      d={`M ${cx} ${cy + 5}
         C ${cx} ${cy + 1}, ${cx - 6} ${cy - 4}, ${cx - 6} ${cy}
         C ${cx - 6} ${cy - 5}, ${cx} ${cy - 5}, ${cx} ${cy - 1}
         C ${cx} ${cy - 5}, ${cx + 6} ${cy - 5}, ${cx + 6} ${cy}
         C ${cx + 6} ${cy - 4}, ${cx} ${cy + 1}, ${cx} ${cy + 5} Z`}
      fill="#f472b6"
      style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'olly-heart 1.4s ease-in-out infinite' }}
    />
  );
}

/* ── Mouth & eye variants per pose ──────────────────────────────────── */
const MOUTHS: Record<OllyPose, React.ReactNode> = {
  idle:    <path d="M 96 168 Q 110 178 124 168" stroke="#fffbf0" strokeWidth="3" fill="none" strokeLinecap="round" />,
  happy:   <path d="M 92 165 Q 110 184 128 165 Q 110 178 92 165 Z" fill="#fffbf0" stroke="#fffbf0" strokeWidth="2.5" strokeLinejoin="round" />,
  wave:    <path d="M 96 168 Q 110 178 124 168" stroke="#fffbf0" strokeWidth="3" fill="none" strokeLinecap="round" />,
  curious: <ellipse cx="110" cy="170" rx="4" ry="6" fill="#fffbf0" />,
  love:    <path d="M 96 170 Q 110 180 124 170" stroke="#fffbf0" strokeWidth="3" fill="none" strokeLinecap="round" />,
  point:   <path d="M 96 168 Q 110 174 124 168" stroke="#fffbf0" strokeWidth="3" fill="none" strokeLinecap="round" />,
  sleep:   <path d="M 102 170 Q 110 174 118 170" stroke="#fffbf0" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
};

const EYE_VARIANTS: Record<OllyPose, 'open' | 'crescent' | 'heart' | 'wonky' | 'closed'> = {
  idle:    'open',
  happy:   'crescent',
  wave:    'open',
  curious: 'wonky',
  love:    'heart',
  point:   'open',
  sleep:   'closed',
};

/* ── OllyBadge — compact round Olly icon for nav bars ───────────────── */
interface BadgeProps {
  size?: number;
  className?: string;
  /** Pause float animation */
  still?: boolean;
  /** Stagger the eye blink */
  blinkDelay?: number;
}

export function OllyBadge({ size = 40, className = '', still = false, blinkDelay = 0 }: BadgeProps) {
  return (
    <svg
      viewBox="0 0 64 72"
      width={size}
      height={size * (72 / 64)}
      className={`${className} ${still ? '' : 'olly-float'}`}
      style={{ overflow: 'visible' }}
      aria-label="Olly the avocado"
    >
      <defs>
        <radialGradient id="badge-skin" cx="35%" cy="30%" r="75%">
          <stop offset="0%"  stopColor="#74c69d" />
          <stop offset="50%" stopColor="#40916c" />
          <stop offset="100%" stopColor="#1b4332" />
        </radialGradient>
        <radialGradient id="badge-flesh" cx="38%" cy="35%" r="75%">
          <stop offset="0%"  stopColor="#fffbf0" />
          <stop offset="55%" stopColor="#f0faf4" />
          <stop offset="100%" stopColor="#b7e4c7" />
        </radialGradient>
        <radialGradient id="badge-pit" cx="35%" cy="30%" r="70%">
          <stop offset="0%"  stopColor="#d97706" />
          <stop offset="60%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="32" cy="69" rx="20" ry="3" fill="rgba(15,31,22,0.20)" />

      {/* Stem */}
      <g transform="translate(32 10)">
        <path d="M 0 0 Q -1 -6 2 -9 Q 5 -7 3 -1 Z" fill="#2d6a4f" />
        <path d="M 3 -1 Q 14 -10 16 -5 Q 12 2 3 -1 Z" fill="#52b788" />
      </g>

      {/* Outer skin — round-ish avocado shape */}
      <path
        d="M 32 10
           C 14 10, 6 28, 6 42
           C 6 56, 18 66, 32 66
           C 46 66, 58 56, 58 42
           C 58 28, 50 10, 32 10 Z"
        fill="url(#badge-skin)"
        stroke="#1b4332"
        strokeWidth="1.8"
      />

      {/* Skin highlight */}
      <path d="M 14 24 Q 11 40 17 54" stroke="rgba(255,255,255,0.16)" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Inner flesh */}
      <path
        d="M 32 18
           C 20 18, 14 32, 14 43
           C 14 55, 22 62, 32 62
           C 42 62, 50 55, 50 43
           C 50 32, 44 18, 32 18 Z"
        fill="url(#badge-flesh)"
      />

      {/* Pit */}
      <ellipse cx="32" cy="46" rx="11" ry="12" fill="url(#badge-pit)" stroke="#451a03" strokeWidth="1" />
      <ellipse cx="28" cy="40" rx="5" ry="3" fill="rgba(255,255,255,0.14)" />

      {/* Blush */}
      <circle cx="20" cy="46" r="5" fill="#f472b6" opacity="0.45" />
      <circle cx="44" cy="46" r="5" fill="#f472b6" opacity="0.45" />

      {/* Eyes */}
      <g>
        <ellipse cx="26" cy="36" rx="4" ry="4.5" fill="#fffbf0" />
        <ellipse
          cx="26" cy="37" rx="2.5" ry="2.5" fill="#0f1f16"
          style={{ transformOrigin: '26px 36px', animation: `olly-blink 5s ${blinkDelay}ms infinite` }}
        />
        <circle cx="25" cy="35.5" r="1" fill="#fffbf0" />
      </g>
      <g>
        <ellipse cx="38" cy="36" rx="4" ry="4.5" fill="#fffbf0" />
        <ellipse
          cx="38" cy="37" rx="2.5" ry="2.5" fill="#0f1f16"
          style={{ transformOrigin: '38px 36px', animation: `olly-blink 5s ${blinkDelay + 200}ms infinite` }}
        />
        <circle cx="37" cy="35.5" r="1" fill="#fffbf0" />
      </g>

      {/* Smile */}
      <path d="M 26 42 Q 32 47 38 42" stroke="#fffbf0" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Pink bow — rendered last */}
      <g transform="translate(32 12)">
        <ellipse cx="-7" cy="0" rx="7" ry="4" fill="#f472b6" stroke="#be185d" strokeWidth="0.9" transform="rotate(-20 -7 0)" />
        <ellipse cx="7"  cy="0" rx="7" ry="4" fill="#f472b6" stroke="#be185d" strokeWidth="0.9" transform="rotate(20 7 0)" />
        <circle cx="0" cy="0" r="3" fill="#be185d" />
        <circle cx="0" cy="0" r="1.3" fill="#fce7f3" />
      </g>
    </svg>
  );
}

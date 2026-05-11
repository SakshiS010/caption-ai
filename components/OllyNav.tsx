'use client';

import React from 'react';
import { OllyBadge } from './OllyMascot';

interface OllyNavProps {
  step: 1 | 2 | 3;
  onHome: () => void;
  dark?: boolean;
  rightSlot?: React.ReactNode;
}

const STEPS = [
  { n: 1 as const, label: 'Upload' },
  { n: 2 as const, label: 'Style' },
  { n: 3 as const, label: 'Feedback' },
];

export function OllyNav({ step, onHome, dark = false, rightSlot }: OllyNavProps) {
  const bg   = dark ? 'rgba(15,31,22,0.92)'    : 'rgba(255,251,240,0.9)';
  const bdr  = dark ? '#2d5540'                 : '#d8f3dc';
  const logo = dark ? '#95d5b2'                 : '#1b4332';
  const dim  = dark ? 'rgba(148,213,178,0.35)'  : '#d8f3dc';
  const done = '#52b788';
  const active = '#f472b6';

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
      style={{ background: bg, backdropFilter: 'blur(16px)', borderBottom: `1.5px solid ${bdr}` }}
    >
      {/* Logo */}
      <button onClick={onHome} className="flex items-center gap-1.5 group">
        <span
          className="font-display text-xl font-bold tracking-tight transition-colors duration-200"
          style={{ color: logo }}
        >
          Olly-AI
        </span>
        <OllyBadge
          size={36}
          className="group-hover:scale-110 transition-transform duration-200"
        />
      </button>

      {/* Step breadcrumb */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.n}>
            {i > 0 && (
              <div className="w-5 h-px rounded-full" style={{ background: step > s.n - 1 ? done : dim }} />
            )}
            <div className="flex items-center gap-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200"
                style={{
                  background: step > s.n ? done : step === s.n ? active : 'transparent',
                  border: `2px solid ${step >= s.n ? (step > s.n ? done : active) : dim}`,
                  color: step >= s.n ? '#fff' : dark ? '#52b788' : '#2d6a4f',
                  transform: step === s.n ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {step > s.n ? '✓' : s.n}
              </div>
              <span
                className="hidden sm:inline text-[11px] font-semibold"
                style={{ color: step === s.n ? active : step > s.n ? done : dark ? '#52b788' : '#74c69d' }}
              >
                {s.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Right slot */}
      <div className="min-w-[80px] flex justify-end">{rightSlot}</div>
    </nav>
  );
}

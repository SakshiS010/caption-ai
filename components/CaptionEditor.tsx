'use client';

import type { CaptionSegment } from '@/lib/types';

interface Props {
  segments: CaptionSegment[];
  currentTime: number;
  onUpdate: (segments: CaptionSegment[]) => void;
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(1).padStart(4, '0');
  return `${m}:${s}`;
}

export function CaptionEditor({ segments, currentTime, onUpdate }: Props) {
  const updateText = (id: string, text: string) => {
    onUpdate(segments.map((s) => (s.id === id ? { ...s, text } : s)));
  };

  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border border-dashed border-gray-700 rounded-xl text-gray-500 text-sm text-center px-4">
        Click &ldquo;Generate Captions&rdquo; and your transcript will appear here for editing.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-[520px] pr-1">
      {segments.map((seg) => {
        const isActive = currentTime >= seg.start && currentTime <= seg.end;
        return (
          <div
            key={seg.id}
            className={`rounded-lg border p-3 transition-colors ${
              isActive ? 'border-blue-500 bg-blue-950/40' : 'border-gray-800 bg-gray-900'
            }`}
          >
            <div className="flex gap-2 mb-1.5 font-mono text-xs text-gray-500">
              <span>{fmt(seg.start)}</span>
              <span>→</span>
              <span>{fmt(seg.end)}</span>
            </div>
            <textarea
              className="w-full bg-transparent text-sm text-gray-100 resize-none outline-none leading-relaxed"
              rows={2}
              value={seg.text}
              onChange={(e) => updateText(seg.id, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}

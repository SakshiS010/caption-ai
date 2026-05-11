'use client';

import { useRef, useEffect } from 'react';
import type { CaptionSegment, WordStyle } from '@/lib/types';

interface Props {
  segments:    CaptionSegment[];
  currentTime: number;
  onUpdate:    (segments: CaptionSegment[]) => void;
  selectedId?: string;
  onSelect?:   (id: string) => void;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1).padStart(4, '0');
  return `${m}:${sec}`;
}

function hasWordStyle(ws?: WordStyle): boolean {
  return !!(ws && (ws.color || ws.bold !== undefined || ws.italic !== undefined || ws.scale !== undefined));
}

function styledWordCount(seg: CaptionSegment): number {
  return seg.words?.filter((w) => hasWordStyle(w.style)).length ?? 0;
}

export function CaptionEditor({ segments, currentTime, onUpdate, selectedId, onSelect }: Props) {
  const listRef  = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* Auto-scroll to selected segment */
  useEffect(() => {
    if (!selectedId) return;
    const el = itemRefs.current[selectedId];
    if (el && listRef.current) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  const updateText = (id: string, text: string) => {
    onUpdate(
      segments.map((s) => {
        if (s.id !== id) return s;
        // Re-sync words array when text changes (preserve styles if word count unchanged)
        const tokens = text.split(/\s+/).filter(Boolean);
        const newWords = s.words && s.words.length === tokens.length
          ? tokens.map((t, i) => ({ text: t, style: s.words![i].style }))
          : undefined;
        return { ...s, text, words: newWords };
      })
    );
  };

  const updateTime = (id: string, field: 'start' | 'end', raw: string) => {
    const v = parseFloat(raw);
    if (!isNaN(v)) onUpdate(segments.map((s) => (s.id === id ? { ...s, [field]: Math.max(0, v) } : s)));
  };

  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border border-dashed border-gray-700 rounded-xl text-gray-500 text-sm text-center px-4">
        Click &ldquo;Generate Captions&rdquo; and your transcript will appear here for editing.
      </div>
    );
  }

  return (
    <div ref={listRef} className="flex flex-col gap-2 overflow-y-auto max-h-[520px] pr-1">
      {segments.map((seg) => {
        const isActive   = currentTime >= seg.start && currentTime <= seg.end;
        const isSelected = seg.id === selectedId;
        const numStyled  = styledWordCount(seg);

        return (
          <div
            key={seg.id}
            ref={(el) => { itemRefs.current[seg.id] = el; }}
            onClick={() => onSelect?.(seg.id)}
            className="rounded-lg border p-3 transition-colors cursor-pointer"
            style={{
              borderColor: isSelected
                ? 'rgba(244,114,182,0.75)'
                : isActive
                ? 'rgba(82,183,136,0.55)'
                : 'rgba(55,65,81,0.8)',
              background: isSelected
                ? 'rgba(244,114,182,0.08)'
                : isActive
                ? 'rgba(52,183,136,0.07)'
                : 'rgba(17,24,39,0.6)',
              boxShadow: isSelected ? '0 0 0 1px rgba(244,114,182,0.25)' : 'none',
            }}
          >
            {/* Timestamp row */}
            <div className="flex items-center gap-2 mb-2 font-mono text-xs" style={{ color: '#74c69d' }}>
              {isSelected ? (
                <>
                  <input
                    type="number" step="0.1" min="0"
                    defaultValue={seg.start.toFixed(1)}
                    onBlur={(e) => updateTime(seg.id, 'start', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 bg-transparent outline-none border-b text-center"
                    style={{ borderColor: 'rgba(244,114,182,0.4)', color: '#f472b6' }}
                  />
                  <span style={{ color: '#52b788' }}>→</span>
                  <input
                    type="number" step="0.1" min="0"
                    defaultValue={seg.end.toFixed(1)}
                    onBlur={(e) => updateTime(seg.id, 'end', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 bg-transparent outline-none border-b text-center"
                    style={{ borderColor: 'rgba(244,114,182,0.4)', color: '#f472b6' }}
                  />
                  <span style={{ color: '#40916c', opacity: 0.7, marginLeft: 'auto' }}>
                    {(seg.end - seg.start).toFixed(2)}s
                  </span>
                </>
              ) : (
                <>
                  <span>{fmt(seg.start)}</span>
                  <span style={{ color: '#52b788' }}>→</span>
                  <span>{fmt(seg.end)}</span>
                </>
              )}

              {/* Word-emphasis badge */}
              {numStyled > 0 && (
                <span
                  style={{
                    marginLeft: isSelected ? 0 : 'auto',
                    background: 'rgba(244,114,182,0.15)',
                    border: '1px solid rgba(244,114,182,0.4)',
                    color: '#f9a8d4',
                    borderRadius: 4,
                    padding: '1px 5px',
                    fontSize: 9,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ✦ {numStyled} styled
                </span>
              )}
            </div>

            {/* Text area */}
            <textarea
              className="w-full bg-transparent text-sm resize-none outline-none leading-relaxed"
              style={{ color: isSelected ? '#fff' : '#d1d5db' }}
              rows={2}
              value={seg.text}
              onChange={(e) => updateText(seg.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      })}
    </div>
  );
}

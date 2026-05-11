'use client';

import { useState } from 'react';
import type { CaptionSegment, WordSpan, WordStyle } from '@/lib/types';

interface Props {
  segments:          CaptionSegment[];
  onSegmentsChange:  (segs: CaptionSegment[]) => void;
  currentTime:       number;
}

const WORD_COLORS = [
  '#FFFFFF', '#FFEB3B', '#f472b6', '#60a5fa',
  '#34d399', '#f97316', '#a78bfa', '#f87171',
];
const SCALES = [
  { label: '0.8×', v: 0.8  as number | undefined },
  { label: '1×',   v: undefined },
  { label: '1.2×', v: 1.2  as number | undefined },
  { label: '1.5×', v: 1.5  as number | undefined },
  { label: '2×',   v: 2.0  as number | undefined },
];

function hasWordStyle(ws?: WordStyle): boolean {
  return !!(ws && (ws.color || ws.bold !== undefined || ws.italic !== undefined || ws.scale !== undefined));
}
function hexToRgba(hex: string, a: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function getSpans(seg: CaptionSegment): WordSpan[] {
  const tokens = (seg.text ?? '').split(/\s+/).filter(Boolean);
  if (seg.words && seg.words.length === tokens.length) return seg.words;
  return tokens.map((t, i) => ({
    text: t,
    style: seg.words?.[i]?.text === t ? seg.words![i].style : undefined,
  }));
}
function fmtTs(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
}

/* ──────────────────────────────────────────────────────────────────
   Floating toolbar  — appears when at least one word is selected
   ────────────────────────────────────────────────────────────────── */
function EmphasisToolbar({
  count, aggStyle, onApply, onClearSelected, onDone,
}: {
  count: number;
  aggStyle: WordStyle;
  onApply: (d: Partial<WordStyle>) => void;
  onClearSelected: () => void;
  onDone: () => void;
}) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: 'linear-gradient(180deg, rgba(20,38,28,0.98) 0%, rgba(20,38,28,0.96) 100%)',
      backdropFilter: 'blur(8px)',
      border: '1.5px solid rgba(244,114,182,0.55)',
      borderRadius: 14,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxShadow: '0 8px 28px rgba(0,0,0,0.4), 0 0 0 1px rgba(244,114,182,0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#f9a8d4', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f472b6', boxShadow: '0 0 6px #f472b6' }} />
          {count} word{count !== 1 ? 's' : ''} selected
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onClearSelected}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#d8f3dc', fontSize: 11, cursor: 'pointer', borderRadius: 6, padding: '3px 9px', fontWeight: 500 }}
          >
            Reset style
          </button>
          <button
            onClick={onDone}
            style={{ background: 'linear-gradient(135deg,#2d6a4f,#40916c)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', borderRadius: 6, padding: '3px 11px', fontWeight: 600 }}
          >
            ✓ Done
          </button>
        </div>
      </div>

      {/* Color row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ color: '#95d5b2', fontSize: 10, fontWeight: 700, minWidth: 36, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Color</span>
        {WORD_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onApply({ color: c })}
            title={c}
            style={{
              width: 22, height: 22, borderRadius: '50%',
              background: c,
              border: aggStyle.color === c
                ? '2.5px solid #f472b6'
                : '1.5px solid rgba(255,255,255,0.25)',
              cursor: 'pointer', flexShrink: 0,
              boxShadow: aggStyle.color === c ? `0 0 10px ${c}` : 'none',
              transition: 'all 0.12s',
            }}
          />
        ))}
        <input
          type="color"
          value={aggStyle.color ?? '#FFFFFF'}
          onChange={(e) => onApply({ color: e.target.value.toUpperCase() })}
          title="Custom colour"
          style={{ width: 24, height: 24, borderRadius: 4, cursor: 'pointer', border: '1.5px solid rgba(255,255,255,0.25)', background: 'transparent' }}
        />
      </div>

      {/* Style + Size row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ color: '#95d5b2', fontSize: 10, fontWeight: 700, minWidth: 36, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Style</span>
        <TBtn active={!!aggStyle.bold}   onClick={() => onApply({ bold:   !aggStyle.bold })}><b>B</b></TBtn>
        <TBtn active={!!aggStyle.italic} onClick={() => onApply({ italic: !aggStyle.italic })}><i>I</i></TBtn>
        <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
        <span style={{ color: '#95d5b2', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Size</span>
        {SCALES.map(({ label, v }) => (
          <TBtn key={label} active={aggStyle.scale === v} small onClick={() => onApply({ scale: v })}>{label}</TBtn>
        ))}
      </div>
    </div>
  );
}

function TBtn({ active, onClick, children, small }: {
  active: boolean; onClick: () => void; children: React.ReactNode; small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(244,114,182,0.3)' : 'rgba(255,255,255,0.08)',
        border: active ? '1.5px solid rgba(244,114,182,0.85)' : '1px solid rgba(255,255,255,0.2)',
        color: active ? '#f9a8d4' : '#d8f3dc',
        borderRadius: 6,
        padding: small ? '3px 8px' : '3px 11px',
        fontSize: small ? 11 : 13,
        cursor: 'pointer',
        fontWeight: active ? 700 : 500,
        transition: 'all 0.12s',
        minWidth: small ? 32 : 28,
      }}
    >
      {children}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Main component  — VEED-style inline word selection
   ────────────────────────────────────────────────────────────────── */
export function EmphasisTab({ segments, onSegmentsChange, currentTime }: Props) {
  const [activeSegId,  setActiveSegId]  = useState<string | null>(null);
  const [selectedIdxs, setSelectedIdxs] = useState<Set<number>>(new Set());

  const activeSeg = segments.find(s => s.id === activeSegId);

  /* Aggregate style across selected words for toolbar */
  const aggStyle: WordStyle = {};
  if (activeSeg && selectedIdxs.size > 0) {
    const spans = getSpans(activeSeg);
    const sel = [...selectedIdxs].map(i => spans[i]?.style ?? {});
    if (sel.length && sel.every(s => s.bold))   aggStyle.bold   = true;
    if (sel.length && sel.every(s => s.italic)) aggStyle.italic = true;
    const fc = sel[0]?.color;
    if (fc && sel.every(s => s.color === fc)) aggStyle.color = fc;
    const fs = sel[0]?.scale;
    if (fs !== undefined && sel.every(s => s.scale === fs)) aggStyle.scale = fs;
  }

  const toggleWord = (segId: string, idx: number) => {
    const seg = segments.find(s => s.id === segId);
    if (!seg) return;
    const spans = getSpans(seg);
    if (!seg.words || seg.words.length !== spans.length) {
      onSegmentsChange(segments.map(s => s.id === segId ? { ...s, words: spans } : s));
    }
    if (activeSegId !== segId) {
      setActiveSegId(segId);
      setSelectedIdxs(new Set([idx]));
    } else {
      setSelectedIdxs(prev => {
        const n = new Set(prev);
        n.has(idx) ? n.delete(idx) : n.add(idx);
        if (n.size === 0) setActiveSegId(null);
        return n;
      });
    }
  };

  const selectAllInSegment = (segId: string) => {
    const seg = segments.find(s => s.id === segId);
    if (!seg) return;
    const spans = getSpans(seg);
    if (!seg.words || seg.words.length !== spans.length) {
      onSegmentsChange(segments.map(s => s.id === segId ? { ...s, words: spans } : s));
    }
    setActiveSegId(segId);
    setSelectedIdxs(new Set(spans.map((_, i) => i)));
  };

  const applyStyle = (delta: Partial<WordStyle>) => {
    if (!activeSeg) return;
    const spans = getSpans(activeSeg);
    const newWords = spans.map((w, i) => {
      if (!selectedIdxs.has(i)) return w;
      const merged: WordStyle = { ...w.style, ...delta };
      if (delta.scale === undefined && 'scale' in delta) delete merged.scale;
      const clean = Object.fromEntries(
        Object.entries(merged).filter(([, v]) => v !== undefined)
      ) as WordStyle;
      return { ...w, style: Object.keys(clean).length ? clean : undefined };
    });
    onSegmentsChange(segments.map(s => s.id === activeSegId ? { ...s, words: newWords } : s));
  };

  const clearSelected = () => {
    if (!activeSeg) return;
    const spans = getSpans(activeSeg);
    onSegmentsChange(segments.map(s =>
      s.id === activeSegId
        ? { ...s, words: spans.map((w, i) => selectedIdxs.has(i) ? { text: w.text } : w) }
        : s
    ));
  };

  const clearSegStyles = (segId: string) => {
    onSegmentsChange(segments.map(s => {
      if (s.id !== segId) return s;
      const tokens = (s.text ?? '').split(/\s+/).filter(Boolean);
      return { ...s, words: tokens.map(t => ({ text: t })) };
    }));
    if (segId === activeSegId) {
      setSelectedIdxs(new Set());
      setActiveSegId(null);
    }
  };

  const doneEditing = () => {
    setSelectedIdxs(new Set());
    setActiveSegId(null);
  };

  if (segments.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 180, borderRadius: 16, textAlign: 'center', padding: 24,
        background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(52,183,136,0.3)',
      }}>
        <p style={{ color: '#52b788', fontSize: 14 }}>
          Generate captions first, then come back to emphasize words 🌱
        </p>
      </div>
    );
  }

  const totalStyled = segments.reduce(
    (acc, s) => acc + (s.words?.filter(w => hasWordStyle(w.style)).length ?? 0), 0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(52,183,136,0.08)',
        border: '1px solid rgba(52,183,136,0.3)',
        borderRadius: 12,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <div style={{ color: '#95d5b2', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>✦</span> Word Emphasis
          </div>
          <div style={{ color: '#74c69d', fontSize: 11, marginTop: 2, opacity: 0.85 }}>
            {totalStyled > 0
              ? `${totalStyled} word${totalStyled !== 1 ? 's' : ''} styled across your captions`
              : 'Click any word below to start styling it'}
          </div>
        </div>
        <Legend />
      </div>

      {/* ── Toolbar (sticky) ────────────────────────────────────────── */}
      {activeSeg && selectedIdxs.size > 0 && (
        <EmphasisToolbar
          count={selectedIdxs.size}
          aggStyle={aggStyle}
          onApply={applyStyle}
          onClearSelected={clearSelected}
          onDone={doneEditing}
        />
      )}

      {/* ── Segment list ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 480, paddingRight: 4 }}>
        {segments.map((seg, segIdx) => {
          const isActiveSeg = seg.id === activeSegId;
          const isPlaying   = currentTime >= seg.start && currentTime <= seg.end;
          const spans       = getSpans(seg);
          const styledCount = spans.filter(w => hasWordStyle(w.style)).length;

          return (
            <div
              key={seg.id}
              style={{
                borderRadius: 12,
                background: isActiveSeg
                  ? 'rgba(244,114,182,0.06)'
                  : isPlaying
                  ? 'rgba(52,183,136,0.05)'
                  : 'rgba(255,255,255,0.03)',
                border: isActiveSeg
                  ? '1.5px solid rgba(244,114,182,0.55)'
                  : isPlaying
                  ? '1.5px solid rgba(52,183,136,0.5)'
                  : '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.15s',
              }}
            >
              {/* Segment header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px 6px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 10, fontWeight: 600 }}>
                    #{segIdx + 1}
                  </span>
                  <span style={{ color: '#95d5b2', fontSize: 10, fontFamily: 'ui-monospace, monospace' }}>
                    {fmtTs(seg.start)} – {fmtTs(seg.end)}
                  </span>
                  {isPlaying && (
                    <span style={{
                      color: '#f472b6', fontSize: 9, fontWeight: 700,
                      background: 'rgba(244,114,182,0.15)',
                      border: '1px solid rgba(244,114,182,0.4)',
                      borderRadius: 4, padding: '1px 5px',
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f472b6' }} />
                      LIVE
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {styledCount > 0 && (
                    <span style={{
                      color: '#f9a8d4', fontSize: 10, fontWeight: 600,
                      background: 'rgba(244,114,182,0.12)',
                      border: '1px solid rgba(244,114,182,0.35)',
                      borderRadius: 5, padding: '2px 7px',
                    }}>
                      ✦ {styledCount}
                    </span>
                  )}
                  <button
                    onClick={() => selectAllInSegment(seg.id)}
                    style={{ background: 'none', border: 'none', color: '#74c69d', fontSize: 10, cursor: 'pointer', textDecoration: 'underline', padding: 0, opacity: 0.7 }}
                  >
                    select all
                  </button>
                  {styledCount > 0 && (
                    <button
                      onClick={() => clearSegStyles(seg.id)}
                      style={{ background: 'none', border: 'none', color: 'rgba(244,114,182,0.7)', fontSize: 10, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      title="Clear all styles in this segment"
                    >
                      clear all
                    </button>
                  )}
                </div>
              </div>

              {/* The text — words are inline, clickable, look like text */}
              <div style={{
                padding: '6px 14px 14px',
                lineHeight: 2.1,
                fontSize: 16,
                color: 'rgba(255,255,255,0.92)',
              }}>
                {spans.map((w, i) => {
                  const isSel    = isActiveSeg && selectedIdxs.has(i);
                  const isStyled = hasWordStyle(w.style);
                  const wColor   = w.style?.color;

                  return (
                    <span
                      key={i}
                      onClick={(e) => { e.stopPropagation(); toggleWord(seg.id, i); }}
                      style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        display: 'inline-block',
                        margin: '0 2px',
                        padding: '2px 5px',
                        borderRadius: 5,
                        transition: 'all 0.12s',
                        position: 'relative',

                        /* The word renders in its emphasis style — so users see exactly how it'll look */
                        color: isSel
                          ? '#fff'
                          : wColor ?? 'rgba(255,255,255,0.92)',
                        fontWeight: w.style?.bold   ? 700 : 400,
                        fontStyle:  w.style?.italic ? 'italic' : 'normal',
                        fontSize:   w.style?.scale  ? `${16 * w.style.scale}px` : 16,

                        /* Selection background */
                        background: isSel
                          ? 'rgba(244,114,182,0.35)'
                          : 'transparent',

                        /* Selection outline */
                        outline: isSel ? '2px solid #f472b6' : 'none',
                        outlineOffset: isSel ? 0 : undefined,
                        boxShadow: isSel ? '0 0 12px rgba(244,114,182,0.5)' : undefined,

                        /* Styled-but-not-selected indicator: subtle underline + dot */
                        textDecoration: isStyled && !isSel ? 'underline' : 'none',
                        textDecorationColor: isStyled ? hexToRgba(wColor ?? '#f472b6', 0.7) : undefined,
                        textDecorationThickness: '2px',
                        textUnderlineOffset: '4px',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSel) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {w.text}
                      {isStyled && !isSel && (
                        <span style={{
                          position: 'absolute',
                          top: -2, right: -2,
                          width: 6, height: 6, borderRadius: '50%',
                          background: wColor ?? '#f472b6',
                          boxShadow: `0 0 4px ${wColor ?? '#f472b6'}`,
                        }} />
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
      <LegendItem dot="rgba(255,255,255,0.4)" label="Normal" />
      <LegendItem dot="#f472b6" underline label="Styled" />
      <LegendItem dot="#f472b6" ring label="Selected" />
    </div>
  );
}

function LegendItem({ dot, label, ring, underline }: { dot: string; label: string; ring?: boolean; underline?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
        background: ring ? 'rgba(244,114,182,0.3)' : dot,
        border: ring ? '2px solid #f472b6' : `1.5px solid ${dot}`,
        boxShadow: underline ? `0 2px 0 -1px ${dot}` : 'none',
      }} />
      <span style={{ fontSize: 10, color: 'rgba(148,212,173,0.8)', whiteSpace: 'nowrap', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

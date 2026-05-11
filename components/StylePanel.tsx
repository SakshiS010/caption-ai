'use client';

import { useState, useMemo } from 'react';
import {
  type CaptionStyle,
  type Alignment,
  type LetterCase,
  type AnimationStyle,
  FONTS,
  COLOR_PRESETS,
  ANIMATIONS,
} from '@/lib/captionStyle';
import { STYLE_PRESETS } from '@/lib/captionPresets';
import type { CaptionSegment, WordSpan, WordStyle } from '@/lib/types';

interface Props {
  style: CaptionStyle;
  onChange: (style: CaptionStyle) => void;
  selectedSegment?: CaptionSegment;
  onSegmentChange?: (seg: CaptionSegment) => void;
}

const ANIM_ICON: Record<string, string> = {
  none: '—', fade: '✦', 'word-pop': '★', karaoke: '🎤', impact: '⚡',
};

/* ── Word emphasis helpers ─────────────────────────────────────── */
const WORD_COLORS = [
  '#FFFFFF', '#FFEB3B', '#f472b6', '#60a5fa',
  '#34d399', '#f97316', '#a78bfa', '#f87171',
];
const SCALES = [
  { label: '0.8×', v: 0.8 as number | undefined },
  { label: '1×',   v: undefined },
  { label: '1.2×', v: 1.2 as number | undefined },
  { label: '1.5×', v: 1.5 as number | undefined },
  { label: '2×',   v: 2.0 as number | undefined },
];

function hasWordStyle(ws?: WordStyle): boolean {
  return !!(ws && (ws.color || ws.bold !== undefined || ws.italic !== undefined || ws.scale !== undefined || ws.fontFamily));
}
function hexToRgba(hex: string, a: number) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
}
function getWordSpans(seg: CaptionSegment): WordSpan[] {
  const tokens = seg.text.split(/\s+/).filter(Boolean);
  if (seg.words && seg.words.length === tokens.length) return seg.words;
  return tokens.map((t, i) => ({ text: t, style: seg.words?.[i]?.text === t ? seg.words![i].style : undefined }));
}

export function StylePanel({ style, onChange, selectedSegment, onSegmentChange }: Props) {
  const [open, setOpen] = useState(true);
  const [presetsOpen, setPresetsOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [isEmphasizing, setIsEmphasizing] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<Set<number>>(new Set());
  const set = <K extends keyof CaptionStyle>(key: K, value: CaptionStyle[K]) =>
    onChange({ ...style, [key]: value });

  /* ── Emphasis actions ── */
  const enterEmphasis = () => {
    if (!selectedSegment || !onSegmentChange) return;
    const spans = getWordSpans(selectedSegment);
    onSegmentChange({ ...selectedSegment, words: spans });
    setIsEmphasizing(true);
    setSelectedIdxs(new Set());
  };
  const exitEmphasis = () => { setIsEmphasizing(false); setSelectedIdxs(new Set()); };
  const toggleWord = (i: number) =>
    setSelectedIdxs((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const applyWordStyle = (delta: Partial<WordStyle>) => {
    if (!selectedSegment?.words || !onSegmentChange) return;
    const newWords = selectedSegment.words.map((w, i) => {
      if (!selectedIdxs.has(i)) return w;
      const merged: WordStyle = { ...w.style, ...delta };
      if (delta.scale === undefined && 'scale' in delta) delete merged.scale;
      return { ...w, style: Object.keys(merged).length ? merged : undefined };
    });
    onSegmentChange({ ...selectedSegment, words: newWords });
  };
  const clearSelected = () => {
    if (!selectedSegment?.words || !onSegmentChange) return;
    onSegmentChange({
      ...selectedSegment,
      words: selectedSegment.words.map((w, i) => selectedIdxs.has(i) ? { text: w.text } : w),
    });
  };
  const clearAllWordStyles = () => {
    if (!selectedSegment?.words || !onSegmentChange) return;
    onSegmentChange({ ...selectedSegment, words: selectedSegment.words.map((w) => ({ text: w.text })) });
  };

  /* Aggregate current style of selected words for toolbar state */
  const aggWordStyle: WordStyle = {};
  if (isEmphasizing && selectedSegment?.words && selectedIdxs.size > 0) {
    const sel = selectedSegment.words.filter((_, i) => selectedIdxs.has(i)).map((w) => w.style ?? {});
    if (sel.every((s) => s.bold))   aggWordStyle.bold   = true;
    if (sel.every((s) => s.italic)) aggWordStyle.italic = true;
    const firstColor = sel[0]?.color;
    if (firstColor && sel.every((s) => s.color === firstColor)) aggWordStyle.color = firstColor;
    const firstScale = sel[0]?.scale;
    if (firstScale !== undefined && sel.every((s) => s.scale === firstScale)) aggWordStyle.scale = firstScale;
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q ? STYLE_PRESETS.filter((p) => p.name.toLowerCase().includes(q)) : STYLE_PRESETS;
  }, [search]);

  return (
    <div className="flex flex-col gap-3">

      {/* ── Preset Gallery ──────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <button
          onClick={() => setPresetsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-gray-800/50 transition-colors rounded-xl"
        >
          <span>✨ Style Presets <span className="text-gray-500 font-normal text-xs ml-1">({STYLE_PRESETS.length})</span></span>
          <span className="text-gray-500 text-xs">{presetsOpen ? '▾' : '▸'}</span>
        </button>

        {presetsOpen && (
          <div className="px-3 pb-3 border-t border-gray-800 pt-3 flex flex-col gap-2">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${STYLE_PRESETS.length} presets…`}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-gray-500"
            />

            {filtered.length === 0 ? (
              <p className="text-center text-xs text-gray-500 py-2">No matches</p>
            ) : (
              <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto pr-0.5 scrollbar-thin">
                {filtered.map((preset) => {
                  const bg = preset.style.hasBackground
                    ? preset.style.backgroundColor
                    : '#1f2937';
                  const textCol = preset.style.textColor;
                  const isActive =
                    style.fontFamily === preset.style.fontFamily &&
                    style.textColor === preset.style.textColor &&
                    style.animation === preset.style.animation &&
                    style.bold === preset.style.bold;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      title={`${preset.name} · ${preset.style.fontFamily} · ${preset.style.animation}`}
                      onClick={() => onChange(preset.style)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all border ${
                        isActive
                          ? 'border-green-500/60 bg-green-900/30'
                          : 'border-transparent hover:border-gray-600'
                      }`}
                      style={{ background: isActive ? undefined : bg + 'cc' }}
                    >
                      {/* "Aa" mini preview in the actual font + color */}
                      <span
                        className="text-xs font-bold flex-shrink-0 w-6 text-center leading-none"
                        style={{
                          fontFamily: `'${preset.style.fontFamily}', sans-serif`,
                          color: textCol,
                          fontStyle: preset.style.italic ? 'italic' : 'normal',
                          fontWeight: preset.style.bold ? 700 : 400,
                          textShadow: preset.style.outlineWidth > 0
                            ? `0 0 2px ${preset.style.outlineColor}, 0 0 2px ${preset.style.outlineColor}`
                            : 'none',
                        }}
                      >
                        Aa
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-200 truncate leading-tight">{preset.name}</p>
                        <p className="text-[9px] text-gray-500 truncate leading-tight">
                          {ANIM_ICON[preset.style.animation]} {preset.style.animation}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Fine-tune Controls ──────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-gray-800/50 transition-colors rounded-xl"
        >
          <span>🎨 Fine-tune</span>
          <span className="text-gray-500 text-xs">{open ? '▾' : '▸'}</span>
        </button>

        {open && (
          <div className="px-4 pb-4 flex flex-col gap-4 border-t border-gray-800 pt-4">
            {/* Font + size */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Font">
                <select
                  value={style.fontFamily}
                  onChange={(e) => set('fontFamily', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
                >
                  {FONTS.map((f) => (
                    <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={`Size: ${style.fontSize}`}>
                <input
                  type="range"
                  min={6}
                  max={32}
                  step={1}
                  value={style.fontSize}
                  onChange={(e) => set('fontSize', Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </Field>
            </div>

            {/* Bold / italic / underline / case */}
            <div className="flex items-center gap-2 flex-wrap">
              <ToggleBtn active={style.bold} onClick={() => set('bold', !style.bold)} title="Bold">
                <span className="font-bold">B</span>
              </ToggleBtn>
              <ToggleBtn active={style.italic} onClick={() => set('italic', !style.italic)} title="Italic">
                <span className="italic">I</span>
              </ToggleBtn>
              <ToggleBtn active={style.underline} onClick={() => set('underline', !style.underline)} title="Underline">
                <span className="underline">U</span>
              </ToggleBtn>
              <div className="w-px h-6 bg-gray-700 mx-1" />
              <select
                value={style.letterCase}
                onChange={(e) => set('letterCase', e.target.value as LetterCase)}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
              >
                <option value="normal">Aa Normal</option>
                <option value="uppercase">AA UPPER</option>
                <option value="lowercase">aa lower</option>
              </select>
            </div>

            {/* Text color */}
            <Field label="Text colour">
              <ColorRow value={style.textColor} onChange={(v) => set('textColor', v)} />
            </Field>

            {/* ── Word Emphasis ──────────────────────────────────── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
              {!selectedSegment || !onSegmentChange ? (
                /* No segment selected */
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    disabled
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#4b5563',
                      borderRadius: 7,
                      padding: '5px 12px',
                      fontSize: 12,
                      cursor: 'not-allowed',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    ✦ Emphasize words
                  </button>
                  <span style={{ fontSize: 10, color: '#4b5563' }}>Select a caption first</span>
                </div>
              ) : !isEmphasizing ? (
                /* Idle — show open button */
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={enterEmphasis}
                    style={{
                      background: selectedSegment.words?.some((w) => hasWordStyle(w.style))
                        ? 'rgba(244,114,182,0.18)' : 'rgba(255,255,255,0.06)',
                      border: selectedSegment.words?.some((w) => hasWordStyle(w.style))
                        ? '1px solid rgba(244,114,182,0.55)' : '1px solid rgba(255,255,255,0.14)',
                      color: selectedSegment.words?.some((w) => hasWordStyle(w.style))
                        ? '#f9a8d4' : '#95d5b2',
                      borderRadius: 7,
                      padding: '5px 12px',
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontWeight: 500,
                    }}
                  >
                    ✦ {selectedSegment.words?.some((w) => hasWordStyle(w.style)) ? 'Edit emphasis' : 'Emphasize words'}
                  </button>
                  {selectedSegment.words?.some((w) => hasWordStyle(w.style)) && (
                    <button
                      onClick={clearAllWordStyles}
                      style={{ background: 'none', border: 'none', color: '#52b788', fontSize: 10, cursor: 'pointer', opacity: 0.65 }}
                    >
                      clear all
                    </button>
                  )}
                </div>
              ) : (
                /* Active emphasis editor */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#f9a8d4', fontWeight: 600 }}>✦ Emphasize words</span>
                    <button
                      onClick={exitEmphasis}
                      style={{ background: 'rgba(52,183,136,0.15)', border: '1px solid rgba(52,183,136,0.4)', color: '#52b788', borderRadius: 5, padding: '2px 10px', fontSize: 10, cursor: 'pointer', fontWeight: 600 }}
                    >
                      ✓ Done
                    </button>
                  </div>
                  <p style={{ fontSize: 10, color: '#52b788', opacity: 0.6, margin: 0 }}>Click words to select, then apply styles below</p>

                  {/* Word chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {getWordSpans(selectedSegment).map((w, i) => {
                      const isSel  = selectedIdxs.has(i);
                      const styled = hasWordStyle(w.style);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleWord(i)}
                          style={{
                            background: isSel
                              ? 'rgba(244,114,182,0.22)'
                              : styled && w.style!.color
                              ? hexToRgba(w.style!.color, 0.13)
                              : 'rgba(255,255,255,0.05)',
                            border: isSel
                              ? '2px solid #f472b6'
                              : styled && w.style!.color
                              ? `1.5px solid ${w.style!.color}`
                              : '1px solid rgba(255,255,255,0.12)',
                            color: isSel ? '#fff' : (w.style?.color ?? '#95d5b2'),
                            fontWeight: w.style?.bold ? 700 : 400,
                            fontStyle: w.style?.italic ? 'italic' : 'normal',
                            fontSize: w.style?.scale ? Math.round(11 * w.style.scale) : 11,
                            borderRadius: 5,
                            padding: '3px 8px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            lineHeight: 1.3,
                            transition: 'all 0.1s',
                          }}
                        >
                          {w.text}
                        </button>
                      );
                    })}
                  </div>

                  {/* Toolbar (visible when words selected) */}
                  {selectedIdxs.size > 0 && (
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(244,114,182,0.3)', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#f9a8d4', fontSize: 10 }}>{selectedIdxs.size} word{selectedIdxs.size > 1 ? 's' : ''} selected</span>
                        <button onClick={clearSelected} style={{ background: 'none', border: 'none', color: '#52b788', fontSize: 10, cursor: 'pointer', opacity: 0.7 }}>✕ Clear style</button>
                      </div>
                      {/* Colors */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <span style={{ color: '#74c69d', fontSize: 10, opacity: 0.7, minWidth: 32 }}>Color</span>
                        {WORD_COLORS.map((c) => (
                          <button key={c} onClick={() => applyWordStyle({ color: c })} title={c} style={{ width: 17, height: 17, borderRadius: '50%', background: c, border: aggWordStyle.color === c ? '2px solid #f472b6' : '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', flexShrink: 0 }} />
                        ))}
                        <input type="color" value={aggWordStyle.color ?? '#FFFFFF'} onChange={(e) => applyWordStyle({ color: e.target.value.toUpperCase() })} style={{ width: 20, height: 20, borderRadius: 3, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} title="Custom colour" />
                      </div>
                      {/* B / I / Scale */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <span style={{ color: '#74c69d', fontSize: 10, opacity: 0.7, minWidth: 32 }}>Style</span>
                        <EmphBtn active={!!aggWordStyle.bold}   onClick={() => applyWordStyle({ bold:   !aggWordStyle.bold })}><b>B</b></EmphBtn>
                        <EmphBtn active={!!aggWordStyle.italic} onClick={() => applyWordStyle({ italic: !aggWordStyle.italic })}><i>I</i></EmphBtn>
                        <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />
                        <span style={{ color: '#74c69d', fontSize: 10, opacity: 0.7 }}>Size</span>
                        {SCALES.map(({ label, v }) => (
                          <EmphBtn key={label} active={aggWordStyle.scale === v} small onClick={() => applyWordStyle({ scale: v })}>{label}</EmphBtn>
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={clearAllWordStyles} style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280', borderRadius: 5, padding: '2px 9px', fontSize: 10, cursor: 'pointer' }}>
                    Clear all styles
                  </button>
                </div>
              )}
            </div>

            {/* Outline */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Outline colour">
                <ColorRow value={style.outlineColor} onChange={(v) => set('outlineColor', v)} />
              </Field>
              <Field label={`Outline width: ${style.outlineWidth}`}>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={style.outlineWidth}
                  onChange={(e) => set('outlineWidth', Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </Field>
            </div>

            {/* Background */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={style.hasBackground}
                  onChange={(e) => set('hasBackground', e.target.checked)}
                  className="accent-blue-500"
                />
                Box background behind text
              </label>
              {style.hasBackground && (
                <div className="grid grid-cols-2 gap-3">
                  <ColorRow value={style.backgroundColor} onChange={(v) => set('backgroundColor', v)} />
                  <Field label={`Opacity: ${Math.round(style.backgroundOpacity * 100)}%`}>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={style.backgroundOpacity}
                      onChange={(e) => set('backgroundOpacity', Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </Field>
                </div>
              )}
            </div>

            {/* Position grid + alignment */}
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                {/* 3×3 preset position grid */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 mb-0.5">Position</span>
                  <PositionGrid
                    positionX={style.positionX}
                    positionY={style.positionY}
                    onChange={(x, y) => onChange({ ...style, positionX: x, positionY: y })}
                  />
                </div>
                {/* Alignment */}
                <Field label="Alignment">
                  <ButtonGroup
                    value={style.alignment}
                    onChange={(v) => set('alignment', v as Alignment)}
                    options={[
                      { value: 'left', label: '⟸' },
                      { value: 'center', label: '⇔' },
                      { value: 'right', label: '⟹' },
                    ]}
                  />
                </Field>
              </div>
              <p className="text-[10px] text-gray-500 leading-tight">
                ⤢ Drag caption in the video preview to place it anywhere
              </p>
            </div>

            {/* Spacing */}
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Spacing: ${style.letterSpacing}`}>
                <input
                  type="range"
                  min={-2}
                  max={10}
                  step={0.5}
                  value={style.letterSpacing}
                  onChange={(e) => set('letterSpacing', Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </Field>
            </div>

            {/* Animation */}
            <div className="flex flex-col gap-2 pt-1 border-t border-gray-800">
              <span className="text-xs text-gray-400">Animation</span>
              <div className="grid grid-cols-5 gap-1.5">
                {ANIMATIONS.map((anim) => (
                  <button
                    key={anim.value}
                    type="button"
                    onClick={() => set('animation', anim.value as AnimationStyle)}
                    className={`px-1 py-2 rounded text-center flex flex-col gap-0.5 transition-colors ${
                      style.animation === anim.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xs font-medium">{anim.label}</span>
                    <span className="text-[9px] opacity-70 leading-tight">{anim.description}</span>
                  </button>
                ))}
              </div>

              {(style.animation === 'karaoke' || style.animation === 'word-pop') && (
                <Field label="Highlight colour">
                  <ColorRow value={style.highlightColor} onChange={(v) => set('highlightColor', v)} />
                </Field>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-gray-400">{label}</span>
      {children}
    </label>
  );
}

function ToggleBtn({
  active, onClick, title, children,
}: {
  active: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-9 h-9 rounded text-sm transition-colors ${
        active ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function ColorRow({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {COLOR_PRESETS.map((c) => (
        <button
          key={c.hex}
          type="button"
          onClick={() => onChange(c.hex)}
          title={c.label}
          aria-label={c.label}
          className={`w-6 h-6 rounded-full border-2 transition-transform ${
            value.toLowerCase() === c.hex.toLowerCase()
              ? 'border-blue-400 scale-110'
              : 'border-gray-700'
          }`}
          style={{ backgroundColor: c.hex }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="w-7 h-7 rounded cursor-pointer bg-transparent border border-gray-700"
        title="Custom colour"
      />
    </div>
  );
}

function ButtonGroup<T extends string>({
  value, onChange, options,
}: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  return (
    <div className="flex bg-gray-800 rounded overflow-hidden border border-gray-700">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 py-1.5 text-xs transition-colors ${
            value === o.value ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function EmphBtn({ active, onClick, children, small }: { active: boolean; onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(244,114,182,0.28)' : 'rgba(255,255,255,0.06)',
        border: active ? '1px solid rgba(244,114,182,0.65)' : '1px solid rgba(255,255,255,0.12)',
        color: active ? '#f9a8d4' : '#95d5b2',
        borderRadius: 5,
        padding: small ? '1px 6px' : '2px 7px',
        fontSize: small ? 10 : 12,
        cursor: 'pointer',
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

// 9-cell position grid — rows: top/middle/bottom, cols: left/center/right
const POSITION_PRESETS = [
  { x: 10, y: 10 }, { x: 50, y: 10 }, { x: 90, y: 10 },
  { x: 10, y: 50 }, { x: 50, y: 50 }, { x: 90, y: 50 },
  { x: 10, y: 85 }, { x: 50, y: 85 }, { x: 90, y: 85 },
];

function PositionGrid({
  positionX, positionY, onChange,
}: {
  positionX: number; positionY: number;
  onChange: (x: number, y: number) => void;
}) {
  const isActive = (px: number, py: number) =>
    Math.abs(positionX - px) < 8 && Math.abs(positionY - py) < 8;

  return (
    <div
      className="grid gap-1 p-1.5 rounded-lg border border-gray-700"
      style={{ gridTemplateColumns: 'repeat(3, 1fr)', background: '#111827', width: 88 }}
    >
      {POSITION_PRESETS.map(({ x, y }) => (
        <button
          key={`${x}-${y}`}
          type="button"
          onClick={() => onChange(x, y)}
          className="rounded transition-colors"
          style={{
            width: 22, height: 22,
            background: isActive(x, y) ? '#2563eb' : 'rgba(255,255,255,0.07)',
            border: isActive(x, y) ? '1.5px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
          }}
          title={`${y < 30 ? 'Top' : y < 65 ? 'Middle' : 'Bottom'} ${x < 30 ? 'left' : x < 65 ? 'center' : 'right'}`}
        >
          <span
            className="block w-full h-full rounded"
            style={{
              background: isActive(x, y) ? '#93c5fd' : 'rgba(255,255,255,0.4)',
              transform: 'scale(0.45)',
              borderRadius: 2,
            }}
          />
        </button>
      ))}
    </div>
  );
}

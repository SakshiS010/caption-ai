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

interface Props {
  style: CaptionStyle;
  onChange: (style: CaptionStyle) => void;
}

const ANIM_ICON: Record<string, string> = {
  none: '—', fade: '✦', 'word-pop': '★', karaoke: '🎤', impact: '⚡',
};

export function StylePanel({ style, onChange }: Props) {
  const [open, setOpen] = useState(true);
  const [presetsOpen, setPresetsOpen] = useState(true);
  const [search, setSearch] = useState('');
  const set = <K extends keyof CaptionStyle>(key: K, value: CaptionStyle[K]) =>
    onChange({ ...style, [key]: value });

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

'use client';

import { useState } from 'react';
import {
  type CaptionStyle,
  type Alignment,
  type Position,
  type LetterCase,
  type AnimationStyle,
  FONTS,
  COLOR_PRESETS,
  ANIMATIONS,
} from '@/lib/captionStyle';

interface Props {
  style: CaptionStyle;
  onChange: (style: CaptionStyle) => void;
}

export function StylePanel({ style, onChange }: Props) {
  const [open, setOpen] = useState(true);
  const set = <K extends keyof CaptionStyle>(key: K, value: CaptionStyle[K]) =>
    onChange({ ...style, [key]: value });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-gray-800/50 transition-colors rounded-xl"
      >
        <span>🎨 Caption Style</span>
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
            <ColorRow
              value={style.textColor}
              onChange={(v) => set('textColor', v)}
            />
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

          {/* Position + alignment */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Position">
              <ButtonGroup
                value={style.position}
                onChange={(v) => set('position', v as Position)}
                options={[
                  { value: 'top', label: 'Top' },
                  { value: 'middle', label: 'Middle' },
                  { value: 'bottom', label: 'Bottom' },
                ]}
              />
            </Field>
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

          {/* Margin + spacing */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Edge margin: ${style.marginV}`}>
              <input
                type="range"
                min={0}
                max={120}
                step={2}
                value={style.marginV}
                onChange={(e) => set('marginV', Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </Field>
            <Field label={`Letter spacing: ${style.letterSpacing}`}>
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

            {/* Highlight colour — shown for word-pop and karaoke */}
            {(style.animation === 'karaoke' || style.animation === 'word-pop') && (
              <Field label="Highlight colour">
                <ColorRow
                  value={style.highlightColor}
                  onChange={(v) => set('highlightColor', v)}
                />
              </Field>
            )}
          </div>

          {/* Quick presets */}
          <div className="flex flex-col gap-2 pt-1 border-t border-gray-800">
            <span className="text-xs text-gray-400">Quick presets</span>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...style,
                    animation: 'impact',
                    bold: true,
                    letterCase: 'uppercase',
                    fontSize: 18,
                    textColor: '#FFFFFF',
                    outlineColor: '#000000',
                    outlineWidth: 2.5,
                    hasBackground: false,
                    alignment: 'center',
                    position: 'middle',
                    fontFamily: 'Montserrat',
                  })
                }
                className="px-3 py-1.5 bg-orange-700 hover:bg-orange-600 rounded text-xs font-semibold transition-colors"
              >
                ⚡ Impact (robthebank)
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...style,
                    animation: 'karaoke',
                    bold: false,
                    letterCase: 'normal',
                    fontSize: 12,
                    textColor: '#FFFFFF',
                    highlightColor: '#FFEB3B',
                    outlineColor: '#000000',
                    outlineWidth: 1.5,
                    hasBackground: false,
                    alignment: 'center',
                    position: 'bottom',
                    fontFamily: 'Roboto',
                  })
                }
                className="px-3 py-1.5 bg-yellow-700 hover:bg-yellow-600 rounded text-xs font-semibold transition-colors"
              >
                🎤 Karaoke
              </button>
            </div>
          </div>
        </div>
      )}
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
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
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
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
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

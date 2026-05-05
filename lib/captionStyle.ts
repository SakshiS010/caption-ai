import type { CSSProperties } from 'react';
import type { CaptionSegment } from './types';

// Curated font set. `family` MUST match the TTF's internal family name —
// libass uses that, not the filename, to resolve FontName= in force_style.
export interface FontOption {
  label: string;
  family: string;
  file: string;
}

// All free-licensed (Apache / OFL) Google Fonts. `family` matches each TTF's
// internal family name — libass uses that to resolve FontName= in force_style.
export const FONTS: FontOption[] = [
  // Sans-serif
  { label: 'Roboto',           family: 'Roboto',           file: 'Roboto-Regular.ttf' },
  { label: 'Open Sans',        family: 'Open Sans',        file: 'OpenSans-Regular.ttf' },
  { label: 'Lato',             family: 'Lato',             file: 'Lato-Regular.ttf' },
  { label: 'Poppins',          family: 'Poppins',          file: 'Poppins-Regular.ttf' },
  { label: 'Montserrat',       family: 'Montserrat',       file: 'Montserrat-Regular.ttf' },
  { label: 'Inter',            family: 'Inter',            file: 'Inter-Regular.ttf' },
  { label: 'Nunito',           family: 'Nunito',           file: 'Nunito-Regular.ttf' },
  { label: 'Raleway',          family: 'Raleway',          file: 'Raleway-Regular.ttf' },
  { label: 'Archivo',          family: 'Archivo',          file: 'Archivo-Regular.ttf' },
  { label: 'Source Sans 3',    family: 'Source Sans 3',    file: 'SourceSans3-Regular.ttf' },
  // Condensed / Display
  { label: 'Oswald',           family: 'Oswald',           file: 'Oswald-Regular.ttf' },
  { label: 'Bebas Neue',       family: 'Bebas Neue',       file: 'BebasNeue-Regular.ttf' },
  { label: 'Barlow Condensed', family: 'Barlow Condensed', file: 'BarlowCondensed-Regular.ttf' },
  // Serif
  { label: 'Playfair Display', family: 'Playfair Display', file: 'PlayfairDisplay-Regular.ttf' },
  { label: 'Merriweather',     family: 'Merriweather',     file: 'Merriweather-Regular.ttf' },
  // Handwriting
  { label: 'Dancing Script',   family: 'Dancing Script',   file: 'DancingScript-Regular.ttf' },
  { label: 'Pacifico',         family: 'Pacifico',         file: 'Pacifico-Regular.ttf' },
  { label: 'Caveat',           family: 'Caveat',           file: 'Caveat-Regular.ttf' },
];

export const COLOR_PRESETS: { label: string; hex: string }[] = [
  { label: 'White',  hex: '#FFFFFF' },
  { label: 'Yellow', hex: '#FFEB3B' },
  { label: 'Black',  hex: '#000000' },
  { label: 'Red',    hex: '#F44336' },
  { label: 'Blue',   hex: '#2196F3' },
  { label: 'Green',  hex: '#4CAF50' },
  { label: 'Orange', hex: '#FF9800' },
  { label: 'Purple', hex: '#9C27B0' },
];

export type Alignment = 'left' | 'center' | 'right';
export type Position = 'top' | 'middle' | 'bottom';
export type LetterCase = 'normal' | 'uppercase' | 'lowercase';
export type AnimationStyle = 'none' | 'fade' | 'word-pop' | 'karaoke' | 'impact';

export interface AnimationOption {
  value: AnimationStyle;
  label: string;
  description: string;
}

export const ANIMATIONS: AnimationOption[] = [
  { value: 'none',     label: 'None',      description: 'Static' },
  { value: 'fade',     label: 'Fade',      description: 'Fade in/out' },
  { value: 'word-pop', label: 'Word Pop',  description: 'Words pop in one by one' },
  { value: 'karaoke',  label: 'Karaoke',   description: 'Highlight each word' },
  { value: 'impact',   label: 'Impact',    description: 'Words slam in' },
];

export interface CaptionStyle {
  fontFamily: string;          // FontOption.family
  fontSize: number;            // ASS units (relative to PlayResY=288)
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textColor: string;           // CSS hex #RRGGBB
  outlineColor: string;
  outlineWidth: number;        // 0..5
  hasBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number;   // 0..1
  alignment: Alignment;
  position: Position;
  marginV: number;             // ASS units
  letterCase: LetterCase;
  letterSpacing: number;       // pixels (libass Spacing)
  animation: AnimationStyle;
  highlightColor: string;      // active-word colour for karaoke/word-pop
}

export const DEFAULT_STYLE: CaptionStyle = {
  fontFamily: 'Roboto',
  fontSize: 12,
  bold: false,
  italic: false,
  underline: false,
  textColor: '#FFFFFF',
  outlineColor: '#000000',
  outlineWidth: 1.5,
  hasBackground: false,
  backgroundColor: '#000000',
  backgroundOpacity: 0.6,
  alignment: 'center',
  position: 'bottom',
  marginV: 30,
  letterCase: 'normal',
  letterSpacing: 0,
  animation: 'none',
  highlightColor: '#FFEB3B',
};

// CSS hex (#RRGGBB) → libass ASS color literal (&HAABBGGRR). ASS reverses
// RGB and treats alpha as inverted (0 = opaque, 255 = transparent).
export function hexToASS(hex: string, alpha = 0): string {
  const h = hex.replace('#', '');
  const r = h.slice(0, 2).toUpperCase();
  const g = h.slice(2, 4).toUpperCase();
  const b = h.slice(4, 6).toUpperCase();
  const a = Math.max(0, Math.min(255, Math.round(alpha))).toString(16).padStart(2, '0').toUpperCase();
  return `&H${a}${b}${g}${r}`;
}

// ASS Alignment uses numpad layout: 1-3 bottom, 4-6 middle, 7-9 top.
function alignmentToASS(align: Alignment, pos: Position): number {
  const row = pos === 'bottom' ? 0 : pos === 'middle' ? 3 : 6;
  const col = align === 'left' ? 1 : align === 'center' ? 2 : 3;
  return row + col;
}

export function applyLetterCase(text: string, c: LetterCase): string {
  if (c === 'uppercase') return text.toUpperCase();
  if (c === 'lowercase') return text.toLowerCase();
  return text;
}

export function buildForceStyle(style: CaptionStyle): string {
  const bgAlpha = Math.round((1 - style.backgroundOpacity) * 255);
  return [
    `FontName=${style.fontFamily}`,
    `FontSize=${style.fontSize}`,
    `Bold=${style.bold ? -1 : 0}`,
    `Italic=${style.italic ? -1 : 0}`,
    `Underline=${style.underline ? -1 : 0}`,
    `PrimaryColour=${hexToASS(style.textColor)}`,
    `OutlineColour=${hexToASS(style.outlineColor)}`,
    `BackColour=${hexToASS(style.backgroundColor, bgAlpha)}`,
    `BorderStyle=${style.hasBackground ? 3 : 1}`,
    `Outline=${style.outlineWidth}`,
    `Shadow=0`,
    `Spacing=${style.letterSpacing}`,
    `Alignment=${alignmentToASS(style.alignment, style.position)}`,
    `MarginV=${style.marginV}`,
    `MarginL=20`,
    `MarginR=20`,
  ].join(',');
}

// Translate the same style to CSS for live preview. videoHeight is the
// rendered pixel height of the <video> — used to convert ASS units (which
// are relative to PlayResY=288) into matching CSS pixels.
export function buildPreviewCSS(style: CaptionStyle, videoHeight: number): CSSProperties {
  const scale = videoHeight / 288;
  const fontPx = style.fontSize * scale;
  const outlinePx = style.outlineWidth * scale;

  const css: CSSProperties = {
    fontFamily: `"${style.fontFamily}", sans-serif`,
    fontSize: `${fontPx}px`,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    textDecoration: style.underline ? 'underline' : 'none',
    color: style.textColor,
    letterSpacing: `${style.letterSpacing}px`,
    textTransform:
      style.letterCase === 'uppercase' ? 'uppercase' :
      style.letterCase === 'lowercase' ? 'lowercase' : 'none',
    textAlign: style.alignment,
    lineHeight: 1.2,
    display: 'inline-block',
    maxWidth: '90%',
  };

  if (style.outlineWidth > 0) {
    const o = outlinePx;
    css.textShadow = [
      `-${o}px -${o}px 0 ${style.outlineColor}`,
      `${o}px -${o}px 0 ${style.outlineColor}`,
      `-${o}px ${o}px 0 ${style.outlineColor}`,
      `${o}px ${o}px 0 ${style.outlineColor}`,
    ].join(', ');
  }

  if (style.hasBackground) {
    const r = parseInt(style.backgroundColor.slice(1, 3), 16);
    const g = parseInt(style.backgroundColor.slice(3, 5), 16);
    const b = parseInt(style.backgroundColor.slice(5, 7), 16);
    css.backgroundColor = `rgba(${r}, ${g}, ${b}, ${style.backgroundOpacity})`;
    css.padding = `${0.2 * fontPx}px ${0.5 * fontPx}px`;
    css.borderRadius = `${0.2 * fontPx}px`;
  }

  return css;
}

// Outer wrapper positioning for the preview overlay. Position values are in
// pixels relative to the rendered video.
export function buildOverlayCSS(style: CaptionStyle, videoHeight: number): CSSProperties {
  const scale = videoHeight / 288;
  const marginPx = style.marginV * scale;
  const css: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingLeft: `${20 * scale}px`,
    paddingRight: `${20 * scale}px`,
    pointerEvents: 'none',
    display: 'flex',
    justifyContent:
      style.alignment === 'left' ? 'flex-start' :
      style.alignment === 'right' ? 'flex-end' : 'center',
  };
  if (style.position === 'top') css.top = `${marginPx}px`;
  else if (style.position === 'middle') {
    css.top = '50%';
    css.transform = 'translateY(-50%)';
  } else css.bottom = `${marginPx}px`;
  return css;
}

// ─── ASS file generation for animated burn modes ──────────────────────────────

function secondsToASS(t: number): string {
  const totalCs = Math.round(t * 100);
  const cs = totalCs % 100;
  const totalS = Math.floor(totalCs / 100);
  const s = totalS % 60;
  const totalM = Math.floor(totalS / 60);
  const m = totalM % 60;
  const h = Math.floor(totalM / 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function escapeASS(text: string): string {
  return text.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
}

// Generates a self-contained .ass file with per-segment (or per-word) animation tags.
// Used by burnCaptions when style.animation !== 'none'.
export function buildASSFile(segments: CaptionSegment[], style: CaptionStyle): string {
  const bgAlpha = Math.round((1 - style.backgroundOpacity) * 255);
  const styleRow = [
    'Default',
    style.fontFamily,
    style.fontSize,
    hexToASS(style.textColor),
    hexToASS(style.highlightColor),
    hexToASS(style.outlineColor),
    hexToASS(style.backgroundColor, bgAlpha),
    style.bold ? -1 : 0,
    style.italic ? -1 : 0,
    style.underline ? -1 : 0,
    0,           // StrikeOut
    100, 100,    // ScaleX, ScaleY
    style.letterSpacing,
    0,           // Angle
    style.hasBackground ? 3 : 1,  // BorderStyle
    style.outlineWidth,
    0,           // Shadow
    alignmentToASS(style.alignment, style.position),
    20, 20,      // MarginL, MarginR
    style.marginV,
    1,           // Encoding
  ].join(',');

  const header = `[Script Info]
ScriptType: v4.00+
Collisions: Normal
PlayResX: 384
PlayResY: 288
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: ${styleRow}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const dialogue = (t0: number, t1: number, text: string) =>
    `Dialogue: 0,${secondsToASS(t0)},${secondsToASS(t1)},Default,,0,0,0,,${text}`;

  const lines: string[] = [header];

  for (const seg of segments) {
    const rawText = escapeASS(seg.text); // text is pre-cased by the caller
    const words = rawText.split(/\s+/).filter(Boolean);
    const dur = Math.max(0.1, seg.end - seg.start);
    const wordDur = dur / Math.max(1, words.length);

    switch (style.animation) {
      case 'fade':
        lines.push(dialogue(seg.start, seg.end, `{\\fad(200,200)}${rawText}`));
        break;

      case 'word-pop':
        words.forEach((w, i) => {
          const t0 = seg.start + i * wordDur;
          const t1 = i < words.length - 1 ? t0 + wordDur : seg.end;
          lines.push(dialogue(t0, t1, `{\\fscx130\\fscy130\\t(0,150,\\fscx100\\fscy100)}${w}`));
        });
        break;

      case 'karaoke': {
        const hlColor = hexToASS(style.highlightColor);
        words.forEach((w, i) => {
          const t0 = seg.start + i * wordDur;
          const t1 = i < words.length - 1 ? t0 + wordDur : seg.end;
          const parts = words.map((word, j) =>
            j === i ? `{\\1c${hlColor}}${word}{\\r}` : word
          );
          lines.push(dialogue(t0, t1, parts.join(' ')));
        });
        break;
      }

      case 'impact':
        // Slam: 200% → 95% overshoot → 100% (robthebank style)
        words.forEach((w, i) => {
          const t0 = seg.start + i * wordDur;
          const t1 = i < words.length - 1 ? t0 + wordDur : seg.end;
          lines.push(dialogue(t0, t1, `{\\fscx200\\fscy200\\t(0,120,\\fscx95\\fscy95)\\t(120,200,\\fscx100\\fscy100)}${w}`));
        });
        break;

      default:
        lines.push(dialogue(seg.start, seg.end, rawText));
    }
  }

  return lines.join('\n') + '\n';
}

import type { CSSProperties } from 'react';

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
  { label: 'Roboto',           family: 'Roboto',           file: 'Roboto-Regular.ttf' },
  { label: 'Open Sans',        family: 'Open Sans',        file: 'OpenSans-Regular.ttf' },
  { label: 'Lato',             family: 'Lato',             file: 'Lato-Regular.ttf' },
  { label: 'Poppins',          family: 'Poppins',          file: 'Poppins-Regular.ttf' },
  { label: 'Montserrat',       family: 'Montserrat',       file: 'Montserrat-Regular.ttf' },
  { label: 'Playfair Display', family: 'Playfair Display', file: 'PlayfairDisplay-Regular.ttf' },
  { label: 'Bebas Neue',       family: 'Bebas Neue',       file: 'BebasNeue-Regular.ttf' },
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

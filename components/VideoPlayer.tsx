'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { CaptionSegment, WordSpan, WordStyle } from '@/lib/types';
import {
  type CaptionStyle,
  applyLetterCase,
  buildPreviewCSS,
  buildOverlayCSS,
} from '@/lib/captionStyle';

interface Props {
  videoUrl: string;
  segments: CaptionSegment[];
  style: CaptionStyle;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  /** Pass a new object each seek: { value: seconds, id: Date.now() } */
  seekTime?: { value: number; id: number };
  onEditCaption?: (id: string, text: string) => void;
  /** Called while dragging the caption overlay to a new position (0–100 %). */
  onPositionChange?: (x: number, y: number) => void;
}

interface PlayState {
  segId: string | null;
  t: number;
}

export function VideoPlayer({
  videoUrl, segments, style,
  onTimeUpdate, onDurationChange, seekTime, onEditCaption, onPositionChange,
}: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playState, setPlayState] = useState<PlayState>({ segId: null, t: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [videoH,    setVideoH]    = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  /* ── Caption position drag ────────────────────────────────────────── */
  const posDrag = useRef<{ clientX: number; clientY: number; posX: number; posY: number } | null>(null);
  const didDrag = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!posDrag.current || !containerRef.current || !onPositionChange) return;
      const dx = e.clientX - posDrag.current.clientX;
      const dy = e.clientY - posDrag.current.clientY;
      if (!didDrag.current && Math.hypot(dx, dy) < 4) return;
      didDrag.current = true;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = Math.max(3, Math.min(97, posDrag.current.posX + (dx / rect.width)  * 100));
      const ny = Math.max(3, Math.min(97, posDrag.current.posY + (dy / rect.height) * 100));
      onPositionChange(nx, ny);
    };
    const onUp = () => { posDrag.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [onPositionChange]);

  /* ── Time / segment tracking ─────────────────────────────────────── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTime  = () => {
      const t = video.currentTime;
      onTimeUpdate?.(t);
      const found = segments.find((s) => t >= s.start && t <= s.end);
      setPlayState({ segId: found?.id ?? null, t });
    };
    const handlePlay  = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    video.addEventListener('timeupdate', handleTime);
    video.addEventListener('play',       handlePlay);
    video.addEventListener('pause',      handlePause);
    return () => {
      video.removeEventListener('timeupdate', handleTime);
      video.removeEventListener('play',       handlePlay);
      video.removeEventListener('pause',      handlePause);
    };
  }, [segments, onTimeUpdate]);

  /* ── Duration ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const report = () => onDurationChange?.(video.duration);
    video.addEventListener('loadedmetadata', report);
    if (video.readyState >= 1) report();
    return () => video.removeEventListener('loadedmetadata', report);
  }, [videoUrl, onDurationChange]);

  /* ── External seek (from Timeline) ────────────────────────────────── */
  useEffect(() => {
    if (seekTime && videoRef.current) {
      videoRef.current.currentTime = seekTime.value;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekTime]);

  /* ── Video resize observer ─────────────────────────────────────────── */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const update = () => setVideoH(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Close edit when segment changes */
  useEffect(() => { setEditingId(null); }, [playState.segId]);

  const seg = playState.segId
    ? segments.find((s) => s.id === playState.segId) ?? null
    : null;
  const { t } = playState;

  /* Word position by linear interpolation within the segment */
  let words: string[] = [];
  let wordIdx = 0;
  if (seg) {
    const text = applyLetterCase(seg.text, style.letterCase);
    words   = text.split(/\s+/).filter(Boolean);
    const posInSeg = Math.max(0, t - seg.start);
    const dur      = Math.max(0.01, seg.end - seg.start);
    wordIdx = Math.min(Math.floor((posInSeg / dur) * words.length), words.length - 1);
  }

  const openEdit = useCallback(() => {
    if (didDrag.current || !seg || !onEditCaption) return;
    videoRef.current?.pause();
    setEditingId(seg.id);
  }, [seg, onEditCaption]);

  const onCaptionMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onPositionChange || editingId) return;
    e.preventDefault();
    e.stopPropagation();
    didDrag.current = false;
    posDrag.current = { clientX: e.clientX, clientY: e.clientY, posX: style.positionX, posY: style.positionY };
  }, [onPositionChange, editingId, style.positionX, style.positionY]);

  const canDrag = !!onPositionChange && !editingId;

  return (
    <div ref={containerRef} className="relative bg-black rounded-xl overflow-hidden aspect-video w-full group">
      <video ref={videoRef} src={videoUrl} controls className="w-full h-full" />

      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] font-semibold text-white/70 select-none pointer-events-none">
        LIVE PREVIEW
      </div>

      {seg && !isPlaying && !editingId && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white/60 select-none pointer-events-none">
          {canDrag ? '⤢ Drag caption to move' : onEditCaption ? '✏️ Click caption to edit' : ''}
        </div>
      )}

      {seg && videoH > 0 && (
        <div style={{ ...buildOverlayCSS(style, videoH), pointerEvents: 'none' }}>
          {editingId === seg.id && onEditCaption ? (
            <div style={{ pointerEvents: 'auto', width: '100%', textAlign: style.alignment }}>
              <textarea
                value={seg.text}
                autoFocus
                rows={2}
                spellCheck={false}
                onChange={(e) => onEditCaption(seg.id, e.target.value)}
                onBlur={() => setEditingId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { e.preventDefault(); setEditingId(null); }
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingId(null); }
                }}
                style={{
                  ...buildPreviewCSS(style, videoH),
                  display: 'inline-block',
                  width: 'auto',
                  minWidth: '120px',
                  maxWidth: '100%',
                  background: 'rgba(0,0,0,0.8)',
                  border: '2px solid rgba(255,255,255,0.7)',
                  borderRadius: 6,
                  padding: '6px 12px',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  textAlign: style.alignment,
                  boxShadow: '0 0 0 4px rgba(59,130,246,0.4)',
                }}
              />
              <div
                className="text-center text-white/50 text-xs mt-1 select-none"
                style={{ pointerEvents: 'none', fontSize: Math.max(10, videoH * 0.016) }}
              >
                Enter to confirm · Esc to cancel
              </div>
            </div>
          ) : (
            <div
              style={{
                pointerEvents: (canDrag || onEditCaption) ? 'auto' : 'none',
                cursor: canDrag ? 'move' : (onEditCaption && !isPlaying ? 'text' : 'default'),
                outline: canDrag ? '1.5px dashed rgba(255,255,255,0.35)' : 'none',
                outlineOffset: 6,
                borderRadius: 3,
              }}
              onMouseDown={onCaptionMouseDown}
              onClick={openEdit}
              title={canDrag ? 'Drag to reposition' : onEditCaption ? 'Click to edit' : undefined}
            >
              {renderCaption(seg, words, wordIdx, style, videoH, !!onEditCaption && !isPlaying && !canDrag)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Build CSS overrides for a single word's WordStyle (only the fields that differ from base). */
function wordOverrideCSS(ws: WordStyle | undefined, captionStyle: CaptionStyle, videoH: number): React.CSSProperties {
  if (!ws) return {};
  const sc = videoH / 288;
  const out: React.CSSProperties = {};
  if (ws.color)                  out.color      = ws.color;
  if (ws.bold     !== undefined) out.fontWeight  = ws.bold ? 700 : 400;
  if (ws.italic   !== undefined) out.fontStyle   = ws.italic ? 'italic' : 'normal';
  if (ws.scale    !== undefined) out.fontSize    = `${captionStyle.fontSize * sc * ws.scale}px`;
  if (ws.fontFamily)             out.fontFamily  = `"${ws.fontFamily}", sans-serif`;
  return out;
}

/* Render a row of word <span>s, each with its own per-word style override. */
function renderWordRow(
  spans: WordSpan[],
  captionStyle: CaptionStyle,
  videoH: number,
  getSpanStyle?: (i: number, ws: WordStyle | undefined) => React.CSSProperties,
  getClassName?: (i: number) => string,
): React.ReactNode {
  return spans.map((w, i) => {
    const override  = wordOverrideCSS(w.style, captionStyle, videoH);
    const extra     = getSpanStyle?.(i, w.style) ?? {};
    const className = getClassName?.(i);
    return (
      <span key={i} className={className} style={{ display: 'inline-block', ...override, ...extra }}>
        {i > 0 ? <span style={{ fontWeight: 400, fontStyle: 'normal', color: 'inherit', fontSize: 'inherit' }}> </span> : null}
        {w.text}
      </span>
    );
  });
}

function renderCaption(
  seg: CaptionSegment,
  words: string[],
  wordIdx: number,
  style: CaptionStyle,
  videoH: number,
  interactive: boolean
): React.ReactNode {
  const css      = buildPreviewCSS(style, videoH);
  const fullText = words.join(' ');
  const hoverCSS: React.CSSProperties = interactive
    ? { cursor: 'text', outline: '1.5px dashed rgba(255,255,255,0.4)', outlineOffset: 5, borderRadius: 3 }
    : {};

  // Resolve word spans (use seg.words if aligned, otherwise fall back to plain words)
  const spans: WordSpan[] | null =
    seg.words && seg.words.length === words.length ? seg.words : null;
  const hasWordStyles = spans?.some((w) => w.style && Object.keys(w.style).length > 0) ?? false;

  const flexRow: React.CSSProperties = {
    display: 'inline-flex', flexWrap: 'wrap',
    columnGap: '0.3em', rowGap: 0,
    justifyContent:
      style.alignment === 'center' ? 'center' :
      style.alignment === 'right'  ? 'flex-end' : 'flex-start',
  };

  switch (style.animation) {
    case 'fade':
      return (
        <span key={seg.start} style={{ ...css, ...hoverCSS, ...(hasWordStyles ? flexRow : {}) }} className="caption-anim-fade">
          {hasWordStyles && spans
            ? renderWordRow(spans, style, videoH)
            : fullText}
        </span>
      );

    case 'word-pop': {
      const activeSpan = spans?.[wordIdx];
      return (
        <span
          key={`${seg.start}-${wordIdx}`}
          style={{ ...css, ...hoverCSS, ...wordOverrideCSS(activeSpan?.style, style, videoH) }}
          className="caption-anim-pop"
        >
          {words[wordIdx] ?? ''}
        </span>
      );
    }

    case 'karaoke':
      return (
        <span style={{ ...css, ...hoverCSS, ...flexRow }}>
          {(spans ?? words.map((t): WordSpan => ({ text: t }))).map((w, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                ...wordOverrideCSS(w.style, style, videoH),
                // highlight colour overrides word colour for active word
                ...(i === wordIdx ? { color: style.highlightColor } : {}),
              }}
            >
              {i > 0 ? <span style={{ color: 'inherit' }}> </span> : null}
              {w.text}
            </span>
          ))}
        </span>
      );

    case 'impact': {
      const activeSpan2 = spans?.[wordIdx];
      return (
        <span
          key={`${seg.start}-${wordIdx}`}
          style={{ ...css, ...hoverCSS, ...wordOverrideCSS(activeSpan2?.style, style, videoH) }}
          className="caption-anim-impact"
        >
          {words[wordIdx] ?? ''}
        </span>
      );
    }

    case 'emphasis': {
      const baseColor = css.color as string;
      const baseFW    = css.fontWeight;
      return (
        <span style={{ ...css, ...hoverCSS, ...flexRow }}>
          {(spans ?? words.map((t): WordSpan => ({ text: t }))).map((w, i) => {
            const isActive = i === wordIdx;
            const wOver    = wordOverrideCSS(w.style, style, videoH);
            return (
              <span
                key={isActive ? `a-${wordIdx}` : `i-${i}`}
                className={isActive ? 'caption-word-active' : 'caption-word-idle'}
                style={{
                  display: 'inline-block',
                  color:      isActive ? style.highlightColor : (w.style?.color ?? baseColor),
                  fontWeight: isActive ? 700 : (w.style?.bold !== undefined ? (w.style.bold ? 700 : 400) : baseFW),
                  fontStyle:  w.style?.italic !== undefined ? (w.style.italic ? 'italic' : 'normal') : undefined,
                  fontSize:   wOver.fontSize,
                  fontFamily: wOver.fontFamily,
                  opacity:    isActive ? 1 : 0.72,
                  textShadow: isActive
                    ? `0 0 12px ${style.highlightColor}99, 0 0 24px ${style.highlightColor}44`
                    : (css.textShadow as string | undefined),
                  transformOrigin: 'center bottom',
                }}
              >
                {i > 0 ? <span style={{ fontStyle: 'normal', fontWeight: 400 }}> </span> : null}
                {w.text}
              </span>
            );
          })}
        </span>
      );
    }

    default:
      return (
        <span style={{ ...css, ...hoverCSS, ...(hasWordStyles ? flexRow : {}) }}>
          {hasWordStyles && spans
            ? renderWordRow(spans, style, videoH)
            : fullText}
        </span>
      );
  }
}

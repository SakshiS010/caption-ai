'use client';

import { useEffect, useRef, useState } from 'react';
import type { CaptionSegment } from '@/lib/types';
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
  onEditCaption?: (id: string, text: string) => void;
}

interface PlayState {
  segId: string | null;
  t: number;
}

export function VideoPlayer({ videoUrl, segments, style, onTimeUpdate, onEditCaption }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playState, setPlayState] = useState<PlayState>({ segId: null, t: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [videoH, setVideoH] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTime = () => {
      const t = video.currentTime;
      onTimeUpdate?.(t);
      const found = segments.find((s) => t >= s.start && t <= s.end);
      setPlayState({ segId: found?.id ?? null, t });
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTime);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('timeupdate', handleTime);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [segments, onTimeUpdate]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const update = () => setVideoH(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Close edit when the active segment changes (user scrubbed to a different caption)
  useEffect(() => {
    setEditingId(null);
  }, [playState.segId]);

  // Always re-derive the segment from the CURRENT segments prop so live text
  // edits (from sidebar or inline) are immediately reflected in the overlay.
  const seg = playState.segId
    ? segments.find((s) => s.id === playState.segId) ?? null
    : null;

  const { t } = playState;

  let words: string[] = [];
  let wordIdx = 0;
  if (seg) {
    const text = applyLetterCase(seg.text, style.letterCase);
    words = text.split(/\s+/).filter(Boolean);
    const posInSeg = Math.max(0, t - seg.start);
    const dur = Math.max(0.01, seg.end - seg.start);
    wordIdx = Math.min(Math.floor((posInSeg / dur) * words.length), words.length - 1);
  }

  const openEdit = () => {
    if (!seg || !onEditCaption) return;
    videoRef.current?.pause();
    setEditingId(seg.id);
  };

  return (
    <div className="relative bg-black rounded-xl overflow-hidden aspect-video w-full group">
      <video ref={videoRef} src={videoUrl} controls className="w-full h-full" />

      {/* Live preview badge */}
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] font-semibold text-white/70 select-none pointer-events-none">
        LIVE PREVIEW
      </div>

      {/* Click-to-edit hint — shown when a caption is visible and video paused */}
      {seg && !isPlaying && onEditCaption && editingId !== seg.id && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white/60 select-none pointer-events-none">
          ✏️ Click caption to edit
        </div>
      )}

      {/* Caption overlay — pointer-events none so clicks pass to video controls */}
      {seg && videoH > 0 && (
        <div style={{ ...buildOverlayCSS(style, videoH), pointerEvents: 'none' }}>
          {editingId === seg.id && onEditCaption ? (
            // ── Inline edit textarea ──────────────────────────────────────────
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
            // ── Live caption display — clickable when not playing ─────────────
            <div
              style={{ pointerEvents: onEditCaption ? 'auto' : 'none' }}
              onClick={openEdit}
              title={onEditCaption ? 'Click to edit' : undefined}
            >
              {renderCaption(seg, words, wordIdx, style, videoH, !!onEditCaption && !isPlaying)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderCaption(
  seg: CaptionSegment,
  words: string[],
  wordIdx: number,
  style: CaptionStyle,
  videoH: number,
  interactive: boolean
): React.ReactNode {
  const css = buildPreviewCSS(style, videoH);
  const fullText = words.join(' ');

  // Dashed outline hint only shown when video is paused and caption is clickable
  const hoverCSS: React.CSSProperties = interactive
    ? { cursor: 'text', outline: '1.5px dashed rgba(255,255,255,0.4)', outlineOffset: 5, borderRadius: 3 }
    : {};

  switch (style.animation) {
    case 'fade':
      return (
        <span key={seg.start} style={{ ...css, ...hoverCSS }} className="caption-anim-fade">
          {fullText}
        </span>
      );

    case 'word-pop':
      return (
        <span
          key={`${seg.start}-${wordIdx}`}
          style={{ ...css, ...hoverCSS }}
          className="caption-anim-pop"
        >
          {words[wordIdx] ?? ''}
        </span>
      );

    case 'karaoke':
      return (
        <span style={{ ...css, ...hoverCSS }}>
          {words.map((w, i) => (
            <span key={i} style={i === wordIdx ? { color: style.highlightColor } : undefined}>
              {i > 0 ? ' ' : ''}{w}
            </span>
          ))}
        </span>
      );

    case 'impact':
      return (
        <span
          key={`${seg.start}-${wordIdx}`}
          style={{ ...css, ...hoverCSS }}
          className="caption-anim-impact"
        >
          {words[wordIdx] ?? ''}
        </span>
      );

    default:
      return <span style={{ ...css, ...hoverCSS }}>{fullText}</span>;
  }
}

'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { CaptionSegment } from '@/lib/types';

const MIN_DUR     = 0.15; // minimum segment duration (seconds)
const HANDLE_PX   = 8;   // left/right resize-handle width (pixels)

interface Props {
  duration:          number;
  currentTime:       number;
  segments:          CaptionSegment[];
  selectedId?:       string;
  onSeek:            (time: number) => void;
  onSegmentsChange:  (segs: CaptionSegment[]) => void;
  onSegmentSelect?:  (id: string) => void;
}

type DragTarget =
  | { kind: 'playhead' }
  | { kind: 'move';         id: string; origStart: number; origEnd: number; anchorX: number }
  | { kind: 'resize-left';  id: string; origStart: number; fixedEnd:  number; anchorX: number }
  | { kind: 'resize-right'; id: string; fixedStart: number; origEnd: number; anchorX: number };

function fmtMs(s: number) {
  const m  = Math.floor(s / 60);
  const se = (s % 60).toFixed(2).padStart(5, '0');
  return `${m}:${se}`;
}
function fmtHM(s: number) {
  const m  = Math.floor(s / 60);
  const se = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${se}`;
}

export function Timeline({
  duration, currentTime, segments, selectedId,
  onSeek, onSegmentsChange, onSegmentSelect,
}: Props) {
  const trackRef    = useRef<HTMLDivElement>(null);
  // Always-fresh ref so mouse-event closures never read stale segments
  const segsRef     = useRef(segments);
  useEffect(() => { segsRef.current = segments; }, [segments]);

  const [drag, setDrag] = useState<DragTarget | null>(null);

  const safeD = Math.max(1, duration);
  const clamped = Math.max(0, Math.min(currentTime, duration));
  const pct = (t: number) =>
    `${Math.min(100, (Math.max(0, t) / safeD) * 100)}%`;

  /* Convert a pixel X on the track to seconds */
  const xToTime = useCallback((clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return 0;
    return Math.max(0, Math.min(duration, ((clientX - r.left) / r.width) * duration));
  }, [duration]);

  /* Convert a pixel delta to a seconds delta */
  const dxToTime = useCallback((dx: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r || !r.width) return 0;
    return (dx / r.width) * duration;
  }, [duration]);

  const patch = useCallback((id: string, changes: Partial<CaptionSegment>) => {
    onSegmentsChange(segsRef.current.map((s) => s.id === id ? { ...s, ...changes } : s));
  }, [onSegmentsChange]);

  /* ── Track background: start playhead drag ─────────────────────── */
  const onTrackDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDrag({ kind: 'playhead' });
    onSeek(xToTime(e.clientX));
  };

  /* ── Segment handle: start segment drag ────────────────────────── */
  const onSegDown = (
    e: React.MouseEvent,
    seg: CaptionSegment,
    kind: 'move' | 'resize-left' | 'resize-right',
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onSegmentSelect?.(seg.id);
    onSeek(seg.start);
    if (kind === 'move')
      setDrag({ kind: 'move', id: seg.id, origStart: seg.start, origEnd: seg.end, anchorX: e.clientX });
    else if (kind === 'resize-left')
      setDrag({ kind: 'resize-left', id: seg.id, origStart: seg.start, fixedEnd: seg.end, anchorX: e.clientX });
    else
      setDrag({ kind: 'resize-right', id: seg.id, fixedStart: seg.start, origEnd: seg.end, anchorX: e.clientX });
  };

  /* ── Global move / up ──────────────────────────────────────────── */
  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      if (drag.kind === 'playhead') { onSeek(xToTime(e.clientX)); return; }
      const dt = dxToTime(e.clientX - drag.anchorX);

      if (drag.kind === 'move') {
        const dur = drag.origEnd - drag.origStart;
        const ns  = Math.max(0, Math.min(safeD - dur, drag.origStart + dt));
        patch(drag.id, { start: ns, end: ns + dur });
        onSeek(ns);
      } else if (drag.kind === 'resize-left') {
        const ns = Math.max(0, Math.min(drag.fixedEnd - MIN_DUR, drag.origStart + dt));
        patch(drag.id, { start: ns });
      } else {
        const ne = Math.min(safeD, Math.max(drag.fixedStart + MIN_DUR, drag.origEnd + dt));
        patch(drag.id, { end: ne });
      }
    };
    const onUp = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [drag, onSeek, xToTime, dxToTime, patch, safeD]);

  /* Tick intervals */
  const tickInterval =
    duration <= 30  ? 5  :
    duration <= 120 ? 15 :
    duration <= 300 ? 30 :
    duration <= 600 ? 60 : 120;
  const ticks: number[] = [];
  for (let t = tickInterval; t < duration; t += tickInterval) ticks.push(t);

  const selectedSeg = segments.find((s) => s.id === selectedId);
  const draggingId  = drag && drag.kind !== 'playhead' ? drag.id : null;

  const trackCursor =
    drag?.kind === 'playhead'      ? 'col-resize' :
    drag?.kind === 'move'          ? 'grabbing'   :
    drag?.kind?.startsWith('res')  ? 'ew-resize'  : 'crosshair';

  if (duration <= 0) return null;

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl px-4 pt-3 pb-2.5 select-none"
      style={{ background: 'rgba(12,22,16,0.85)', border: '1px solid rgba(52,183,136,0.2)' }}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between font-display text-xs font-semibold">
        <span style={{ color: '#f472b6', fontVariantNumeric: 'tabular-nums', minWidth: 40 }}>
          {fmtHM(clamped)}
        </span>

        {selectedSeg ? (
          /* Show selected segment timing while a segment is focused */
          <span className="flex items-center gap-1.5" style={{ color: '#95d5b2', fontSize: 10 }}>
            <span style={{ color: '#52b788', opacity: 0.7 }}>✂</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtMs(selectedSeg.start)}</span>
            <span style={{ color: '#52b788' }}>→</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtMs(selectedSeg.end)}</span>
            <span style={{ color: '#40916c', marginLeft: 2 }}>
              ({(selectedSeg.end - selectedSeg.start).toFixed(2)}s)
            </span>
          </span>
        ) : (
          <span style={{ color: '#52b788', opacity: 0.55, letterSpacing: '0.1em', fontSize: 9 }}>
            ── TIMELINE ──
          </span>
        )}

        <span style={{ color: '#74c69d', fontVariantNumeric: 'tabular-nums', minWidth: 40, textAlign: 'right' }}>
          {fmtHM(duration)}
        </span>
      </div>

      {/* ── Track ─────────────────────────────────────────────────── */}
      <div
        ref={trackRef}
        onMouseDown={onTrackDown}
        className="relative rounded-xl"
        style={{
          height: 68,
          background: 'rgba(8,16,11,0.95)',
          border: '1px solid rgba(52,183,136,0.18)',
          cursor: trackCursor,
          overflow: 'visible',
        }}
      >
        {/* Played region tint */}
        <div
          className="absolute inset-y-0 left-0 rounded-l-xl pointer-events-none"
          style={{ width: pct(clamped), background: 'rgba(52,183,136,0.04)' }}
        />

        {/* Tick marks */}
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute inset-y-0 pointer-events-none"
            style={{ left: pct(t), width: 1, background: 'rgba(52,183,136,0.13)' }}
          >
            <span
              className="absolute font-display"
              style={{ bottom: 3, left: 3, fontSize: 8, color: 'rgba(116,198,157,0.4)', whiteSpace: 'nowrap', lineHeight: 1 }}
            >
              {fmtHM(t)}
            </span>
          </div>
        ))}

        {/* ── Caption segments ──────────────────────────────────── */}
        {segments.map((seg) => {
          const isActive   = currentTime >= seg.start && currentTime <= seg.end;
          const isSelected = seg.id === selectedId;
          const isDragging = seg.id === draggingId;
          const segPctW    = Math.max(0.25, (seg.end - seg.start) / safeD * 100);

          const bgColor = isSelected
            ? 'rgba(244,114,182,0.3)'
            : isActive
            ? 'rgba(244,114,182,0.18)'
            : 'rgba(52,183,136,0.28)';

          const borderColor = isSelected
            ? 'rgba(244,114,182,0.9)'
            : isActive
            ? 'rgba(244,114,182,0.55)'
            : 'rgba(82,183,136,0.55)';

          return (
            <div
              key={seg.id}
              style={{
                position: 'absolute',
                left:     pct(seg.start),
                width:    `${segPctW}%`,
                top:      '12%',
                height:   '76%',
                borderRadius: 5,
                background: bgColor,
                border:   `1.5px solid ${borderColor}`,
                boxShadow: isSelected
                  ? '0 0 12px rgba(244,114,182,0.35), inset 0 0 0 1px rgba(244,114,182,0.15)'
                  : isActive
                  ? '0 0 6px rgba(244,114,182,0.15)'
                  : 'none',
                opacity:    isDragging ? 0.75 : 1,
                transition: isDragging ? 'none' : 'background 0.12s, border-color 0.12s, box-shadow 0.12s',
                zIndex:     isSelected ? 6 : isActive ? 5 : 2,
              }}
            >
              {/* Left resize handle */}
              <div
                onMouseDown={(e) => onSegDown(e, seg, 'resize-left')}
                title="Drag to resize start"
                style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: HANDLE_PX, cursor: 'ew-resize', zIndex: 3,
                  borderRight: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '5px 0 0 5px',
                  background: 'rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{ width: 1.5, height: 10, borderRadius: 1, background: 'rgba(255,255,255,0.3)' }} />
              </div>

              {/* Body — drag to move */}
              <div
                onMouseDown={(e) => onSegDown(e, seg, 'move')}
                style={{
                  position: 'absolute',
                  left: HANDLE_PX, right: HANDLE_PX,
                  top: 0, bottom: 0,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  display: 'flex', alignItems: 'center',
                  paddingInline: 3, overflow: 'hidden',
                }}
              >
                {segPctW > 4 && (
                  <span
                    className="font-display"
                    style={{
                      fontSize: 7,
                      lineHeight: 1.3,
                      color: isSelected || isActive ? 'rgba(255,255,255,0.88)' : 'rgba(82,183,136,0.8)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    {seg.text.slice(0, 36)}{seg.text.length > 36 ? '…' : ''}
                  </span>
                )}
              </div>

              {/* Right resize handle */}
              <div
                onMouseDown={(e) => onSegDown(e, seg, 'resize-right')}
                title="Drag to resize end"
                style={{
                  position: 'absolute', right: 0, top: 0, bottom: 0,
                  width: HANDLE_PX, cursor: 'ew-resize', zIndex: 3,
                  borderLeft: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '0 5px 5px 0',
                  background: 'rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{ width: 1.5, height: 10, borderRadius: 1, background: 'rgba(255,255,255,0.3)' }} />
              </div>
            </div>
          );
        })}

        {/* ── Playhead ────────────────────────────────────────────── */}
        <div
          className="absolute inset-y-0 pointer-events-none"
          style={{
            left:      pct(clamped),
            width:     2,
            transform: 'translateX(-50%)',
            background: '#f472b6',
            zIndex:    20,
            boxShadow: '0 0 8px rgba(244,114,182,0.75), 0 0 20px rgba(244,114,182,0.25)',
          }}
        >
          {/* Diamond head */}
          <div style={{
            position: 'absolute', top: -1, left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 10, height: 10,
            background: '#f472b6',
            boxShadow: '0 0 8px rgba(244,114,182,0.9)',
          }} />
          {/* Tail */}
          <div style={{
            position: 'absolute', bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 6, height: 6, borderRadius: '50%', background: '#f472b6',
          }} />
        </div>
      </div>

      {/* ── Footer hint ───────────────────────────────────────────── */}
      <p className="text-center font-display" style={{ fontSize: 9, color: 'rgba(116,198,157,0.38)', letterSpacing: '0.06em' }}>
        {segments.length > 0
          ? 'drag body to move · drag edges ◀▶ to resize · click track to seek'
          : 'Generate captions — they will appear here as editable blocks'}
      </p>
    </div>
  );
}

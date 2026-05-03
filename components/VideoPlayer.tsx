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
}

export function VideoPlayer({ videoUrl, segments, style, onTimeUpdate }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [caption, setCaption] = useState('');
  const [videoH, setVideoH] = useState(0);

  // Track active caption for the current playback time.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTime = () => {
      const t = video.currentTime;
      onTimeUpdate?.(t);
      const active = segments.find((s) => t >= s.start && t <= s.end);
      setCaption(active?.text ?? '');
    };

    video.addEventListener('timeupdate', handleTime);
    return () => video.removeEventListener('timeupdate', handleTime);
  }, [segments, onTimeUpdate]);

  // Track the video element's actual rendered height so the preview font
  // size scales with the player and matches what the burn will produce.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const update = () => setVideoH(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden aspect-video w-full"
    >
      <video ref={videoRef} src={videoUrl} controls className="w-full h-full" />

      {caption && videoH > 0 && (
        <div style={buildOverlayCSS(style, videoH)}>
          <span style={buildPreviewCSS(style, videoH)}>
            {applyLetterCase(caption, style.letterCase)}
          </span>
        </div>
      )}
    </div>
  );
}

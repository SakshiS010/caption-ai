'use client';

import { useEffect, useRef, useState } from 'react';
import type { CaptionSegment } from '@/lib/types';

interface Props {
  videoUrl: string;
  segments: CaptionSegment[];
  onTimeUpdate?: (time: number) => void;
}

export function VideoPlayer({ videoUrl, segments, onTimeUpdate }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [caption, setCaption] = useState('');

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

  return (
    <div className="relative bg-black rounded-xl overflow-hidden aspect-video w-full">
      <video ref={videoRef} src={videoUrl} controls className="w-full h-full" />

      {caption && (
        <div className="absolute bottom-14 inset-x-0 flex justify-center px-6 pointer-events-none">
          <span className="bg-black/80 text-white text-sm md:text-base px-4 py-2 rounded-lg text-center max-w-2xl leading-relaxed font-medium shadow-lg">
            {caption}
          </span>
        </div>
      )}
    </div>
  );
}

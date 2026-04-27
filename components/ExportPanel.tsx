'use client';

import { useState } from 'react';
import type { CaptionSegment } from '@/lib/types';
import { toSRT, toWebVTT, downloadFile } from '@/lib/captionUtils';
import { burnCaptions } from '@/lib/ffmpeg';

interface Props {
  segments: CaptionSegment[];
  videoFile: File;
}

export function ExportPanel({ segments, videoFile }: Props) {
  const [burning, setBurning] = useState(false);
  const [burnStage, setBurnStage] = useState('');
  const [burnValue, setBurnValue] = useState(0);

  const handleBurn = async () => {
    if (burning) return;
    setBurning(true);
    setBurnValue(0);

    try {
      const srt = toSRT(segments);
      const data = await burnCaptions(videoFile, srt, (stage, value) => {
        setBurnStage(stage);
        setBurnValue(value);
      });

      // Trigger download of the finished MP4
      const blob = new Blob([data.buffer.slice(0) as ArrayBuffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = videoFile.name.replace(/\.[^.]+$/, '');
      a.download = `${baseName}-captioned.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Burn failed';
      setBurnStage(`Error: ${msg}`);
    } finally {
      setBurning(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* SRT + VTT row */}
      <div className="flex gap-3">
        <button
          onClick={() => downloadFile(toSRT(segments), 'captions.srt', 'text/plain')}
          className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          Export SRT
        </button>
        <button
          onClick={() => downloadFile(toWebVTT(segments), 'captions.vtt', 'text/vtt')}
          className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          Export VTT
        </button>
      </div>

      {/* Burn button */}
      {burning ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300 truncate">{burnStage}</span>
            <span className="text-gray-400 ml-2 flex-shrink-0">{burnValue}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${burnValue}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Re-encoding video — this takes 1–3 min depending on length.
          </p>
        </div>
      ) : (
        <button
          onClick={handleBurn}
          className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-semibold transition-colors"
        >
          🔥 Burn Captions into Video — download MP4
        </button>
      )}
    </div>
  );
}

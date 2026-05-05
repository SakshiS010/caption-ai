'use client';

import { useState, useRef, useCallback } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { VideoPlayer } from '@/components/VideoPlayer';
import { CaptionEditor } from '@/components/CaptionEditor';
import { ExportPanel } from '@/components/ExportPanel';
import { StylePanel } from '@/components/StylePanel';
import { extractAudio } from '@/lib/ffmpeg';
import { transcribeAudio } from '@/lib/transcription';
import { type CaptionStyle, DEFAULT_STYLE } from '@/lib/captionStyle';
import type { CaptionSegment, AppState, ProgressInfo } from '@/lib/types';

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [segments, setSegments] = useState<CaptionSegment[]>([]);
  const [state, setState] = useState<AppState>('idle');
  const [progress, setProgress] = useState<ProgressInfo>({ stage: '', value: 0 });
  const [currentTime, setCurrentTime] = useState(0);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(DEFAULT_STYLE);
  const cancelRef = useRef<(() => void) | null>(null);

  const handleUpload = useCallback(
    (file: File) => {
      cancelRef.current?.();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setSegments([]);
      setState('idle');
      setProgress({ stage: '', value: 0 });
    },
    [videoUrl]
  );

  const handleGenerate = useCallback(async () => {
    if (!videoFile || state === 'extracting' || state === 'transcribing') return;

    try {
      // Step 1: extract audio via FFmpeg.wasm
      setState('extracting');
      const audioData = await extractAudio(videoFile, (stage, value) =>
        setProgress({ stage, value })
      );

      // Step 2: transcribe via Whisper running in a Web Worker
      setState('transcribing');
      setProgress({ stage: 'Starting transcription...', value: 0 });

      cancelRef.current = transcribeAudio(audioData, {
        onStatus: (stage) => setProgress((p) => ({ ...p, stage })),
        onProgress: (stage, value) => setProgress({ stage, value }),
        onComplete: (newSegments) => {
          setSegments(newSegments);
          setState(newSegments.length > 0 ? 'done' : 'error');
          setProgress(
            newSegments.length > 0
              ? { stage: '', value: 0 }
              : { stage: 'No speech detected. Try a video with clearer audio or spoken words.', value: 0 }
          );
        },
        onError: (message) => {
          setState('error');
          setProgress({ stage: `Error: ${message}`, value: 0 });
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setState('error');
      setProgress({ stage: `Error: ${msg}`, value: 0 });
    }
  }, [videoFile, state]);

  const isProcessing = state === 'extracting' || state === 'transcribing';

  if (!videoUrl) {
    return <LandingPage onUpload={handleUpload} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header — only shown inside the editor */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => { cancelRef.current?.(); if (videoUrl) URL.revokeObjectURL(videoUrl); setVideoUrl(null); setVideoFile(null); setSegments([]); setState('idle'); }}
          className="w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm select-none transition-colors"
          title="Back to home"
        >
          C
        </button>
        <h1 className="text-lg font-bold">CaptionAI</h1>
        <span className="text-xs text-gray-500 hidden sm:inline">
          Powered by Whisper &middot; 100% free &middot; runs entirely in your browser
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: video + controls (2/3 width) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <VideoPlayer
                videoUrl={videoUrl}
                segments={segments}
                style={captionStyle}
                onTimeUpdate={setCurrentTime}
                onEditCaption={(id, text) =>
                  setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)))
                }
              />

              {/* Caption styling controls */}
              {segments.length > 0 && (
                <StylePanel style={captionStyle} onChange={setCaptionStyle} />
              )}

              {/* Progress bar */}
              {isProcessing && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300 truncate">{progress.stage}</span>
                    <span className="text-gray-400 ml-2 flex-shrink-0">{progress.value}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress.value}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              {!isProcessing && (
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerate}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-sm transition-colors"
                  >
                    {segments.length > 0 ? '↺ Regenerate Captions' : '✨ Generate Captions'}
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'video/*';
                      input.onchange = (e) => {
                        const f = (e.target as HTMLInputElement).files?.[0];
                        if (f) handleUpload(f);
                      };
                      input.click();
                    }}
                    className="py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition-colors"
                  >
                    Change video
                  </button>
                </div>
              )}

              {/* Error */}
              {state === 'error' && (
                <p className="text-red-400 text-sm text-center">{progress.stage}</p>
              )}

              {/* Export */}
              {segments.length > 0 && !isProcessing && videoFile && (
                <ExportPanel segments={segments} videoFile={videoFile} style={captionStyle} />
              )}
            </div>

            {/* Right: caption editor (1/3 width) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-200">Captions</h2>
                {segments.length > 0 && (
                  <span className="text-xs text-gray-500">{segments.length} segments</span>
                )}
              </div>
              <CaptionEditor
                segments={segments}
                currentTime={currentTime}
                onUpdate={setSegments}
              />
            </div>
          </div>
      </main>
    </div>
  );
}

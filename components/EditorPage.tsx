'use client';

import { useState, useCallback } from 'react';
import { OllyNav } from './OllyNav';
import { VideoPlayer } from './VideoPlayer';
import { Timeline } from './Timeline';
import { StylePanel } from './StylePanel';
import { CaptionEditor } from './CaptionEditor';
import { ExportPanel } from './ExportPanel';
import type { CaptionSegment, AppState, ProgressInfo } from '@/lib/types';
import type { CaptionStyle } from '@/lib/captionStyle';

interface Props {
  videoUrl: string;
  videoFile: File;
  segments: CaptionSegment[];
  setSegments: React.Dispatch<React.SetStateAction<CaptionSegment[]>>;
  captionStyle: CaptionStyle;
  setCaptionStyle: React.Dispatch<React.SetStateAction<CaptionStyle>>;
  appState: AppState;
  progress: ProgressInfo;
  currentTime: number;
  onTimeUpdate: (t: number) => void;
  onUpload: (file: File) => void;
  onGenerate: () => void;
  onFeedback: () => void;
  onHome: () => void;
}

type Tab = 'captions' | 'style' | 'export';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'captions', label: 'Captions', emoji: '🗒️' },
  { id: 'style',    label: 'Style',    emoji: '🎨' },
  { id: 'export',   label: 'Export',   emoji: '📦' },
];

export function EditorPage({
  videoUrl, videoFile, segments, setSegments,
  captionStyle, setCaptionStyle, appState, progress,
  currentTime, onTimeUpdate, onUpload, onGenerate, onFeedback, onHome,
}: Props) {
  const [activeTab,          setActiveTab]          = useState<Tab>('captions');
  const [videoDuration,      setVideoDuration]      = useState(0);
  const [seekTime,           setSeekTime]           = useState<{ value: number; id: number } | undefined>();
  const [selectedSegmentId,  setSelectedSegmentId]  = useState<string | undefined>();

  const handleSeek = useCallback((time: number) => {
    setSeekTime({ value: time, id: Date.now() });
  }, []);

  const handleSegmentSelect = useCallback((id: string) => {
    setSelectedSegmentId(id);
    setActiveTab('captions');
  }, []);

  const isProcessing = appState === 'extracting' || appState === 'transcribing';

  const feedbackBtn = (
    <button
      onClick={onFeedback}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full font-display font-semibold text-sm transition-all hover:-translate-y-0.5 active:scale-95"
      style={{
        background: 'linear-gradient(135deg, #ec4899, #f472b6)',
        color: '#fff',
        boxShadow: '0 3px 12px rgba(236,72,153,.3)',
      }}
    >
      💌 Feedback
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--avo-900)', color: '#d8f3dc' }}>

      {/* Nav */}
      <OllyNav step={2} onHome={onHome} dark rightSlot={feedbackBtn} />

      {/* Main */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── LEFT: Video + generate ──────────────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Video player */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{ border: '2px solid rgba(52,183,136,0.25)', boxShadow: '0 8px 40px rgba(15,31,22,0.6)' }}
            >
              <VideoPlayer
                videoUrl={videoUrl}
                segments={segments}
                style={captionStyle}
                onTimeUpdate={onTimeUpdate}
                onDurationChange={setVideoDuration}
                seekTime={seekTime}
                onEditCaption={(id, text) =>
                  setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)))
                }
                onPositionChange={(x, y) =>
                  setCaptionStyle((prev) => ({ ...prev, positionX: x, positionY: y }))
                }
              />
            </div>

            {/* Timeline */}
            <Timeline
              duration={videoDuration}
              currentTime={currentTime}
              segments={segments}
              selectedId={selectedSegmentId}
              onSeek={handleSeek}
              onSegmentsChange={setSegments}
              onSegmentSelect={handleSegmentSelect}
            />

            {/* Generate / progress */}
            {isProcessing ? (
              <div
                className="rounded-2xl px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(52,183,136,0.2)' }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-sm font-semibold flex items-center gap-2" style={{ color: '#95d5b2' }}>
                    <span className="spin-seed inline-block">🌱</span>
                    {progress.stage}
                  </span>
                  <span className="font-display text-sm font-bold" style={{ color: '#52b788' }}>
                    {progress.value}%
                  </span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'rgba(52,183,136,0.15)' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${progress.value}%`,
                      background: 'linear-gradient(90deg, #40916c, #52b788, #f472b6)',
                    }}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: '#52b788', opacity: 0.6 }}>
                  Olly is listening... 🥑
                </p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={onGenerate}
                  className="flex-1 py-3.5 rounded-2xl font-display font-semibold text-white transition-all hover:-translate-y-0.5 active:scale-[.98]"
                  style={{
                    background: segments.length > 0
                      ? 'linear-gradient(135deg, #2d6a4f, #40916c)'
                      : 'linear-gradient(135deg, #ec4899, #f472b6)',
                    boxShadow: segments.length > 0
                      ? '0 4px 18px rgba(45,106,79,.4)'
                      : '0 4px 18px rgba(236,72,153,.35)',
                  }}
                >
                  {segments.length > 0 ? '↺ Regenerate Captions' : '✨ Generate Captions'}
                </button>
                <button
                  onClick={() => {
                    const inp = document.createElement('input');
                    inp.type = 'file'; inp.accept = 'video/*';
                    inp.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) onUpload(f);
                    };
                    inp.click();
                  }}
                  className="px-5 py-3.5 rounded-2xl font-display font-semibold text-sm transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#95d5b2', border: '1px solid rgba(52,183,136,0.25)' }}
                >
                  Change video
                </button>
              </div>
            )}

            {/* Error */}
            {appState === 'error' && (
              <p className="text-sm text-center font-display font-semibold" style={{ color: '#f472b6' }}>
                🌸 {progress.stage}
              </p>
            )}
          </div>

          {/* ── RIGHT: Tabs ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Tab bar */}
            <div
              className="flex rounded-2xl p-1 gap-1"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(52,183,136,0.2)' }}
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-display font-semibold text-sm transition-all duration-200"
                  style={{
                    background: activeTab === t.id ? 'linear-gradient(135deg, #2d6a4f, #40916c)' : 'transparent',
                    color: activeTab === t.id ? '#fff' : '#74c69d',
                    boxShadow: activeTab === t.id ? '0 2px 10px rgba(45,106,79,.35)' : 'none',
                  }}
                >
                  <span>{t.emoji}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0 avo-editor">
              {activeTab === 'captions' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold" style={{ color: '#95d5b2' }}>
                      {segments.length > 0 ? `${segments.length} captions` : 'Captions'}
                    </span>
                    {segments.length === 0 && (
                      <span className="text-xs" style={{ color: '#52b788', opacity: 0.6 }}>
                        Generate captions first 🌱
                      </span>
                    )}
                  </div>
                  <CaptionEditor
                    segments={segments}
                    currentTime={currentTime}
                    onUpdate={setSegments}
                    selectedId={selectedSegmentId}
                    onSelect={setSelectedSegmentId}
                  />
                </div>
              )}

              {activeTab === 'style' && (
                <StylePanel style={captionStyle} onChange={setCaptionStyle} />
              )}

              {activeTab === 'export' && (
                <div className="flex flex-col gap-4">
                  <p className="font-display font-semibold" style={{ color: '#95d5b2' }}>Export</p>
                  {segments.length === 0 ? (
                    <div
                      className="rounded-2xl p-6 text-center"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(52,183,136,0.25)' }}
                    >
                      <p className="text-sm" style={{ color: '#52b788' }}>
                        Generate captions first, then export here 🌱
                      </p>
                    </div>
                  ) : (
                    <ExportPanel segments={segments} videoFile={videoFile} style={captionStyle} />
                  )}
                </div>
              )}
            </div>

            {/* Feedback CTA */}
            <button
              onClick={onFeedback}
              className="w-full py-3 rounded-2xl font-display font-semibold text-sm transition-all hover:-translate-y-0.5 active:scale-[.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(244,114,182,0.18))',
                border: '1.5px solid rgba(244,114,182,0.4)',
                color: '#f9a8d4',
              }}
            >
              💌 Share feedback with Olly
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

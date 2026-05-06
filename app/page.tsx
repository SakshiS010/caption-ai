'use client';

import { useState, useRef, useCallback } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { EditorPage } from '@/components/EditorPage';
import { FeedbackPage } from '@/components/FeedbackPage';
import { extractAudio } from '@/lib/ffmpeg';
import { transcribeAudio } from '@/lib/transcription';
import { type CaptionStyle, DEFAULT_STYLE } from '@/lib/captionStyle';
import type { CaptionSegment, AppState, ProgressInfo } from '@/lib/types';

export default function Home() {
  const [step, setStep]               = useState<1 | 2 | 3>(1);
  const [videoFile, setVideoFile]     = useState<File | null>(null);
  const [videoUrl, setVideoUrl]       = useState<string | null>(null);
  const [segments, setSegments]       = useState<CaptionSegment[]>([]);
  const [appState, setAppState]       = useState<AppState>('idle');
  const [progress, setProgress]       = useState<ProgressInfo>({ stage: '', value: 0 });
  const [currentTime, setCurrentTime] = useState(0);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(DEFAULT_STYLE);
  const cancelRef = useRef<(() => void) | null>(null);

  const goHome = useCallback(() => {
    cancelRef.current?.();
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setVideoFile(null);
    setSegments([]);
    setAppState('idle');
    setProgress({ stage: '', value: 0 });
    setStep(1);
  }, [videoUrl]);

  const handleUpload = useCallback(
    (file: File) => {
      cancelRef.current?.();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setSegments([]);
      setAppState('idle');
      setProgress({ stage: '', value: 0 });
      setStep(2);
    },
    [videoUrl]
  );

  const handleGenerate = useCallback(async () => {
    if (!videoFile || appState === 'extracting' || appState === 'transcribing') return;

    try {
      setAppState('extracting');
      const audioData = await extractAudio(videoFile, (stage, value) =>
        setProgress({ stage, value })
      );

      setAppState('transcribing');
      setProgress({ stage: 'Starting transcription...', value: 0 });

      cancelRef.current = transcribeAudio(audioData, {
        onStatus:   (stage)         => setProgress((p) => ({ ...p, stage })),
        onProgress: (stage, value)  => setProgress({ stage, value }),
        onComplete: (newSegments)   => {
          setSegments(newSegments);
          setAppState(newSegments.length > 0 ? 'done' : 'error');
          setProgress(
            newSegments.length > 0
              ? { stage: '', value: 0 }
              : { stage: 'No speech detected. Try a video with clearer audio or spoken words.', value: 0 }
          );
        },
        onError: (message) => {
          setAppState('error');
          setProgress({ stage: message, value: 0 });
        },
      });
    } catch (err: unknown) {
      setAppState('error');
      setProgress({ stage: err instanceof Error ? err.message : 'Something went wrong', value: 0 });
    }
  }, [videoFile, appState]);

  if (step === 1) {
    return <LandingPage onUpload={handleUpload} />;
  }

  if (step === 3) {
    return <FeedbackPage onBack={() => setStep(2)} onHome={goHome} />;
  }

  return (
    <EditorPage
      videoUrl={videoUrl!}
      videoFile={videoFile!}
      segments={segments}
      setSegments={setSegments}
      captionStyle={captionStyle}
      setCaptionStyle={setCaptionStyle}
      appState={appState}
      progress={progress}
      currentTime={currentTime}
      onTimeUpdate={setCurrentTime}
      onUpload={handleUpload}
      onGenerate={handleGenerate}
      onFeedback={() => setStep(3)}
      onHome={goHome}
    />
  );
}

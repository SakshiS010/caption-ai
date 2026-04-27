import type { CaptionSegment } from './types';

interface RawChunk {
  text: string;
  timestamp: [number, number | null];
}

interface GroupedChunk {
  text: string;
  start: number;
  end: number;
}

// Whisper returns word-level chunks. Group them into ~5-second caption lines
// so the editor shows readable sentences instead of one word per row.
function groupChunks(chunks: RawChunk[]): GroupedChunk[] {
  const MAX_DURATION = 5; // seconds per caption line
  const groups: GroupedChunk[] = [];
  let current: GroupedChunk | null = null;

  for (const chunk of chunks) {
    const start = chunk.timestamp[0] ?? 0;
    const end = chunk.timestamp[1] ?? start + 1;
    const text = chunk.text;

    if (!current) {
      current = { text, start, end };
    } else if (end - current.start > MAX_DURATION) {
      groups.push(current);
      current = { text, start, end };
    } else {
      current.text += text;
      current.end = end;
    }
  }

  if (current) groups.push(current);
  return groups;
}

export interface TranscribeCallbacks {
  onStatus?: (stage: string) => void;
  onProgress?: (stage: string, value: number) => void;
  onComplete?: (segments: CaptionSegment[]) => void;
  onError?: (message: string) => void;
}

export function transcribeAudio(
  audioData: Float32Array,
  callbacks: TranscribeCallbacks
): () => void {
  const worker = new Worker(
    new URL('../workers/transcription.worker.ts', import.meta.url)
  );

  worker.onmessage = (event: MessageEvent) => {
    const { type } = event.data;

    if (type === 'status') {
      callbacks.onStatus?.(event.data.stage);
    } else if (type === 'progress') {
      callbacks.onProgress?.(event.data.stage, event.data.value);
    } else if (type === 'result') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = event.data.data as any;
      const segments: CaptionSegment[] = [];

      console.log('[transcription.ts] processing result:', result);

      if (Array.isArray(result.chunks) && result.chunks.length > 0) {
        // Group word-level chunks into ~5-second sentence groups for readable captions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const grouped = groupChunks(result.chunks);
        grouped.forEach((chunk: GroupedChunk, i: number) => {
          const text = chunk.text.trim();
          if (!text) return;
          segments.push({
            id: `seg-${i}`,
            start: chunk.start,
            end: chunk.end,
            text,
          });
        });
      }

      // Fallback: Whisper returned only a flat text string with no chunk timestamps
      if (segments.length === 0 && result.text?.trim()) {
        segments.push({ id: 'seg-0', start: 0, end: 9999, text: result.text.trim() });
      }

      console.log('[transcription.ts] final segments:', segments);
      callbacks.onComplete?.(segments);
      worker.terminate();
    } else if (type === 'error') {
      callbacks.onError?.(event.data.message);
      worker.terminate();
    }
  };

  // Transfer buffer ownership so the data is not copied — faster for large audio
  worker.postMessage({ type: 'transcribe', audioData }, [audioData.buffer]);

  return () => worker.terminate();
}

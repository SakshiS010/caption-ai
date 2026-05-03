import { pipeline, env } from '@xenova/transformers';

// Download models from Hugging Face Hub and cache in browser IndexedDB
env.allowLocalModels = false;
env.useBrowserCache = true;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let transcriber: any = null;

self.onmessage = async (event: MessageEvent) => {
  if (event.data.type !== 'transcribe') return;

  try {
    if (!transcriber) {
      self.postMessage({ type: 'status', stage: 'Downloading AI model (~80 MB, once only)...' });

      transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-base',
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          progress_callback: (data: any) => {
            if (data.status === 'progress' && data.total > 0) {
              self.postMessage({
                type: 'progress',
                stage: `Downloading model: ${data.file ?? ''}`,
                value: Math.round(data.progress ?? 0),
              });
            }
          },
        }
      );
    }

    self.postMessage({ type: 'status', stage: 'Transcribing speech...' });

    const result = await transcriber(event.data.audioData as Float32Array, {
      return_timestamps: true,
      chunk_length_s: 30,
      stride_length_s: 5,
    });

    // Log so you can see the raw Whisper output in the browser console (DevTools → Worker thread)
    console.log('[Whisper] raw result:', JSON.stringify(result, null, 2));

    self.postMessage({ type: 'result', data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown transcription error';
    self.postMessage({ type: 'error', message });
  }
};

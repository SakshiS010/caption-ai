'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;

async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) return ffmpegInstance;

  ffmpegInstance = new FFmpeg();

  // Load from public/ffmpeg/ (same origin — no CORS, no CDN dependency).
  // Multi-threaded core needs SharedArrayBuffer; the COOP+COEP headers in next.config.mjs unlock it.
  await ffmpegInstance.load({
    coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
    wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
  });

  return ffmpegInstance;
}

export async function extractAudio(
  videoFile: File,
  onProgress: (stage: string, value: number) => void
): Promise<Float32Array> {
  onProgress('Loading FFmpeg...', 5);
  const ffmpeg = await loadFFmpeg();

  onProgress('Writing video to memory...', 20);
  const ext = videoFile.name.split('.').pop() ?? 'mp4';
  const inputName = `input.${ext}`;
  await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

  onProgress('Extracting audio track...', 40);
  await ffmpeg.exec([
    '-i', inputName,
    '-vn',                   // strip video
    '-acodec', 'pcm_s16le',  // raw PCM 16-bit LE
    '-ar', '16000',          // 16 kHz — Whisper requirement
    '-ac', '1',              // mono
    'output.wav',
  ]);

  onProgress('Reading audio data...', 70);
  const wavData = (await ffmpeg.readFile('output.wav')) as Uint8Array;

  // Cleanup WASM virtual FS
  await ffmpeg.deleteFile(inputName).catch(() => {});
  await ffmpeg.deleteFile('output.wav').catch(() => {});

  onProgress('Decoding audio...', 85);

  // Decode WAV → Float32Array via AudioContext (Whisper wants normalised floats)
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  const audioBuffer = await audioCtx.decodeAudioData(wavData.buffer.slice(0) as ArrayBuffer);
  await audioCtx.close();

  onProgress('Audio ready', 100);
  return audioBuffer.getChannelData(0);
}

export async function burnCaptions(
  videoFile: File,
  srtContent: string,
  onProgress: (stage: string, value: number) => void
): Promise<Uint8Array> {
  onProgress('Loading FFmpeg...', 2);
  const ffmpeg = await loadFFmpeg();

  // Listen to FFmpeg's own encode progress (0–1) and map it to 20–95%
  const onEncode = ({ progress }: { progress: number }) => {
    onProgress('Encoding video with captions...', Math.round(20 + progress * 75));
  };
  ffmpeg.on('progress', onEncode);

  try {
    const ext = videoFile.name.split('.').pop() ?? 'mp4';
    const inputName = `input.${ext}`;

    onProgress('Writing video to memory...', 8);
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

    onProgress('Writing caption file...', 15);
    await ffmpeg.writeFile('captions.srt', srtContent);

    onProgress('Encoding video with captions...', 20);
    await ffmpeg.exec([
      '-i', inputName,
      '-vf',
      // subtitles filter burns the SRT into every frame via libass.
      // force_style overrides the default look: white text, black outline, centred at bottom.
      "subtitles=captions.srt:force_style='Fontsize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Alignment=2'",
      '-c:v', 'libx264',
      '-preset', 'ultrafast', // fastest encode, slightly larger file
      '-crf', '23',           // quality 0–51, lower = better
      '-c:a', 'copy',         // copy audio without re-encoding
      'output.mp4',
    ]);

    onProgress('Preparing download...', 97);
    const data = (await ffmpeg.readFile('output.mp4')) as Uint8Array;

    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile('captions.srt').catch(() => {});
    await ffmpeg.deleteFile('output.mp4').catch(() => {});

    onProgress('Done!', 100);
    return data;
  } finally {
    ffmpeg.off('progress', onEncode);
  }
}

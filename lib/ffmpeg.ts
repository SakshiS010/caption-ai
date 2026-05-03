'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type { CaptionSegment } from './types';
import { toSRT, deOverlapSegments } from './captionUtils';
import {
  type CaptionStyle,
  DEFAULT_STYLE,
  FONTS,
  buildForceStyle,
  applyLetterCase,
} from './captionStyle';

let ffmpegInstance: FFmpeg | null = null;
const loadedFonts = new Set<string>();

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

// Fetch the TTF for the requested family and write it to FFmpeg's VFS so libass
// can find it via fontsdir=. and FontName=. Cached per session.
async function ensureFontLoaded(ffmpeg: FFmpeg, family: string): Promise<void> {
  const font = FONTS.find((f) => f.family === family) ?? FONTS[0];
  if (loadedFonts.has(font.file)) return;
  const resp = await fetch(`/fonts/${font.file}`);
  if (!resp.ok) {
    throw new Error(
      `Could not load /fonts/${font.file} (${resp.status}). ` +
      `Make sure the TTF exists in caption-ai/public/fonts/.`
    );
  }
  const bytes = new Uint8Array(await resp.arrayBuffer());
  await ffmpeg.writeFile(font.file, bytes);
  loadedFonts.add(font.file);
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
  segments: CaptionSegment[],
  onProgress: (stage: string, value: number) => void,
  style: CaptionStyle = DEFAULT_STYLE
): Promise<Uint8Array> {
  onProgress('Loading FFmpeg...', 2);
  const ffmpeg = await loadFFmpeg();
  await ensureFontLoaded(ffmpeg, style.fontFamily);

  const ffmpegLogs: string[] = [];
  const onLog = ({ message }: { message: string }) => {
    console.log('[FFmpeg]', message);
    ffmpegLogs.push(message);
  };
  const onEncode = ({ progress }: { progress: number }) => {
    onProgress('Encoding video with captions...', Math.round(20 + progress * 75));
  };
  ffmpeg.on('log', onLog);
  ffmpeg.on('progress', onEncode);

  try {
    const ext = videoFile.name.split('.').pop() ?? 'mp4';
    const inputName = `input.${ext}`;

    onProgress('Writing video to memory...', 8);
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

    // Defensive dedupe: even if `segments` came from stale state or hand-edits
    // in the caption editor, we never want libass to render two captions at once.
    // Apply letter-casing here too so the burned captions match the live preview.
    const cleanSegments = deOverlapSegments(segments).map((s) => ({
      ...s,
      text: applyLetterCase(s.text, style.letterCase),
    }));
    console.log('[burnCaptions] segments in:', segments.length, 'after de-overlap:', cleanSegments.length);

    const srt = toSRT(cleanSegments);
    await ffmpeg.writeFile('captions.srt', new TextEncoder().encode(srt));

    onProgress('Encoding video with captions...', 20);
    const forceStyle = buildForceStyle(style);
    const vfFilter = `subtitles=captions.srt:fontsdir=.:force_style='${forceStyle}'`;
    console.log('[FFmpeg] -vf filter:', vfFilter);

    const exitCode = await ffmpeg.exec([
      '-i', inputName,
      '-vf', vfFilter,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '23',
      '-c:a', 'copy',
      'output.mp4',
    ]);

    if (exitCode !== 0) {
      const log = ffmpegLogs.slice(-20).join('\n');
      throw new Error(`FFmpeg exited with code ${exitCode}.\n\nLast logs:\n${log}`);
    }

    onProgress('Preparing download...', 97);
    const data = (await ffmpeg.readFile('output.mp4')) as Uint8Array;

    if (data.byteLength === 0) {
      throw new Error('Output file is empty — FFmpeg produced no output.');
    }

    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile('output.mp4').catch(() => {});
    await ffmpeg.deleteFile('captions.srt').catch(() => {});

    onProgress('Done!', 100);
    return data;
  } finally {
    ffmpeg.off('log', onLog);
    ffmpeg.off('progress', onEncode);
  }
}

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
  buildASSFile,
  applyLetterCase,
} from './captionStyle';

let ffmpegInstance: FFmpeg | null = null;
const loadedFonts = new Set<string>();

async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) return ffmpegInstance;

  ffmpegInstance = new FFmpeg();

  await ffmpegInstance.load({
    coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
    wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
  });

  return ffmpegInstance;
}

// Write the TTF for `family` into the WASM VFS root (/). libass receives
// fontsdir=/ so it scans / for fonts and matches by internal family name.
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
  // Write to VFS root so fontsdir=/ finds it
  await ffmpeg.writeFile(`/${font.file}`, bytes);
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
  const logs: string[] = [];
  const onLog = ({ message }: { message: string }) => logs.push(message);
  ffmpeg.on('log', onLog);

  const exitCode = await ffmpeg.exec([
    '-i', inputName,
    '-vn',
    '-acodec', 'pcm_s16le',
    '-ar', '16000',
    '-ac', '1',
    'output.wav',
  ]);

  ffmpeg.off('log', onLog);

  if (exitCode !== 0) {
    await ffmpeg.deleteFile(inputName).catch(() => {});
    const hasNoAudio = logs.some((l) =>
      l.includes('does not contain any stream') ||
      l.includes('matches no streams') ||
      l.toLowerCase().includes('no audio')
    );
    const msg = hasNoAudio
      ? 'This video has no audio track. Please use a video with spoken audio.'
      : `Audio extraction failed (exit ${exitCode}). Check the console for details.`;
    throw new Error(msg);
  }

  onProgress('Reading audio data...', 70);
  const wavData = (await ffmpeg.readFile('output.wav')) as Uint8Array;

  await ffmpeg.deleteFile(inputName).catch(() => {});
  await ffmpeg.deleteFile('output.wav').catch(() => {});

  if (wavData.byteLength < 44) {
    throw new Error('Audio extraction produced no data. The video may have no audio track.');
  }

  onProgress('Decoding audio...', 85);

  const audioCtx = new AudioContext({ sampleRate: 16000 });
  // Slice with explicit byte range — wavData may be a view into the WASM heap
  // (non-zero byteOffset), so slice(0) would hand the entire heap to the decoder.
  const audioBuffer = await audioCtx.decodeAudioData(
    wavData.buffer.slice(wavData.byteOffset, wavData.byteOffset + wavData.byteLength) as ArrayBuffer
  );
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

    const cleanSegments = deOverlapSegments(segments).map((s) => ({
      ...s,
      text: applyLetterCase(s.text, style.letterCase),
    }));
    console.log('[burnCaptions] segments in:', segments.length, 'after de-overlap:', cleanSegments.length);

    onProgress('Encoding video with captions...', 20);
    let vfFilter: string;

    if (style.animation !== 'none') {
      const ass = buildASSFile(cleanSegments, style);
      await ffmpeg.writeFile('/captions.ass', new TextEncoder().encode(ass));
      // fontsdir=/ — libass scans the VFS root where we wrote the font TTF
      vfFilter = `subtitles=/captions.ass:fontsdir=/`;
    } else {
      const srt = toSRT(cleanSegments);
      await ffmpeg.writeFile('/captions.srt', new TextEncoder().encode(srt));
      const forceStyle = buildForceStyle(style);
      // fontsdir=/ — same as above
      vfFilter = `subtitles=/captions.srt:fontsdir=/:force_style='${forceStyle}'`;
    }
    console.log('[FFmpeg] -vf filter:', vfFilter);

    // Key fixes vs old code:
    // 1. -pix_fmt yuv420p   → H.264 baseline-compatible pixel format
    // 2. -c:a aac -b:a 128k → re-encode audio to browser-safe AAC
    //                          (old `-c:a copy` broke on AC3/DTS/Opus sources)
    // 3. -movflags +faststart → move moov atom to FILE FRONT so browsers can
    //                          start playback before the full download completes
    let exitCode = await ffmpeg.exec([
      '-i', inputName,
      '-vf', vfFilter,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      'output.mp4',
    ]);

    // If AAC failed (no audio in source), retry without audio track
    if (exitCode !== 0) {
      await ffmpeg.deleteFile('output.mp4').catch(() => {});
      const noAudio = ffmpegLogs.some((l) =>
        l.includes('matches no streams') ||
        l.includes('does not contain any stream') ||
        l.includes('no audio')
      );
      if (noAudio) {
        exitCode = await ffmpeg.exec([
          '-i', inputName,
          '-vf', vfFilter,
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-crf', '23',
          '-pix_fmt', 'yuv420p',
          '-an',
          '-movflags', '+faststart',
          'output.mp4',
        ]);
      }
    }

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
    await ffmpeg.deleteFile('/captions.srt').catch(() => {});
    await ffmpeg.deleteFile('/captions.ass').catch(() => {});

    onProgress('Done!', 100);
    return data;
  } finally {
    ffmpeg.off('log', onLog);
    ffmpeg.off('progress', onEncode);
  }
}

import { CaptionSegment } from './types';

const pad2 = (n: number) => String(Math.floor(n)).padStart(2, '0');
const pad3 = (n: number) => String(Math.floor(n)).padStart(3, '0');

function toVTTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(ms)}`;
}

function toSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)},${pad3(ms)}`;
}

export function toWebVTT(segments: CaptionSegment[]): string {
  const lines = ['WEBVTT', ''];
  segments.forEach((seg, i) => {
    lines.push(String(i + 1));
    lines.push(`${toVTTTime(seg.start)} --> ${toVTTTime(seg.end)}`);
    lines.push(seg.text);
    lines.push('');
  });
  return lines.join('\n');
}

export function toSRT(segments: CaptionSegment[]): string {
  return segments
    .map(
      (seg, i) =>
        `${i + 1}\n${toSRTTime(seg.start)} --> ${toSRTTime(seg.end)}\n${seg.text}\n`
    )
    .join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

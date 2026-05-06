import { CaptionSegment } from './types';

// Lowercase, strip punctuation, collapse whitespace — used to compare two pieces
// of caption text for duplicate detection regardless of formatting differences.
export function normalizeForCompare(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
}

// Jaccard similarity on word sets. Catches near-duplicates that sliding-window
// transcription produces (same audio, slightly different word choices).
export function textSimilarity(a: string, b: string): number {
  const aWords = new Set(a.split(/\s+/).filter((w) => w.length > 2));
  const bWords = new Set(b.split(/\s+/).filter((w) => w.length > 2));
  if (aWords.size === 0 || bWords.size === 0) return 0;
  let intersection = 0;
  aWords.forEach((w) => { if (bWords.has(w)) intersection++; });
  return intersection / (aWords.size + bWords.size - intersection);
}

// Make sure no two captions are on screen at the same time. Merges sliding-window
// duplicates (similar text + overlapping time) and clamps the rest so each segment
// ends before the next begins.
export function deOverlapSegments(segments: CaptionSegment[]): CaptionSegment[] {
  if (segments.length < 2) return segments;
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const out: CaptionSegment[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const seg = { ...sorted[i] };
    const prev = out[out.length - 1];
    if (seg.start < prev.end) {
      const prevNorm = normalizeForCompare(prev.text);
      const segNorm = normalizeForCompare(seg.text);
      const similar =
        textSimilarity(prevNorm, segNorm) > 0.5 ||
        prevNorm.includes(segNorm) ||
        segNorm.includes(prevNorm);
      if (similar) {
        if (seg.text.length > prev.text.length) prev.text = seg.text;
        prev.end = Math.max(prev.end, seg.end);
        continue;
      }
      // Distinct content but overlapping — clamp prev so it ends a tick before
      // seg starts. The 0.05s gap prevents libass from flashing both for one frame.
      prev.end = Math.max(prev.start + 0.1, seg.start - 0.05);
    }
    out.push(seg);
  }
  return out;
}

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
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

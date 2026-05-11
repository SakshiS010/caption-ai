export interface WordStyle {
  color?: string;
  bold?: boolean;
  italic?: boolean;
  scale?: number;      // multiplier on the segment's base font size (e.g. 1.5 = 50% larger)
  fontFamily?: string;
}

export interface WordSpan {
  text: string;
  style?: WordStyle;
}

export interface CaptionSegment {
  id: string;
  start: number; // seconds
  end: number;   // seconds
  text: string;
  words?: WordSpan[];  // per-word style overrides; parallel to text.split(/\s+/)
}

export type AppState = 'idle' | 'extracting' | 'transcribing' | 'done' | 'error';

export interface ProgressInfo {
  stage: string;
  value: number;
}

export interface CaptionSegment {
  id: string;
  start: number; // seconds
  end: number;   // seconds
  text: string;
}

export type AppState = 'idle' | 'extracting' | 'transcribing' | 'done' | 'error';

export interface ProgressInfo {
  stage: string;
  value: number;
}

/**
 * TriviaShortScroll - Types
 * Scrolling text pattern for Japanese trivia shorts
 */

export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
  type?: 'hook' | 'intro' | 'point' | 'conclusion' | 'cta';
}

export interface TriviaShortScrollProps {
  audioSrc: string;
  backgroundType: 'video' | 'image';
  backgroundSrc: string;
  topic: string;
  subtitles: SubtitleSegment[];
  primaryColor?: string;
  accentColor?: string;
}

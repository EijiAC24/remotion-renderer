/**
 * TriviaShort - Japanese trivia shorts composition types
 * For AutomateShorts project
 */

export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
  type?: 'hook' | 'intro' | 'point' | 'conclusion' | 'cta';
}

export interface TriviaShortProps {
  // Audio
  audioSrc: string;

  // Background
  backgroundType: 'video' | 'image';
  backgroundSrc: string;

  // Content
  topic: string;
  hook: string;
  subtitles: SubtitleSegment[];

  // Styling
  primaryColor?: string;
  accentColor?: string;

  // CTA
  cta?: string;
}

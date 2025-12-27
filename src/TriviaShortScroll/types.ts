/**
 * TriviaShortScroll - Types
 * Simple scrolling text pattern (no timestamps)
 */

export interface TriviaShortScrollProps {
  audioSrc: string;
  backgroundType: 'video' | 'image';
  backgroundSrc: string;
  title: string;
  script: string; // Full script text (newline separated)
  primaryColor?: string;
  topic?: string; // Category badge text (default: "雑学")
  cta?: string;   // Call to action text (default: "フォローで毎日お届け")
}

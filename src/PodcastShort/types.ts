export interface SubtitleData {
  start: number;
  end: number;
  text: string;
  translation: string | null;
  isJapanese: boolean;
}

export interface PodcastShortProps {
  audioSrc: string;
  coverSrc: string;
  backgroundSrc?: string; // AI generated background image
  titleEn: string;
  titleJp: string;
  subtitles: SubtitleData[];
}

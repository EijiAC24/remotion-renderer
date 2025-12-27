/**
 * Trivia2 - Types
 * トリビアの泉スタイル - 一語ずつ表示
 */

/** 単語レベルのタイムスタンプ (Whisperから取得) */
export interface WordTimestamp {
  word: string;
  start: number; // seconds
  end: number;   // seconds
}

export interface Trivia2Props {
  /** メイン音声（ナレーション） */
  audioSrc: string;
  /** 効果音（カーン） - optional */
  sfxSrc?: string;
  /** 背景タイプ */
  backgroundType: 'video' | 'image';
  /** 背景ソース */
  backgroundSrc: string;
  /** 単語ごとのタイムスタンプ */
  words: WordTimestamp[];
  /** 効果音の長さ（秒）- ナレーション開始のオフセット */
  sfxDuration?: number;
  /** 効果音の音量 (0-1) */
  sfxVolume?: number;
  /** ナレーションの音量 (0-1) */
  audioVolume?: number;
  /** CTA テキスト */
  cta?: string;
}

/**
 * Trivia2 - トリビアの泉スタイル
 * 一語ずつテロップ表示、男性低音ナレーション
 */

import {
  AbsoluteFill,
  Audio,
  Img,
  Video,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from "remotion";
import { loadFont as loadMincho } from "@remotion/google-fonts/NotoSerifJP";
import { loadDefaultJapaneseParser } from "budoux";
import { Trivia2Props, WordTimestamp } from "./types";

const { fontFamily: minchoFont } = loadMincho();
const budoux = loadDefaultJapaneseParser();

// ============================================
// THEME - トリビアの泉カラー (実際の番組に忠実)
// ============================================
const theme = {
  // ヘッダー (明日使えるムダ知識をあなたに)
  headerYellow: '#FFE135',
  headerShadow: '#CC0000',
  // メインテロップ - ピンク〜赤のグラデーション
  textGradientTop: '#FF8899',    // ピンク
  textGradientBottom: '#CC0033', // 濃い赤
  textOutline: '#FFFFFF',
  textShadow: 'rgba(0, 0, 0, 0.9)',
  // CTA
  ctaColor: '#FFE135',
};

// ============================================
// LAYOUT
// ============================================
const layout = {
  canvas: { width: 1080, height: 1920 },
  safe: {
    top: 150,
    bottom: 400,
    left: 60,
    right: 100,
  },
};

// ============================================
// BACKGROUND
// ============================================
const Background: React.FC<{
  type: 'video' | 'image';
  src: string;
}> = ({ type, src }) => {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {type === 'video' ? (
        <Video
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          muted
          loop
        />
      ) : (
        <Img
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.3)",
        }}
      />
    </div>
  );
};

// ============================================
// HEADER - 「明日使えるムダ知識をあなたに」
// ============================================
const Header: React.FC<{
  frame: number;
  fps: number;
}> = ({ frame, fps }) => {
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: layout.safe.top + 30,
        left: layout.safe.left,
        opacity: enterProgress,
        transform: `translateY(${interpolate(enterProgress, [0, 1], [-20, 0])}px)`,
      }}
    >
      <div
        style={{
          fontSize: 36,
          fontWeight: 900,
          color: theme.headerYellow,
          textShadow: `
            2px 2px 0 ${theme.headerShadow},
            -1px -1px 0 ${theme.headerShadow},
            1px -1px 0 ${theme.headerShadow},
            -1px 1px 0 ${theme.headerShadow},
            3px 3px 6px rgba(0,0,0,0.8)
          `,
          letterSpacing: 2,
        }}
      >
        明日使えるムダ知識をあなたに
      </div>
    </div>
  );
};

// ============================================
// WORD DISPLAY - カラオケ式（トリビアの泉スタイル）
// ============================================
const WordDisplay: React.FC<{
  words: WordTimestamp[];
  currentTime: number;
  frame: number;
  fps: number;
}> = ({ words, currentTime }) => {
  // 全文字を最初から配置（カラオケ方式）
  const fullText = words.map((w) => w.word).join('');
  if (!fullText) return null;

  // BudouXで自然な改行位置を取得
  const formatWithBudouX = (text: string, maxChars: number = 8): string => {
    if (text.length <= maxChars) return text;

    const chunks = budoux.parse(text);
    const lines: string[] = [];
    let currentLine = '';

    for (const chunk of chunks) {
      if ((currentLine + chunk).length > maxChars && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = chunk;
      } else {
        currentLine += chunk;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines.join('\n');
  };

  const formattedText = formatWithBudouX(fullText);
  const lines = formattedText.split('\n');

  // 各文字のタイミングを計算（音声に合わせる）
  const charTimings: { start: number; end: number }[] = [];
  for (const w of words) {
    const charDuration = (w.end - w.start) / w.word.length;
    for (let i = 0; i < w.word.length; i++) {
      charTimings.push({
        start: w.start + i * charDuration,
        end: w.start + (i + 1) * charDuration,
      });
    }
  }

  // 現在何文字目まで表示されているか計算
  let revealedChars = 0;
  let partialProgress = 0;
  for (let i = 0; i < charTimings.length; i++) {
    const timing = charTimings[i];
    if (currentTime >= timing.end) {
      revealedChars = i + 1;
      partialProgress = 0;
    } else if (currentTime >= timing.start) {
      revealedChars = i;
      partialProgress = (currentTime - timing.start) / (timing.end - timing.start);
      break;
    } else {
      break;
    }
  }

  // 各行の進捗率を計算
  const getLineProgress = (lineIndex: number): number => {
    let charsBefore = 0;
    for (let i = 0; i < lineIndex; i++) {
      charsBefore += lines[i].length;
    }
    const lineLength = lines[lineIndex].length;
    const charsInLine = revealedChars - charsBefore;

    if (charsInLine <= 0) return 0;
    if (charsInLine >= lineLength) return 1;

    // この行の途中
    const lineProgress = (charsInLine + partialProgress) / lineLength;
    return Math.min(1, Math.max(0, lineProgress));
  };

  // White outline using multiple text-shadows (thicker)
  const whiteOutline = `
    -4px -4px 0 #FFF, 4px -4px 0 #FFF, -4px 4px 0 #FFF, 4px 4px 0 #FFF,
    -4px 0px 0 #FFF, 4px 0px 0 #FFF, 0px -4px 0 #FFF, 0px 4px 0 #FFF,
    -3px -3px 0 #FFF, 3px -3px 0 #FFF, -3px 3px 0 #FFF, 3px 3px 0 #FFF,
    -2px -2px 0 #FFF, 2px -2px 0 #FFF, -2px 2px 0 #FFF, 2px 2px 0 #FFF
  `;

  const textStyle = {
    fontSize: 90,
    fontWeight: 900,
    fontFamily: minchoFont,
    fontStyle: "italic" as const,
    textAlign: "center" as const,
    lineHeight: 1.4,
  };

  // 各行をレンダリング
  const renderLines = (type: 'shadow' | 'outline' | 'gradient') => {
    return lines.map((line, lineIndex) => {
      const progress = getLineProgress(lineIndex);
      const clipPath = `inset(0 ${(1 - progress) * 100}% 0 0)`;

      let style: React.CSSProperties = {};

      if (type === 'shadow') {
        style = { color: "#000", clipPath, WebkitClipPath: clipPath };
      } else if (type === 'outline') {
        style = { color: "#FFF", textShadow: whiteOutline, clipPath, WebkitClipPath: clipPath };
      } else {
        style = {
          background: "linear-gradient(180deg, #FFaaaa 0%, #CC0033 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          clipPath,
          WebkitClipPath: clipPath,
        };
      }

      return (
        <div key={`${type}-${lineIndex}`} style={style}>
          {line}
        </div>
      );
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "30%",
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* アクティブ状態：Black shadow layer */}
      <div
        style={{
          ...textStyle,
          position: "absolute",
          transform: "translate(6px, 6px) skewX(-6deg)",
        }}
      >
        {renderLines('shadow')}
      </div>
      {/* アクティブ状態：White outline layer */}
      <div
        style={{
          ...textStyle,
          position: "absolute",
          transform: "skewX(-6deg)",
        }}
      >
        {renderLines('outline')}
      </div>
      {/* アクティブ状態：Gradient text on top */}
      <div
        style={{
          ...textStyle,
          position: "relative",
          transform: "skewX(-6deg)",
        }}
      >
        {renderLines('gradient')}
      </div>
    </div>
  );
};

// ============================================
// CTA
// ============================================
const CTA: React.FC<{
  text: string;
  frame: number;
  fps: number;
  lastWordEnd: number; // 最後の単語の終了時間（秒）
  sfxDuration: number;
}> = ({ text, frame, fps, lastWordEnd, sfxDuration }) => {
  // 最後の単語が終わってから0.5秒後にCTA表示
  const ctaStartFrame = Math.ceil((lastWordEnd + sfxDuration + 0.5) * fps);

  if (frame < ctaStartFrame) return null;

  const enterProgress = spring({
    frame: frame - ctaStartFrame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Pulse
  const pulse = Math.sin((frame / fps) * Math.PI * 3) * 0.03 + 1;

  return (
    <div
      style={{
        position: "absolute",
        bottom: layout.safe.bottom + 30,
        left: layout.safe.left,
        right: layout.safe.right,
        display: "flex",
        justifyContent: "center",
        opacity: enterProgress,
        transform: `translateY(${interpolate(enterProgress, [0, 1], [30, 0])}px) scale(${pulse})`,
      }}
    >
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: theme.ctaColor,
          textShadow: `
            2px 2px 0 ${theme.headerShadow},
            0 0 20px rgba(255, 225, 53, 0.5)
          `,
          padding: "16px 32px",
          background: "rgba(0, 0, 0, 0.6)",
          borderRadius: 12,
          border: `2px solid ${theme.ctaColor}`,
        }}
      >
        👆 {text}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const Trivia2: React.FC<Trivia2Props> = ({
  audioSrc,
  sfxSrc,
  backgroundType,
  backgroundSrc,
  words,
  sfxDuration = 1.0,
  sfxVolume = 0.7,
  audioVolume = 1.0,
  cta = "フォローで毎日お届け",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Current time in seconds (accounting for SFX offset)
  const currentTime = frame / fps - sfxDuration;

  return (
    <AbsoluteFill style={{ fontFamily: minchoFont, background: "#000" }}>
      {/* Background */}
      <Background type={backgroundType} src={backgroundSrc} />

      {/* Sound Effect (カーン) */}
      {sfxSrc && (
        <Sequence from={0} durationInFrames={Math.ceil(sfxDuration * fps) + 30}>
          <Audio src={sfxSrc} volume={sfxVolume} />
        </Sequence>
      )}

      {/* Main Narration Audio */}
      <Sequence from={Math.ceil(sfxDuration * fps)}>
        <Audio src={audioSrc} volume={audioVolume} />
      </Sequence>

      {/* Header */}
      <Header frame={frame} fps={fps} />

      {/* Word-by-word subtitles */}
      {currentTime >= 0 && (
        <WordDisplay
          words={words}
          currentTime={currentTime}
          frame={frame}
          fps={fps}
        />
      )}

      {/* CTA */}
      <CTA
        text={cta}
        frame={frame}
        fps={fps}
        lastWordEnd={words.length > 0 ? words[words.length - 1].end : 0}
        sfxDuration={sfxDuration}
      />
    </AbsoluteFill>
  );
};

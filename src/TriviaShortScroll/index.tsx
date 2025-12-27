/**
 * TriviaShortScroll - Scrolling text pattern
 * Design: Full script scrolls from bottom to top
 *
 * Features:
 * - Full script visible as continuous flow
 * - Current line highlighted and enlarged
 * - Smooth scroll synchronized with audio
 * - Keyword/number highlighting
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
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansJP";
import { TriviaShortScrollProps, SubtitleSegment } from "./types";

const { fontFamily } = loadFont();

// ============================================
// LAYOUT & DESIGN TOKENS
// ============================================
const layout = {
  canvas: { width: 1080, height: 1920 },
  safe: {
    top: 200,
    bottom: 400,
    left: 60,
    right: 100,
  },
  get contentWidth() { return this.canvas.width - this.safe.left - this.safe.right; },
  get contentHeight() { return this.canvas.height - this.safe.top - this.safe.bottom; },
};

const theme = {
  gold: '#FFD700',
  goldGlow: 'rgba(255, 215, 0, 0.6)',
  coral: '#FF6B6B',
  bg: '#0a0a0f',
  glass: 'rgba(10, 10, 20, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.04)',
  white: '#ffffff',
  textPrimary: 'rgba(255, 255, 255, 0.95)',
  textSecondary: 'rgba(255, 255, 255, 0.5)',
  textMuted: 'rgba(255, 255, 255, 0.25)',
  darkGradient: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.95) 100%)',
};

// ============================================
// BACKGROUND
// ============================================
const CinematicBackground: React.FC<{
  type: 'video' | 'image';
  src: string;
  frame: number;
  fps: number;
}> = ({ type, src, frame, fps }) => {
  const totalFrames = fps * 60;
  const scale = interpolate(frame, [0, totalFrames], [1.0, 1.12], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "120%",
          height: "120%",
          transform: `scale(${scale})`,
        }}
      >
        {type === 'video' ? (
          <Video src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted loop />
        ) : (
          <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>
      <div style={{ position: "absolute", inset: 0, background: theme.darkGradient }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)",
      }} />
    </div>
  );
};

// ============================================
// TOPIC BADGE
// ============================================
const TopicBadge: React.FC<{
  topic: string;
  frame: number;
  fps: number;
}> = ({ topic, frame, fps }) => {
  const enterAnim = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 120 } });

  return (
    <div
      style={{
        position: "absolute",
        top: layout.safe.top + 30,
        left: layout.safe.left,
        right: layout.safe.right,
        display: "flex",
        justifyContent: "center",
        opacity: enterAnim,
        transform: `translateY(${interpolate(enterAnim, [0, 1], [-20, 0])}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: theme.glass,
          borderRadius: 100,
          padding: "10px 24px",
          border: `1px solid ${theme.glassBorder}`,
          boxShadow: `0 4px 24px rgba(0, 0, 0, 0.4)`,
        }}
      >
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: `linear-gradient(135deg, ${theme.gold} 0%, #FFA500 100%)`,
          boxShadow: `0 0 12px ${theme.goldGlow}`,
        }} />
        <span style={{
          fontSize: 22, fontWeight: 600, color: theme.textSecondary,
          letterSpacing: 3, textTransform: "uppercase",
        }}>
          {topic}
        </span>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: `linear-gradient(135deg, ${theme.gold} 0%, #FFA500 100%)`,
          boxShadow: `0 0 12px ${theme.goldGlow}`,
        }} />
      </div>
    </div>
  );
};

// ============================================
// PARSED TEXT - Keyword & Number Highlighting
// ============================================
const ParsedText: React.FC<{
  text: string;
  primaryColor: string;
  isActive: boolean;
}> = ({ text, primaryColor, isActive }) => {
  const regex = /(\*\*[^*]+\*\*)|(\d+[%％倍個人年日秒分時万億円]?)/g;
  const parts: Array<{ type: 'text' | 'keyword' | 'number'; content: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    if (match[1]) {
      parts.push({ type: 'keyword', content: match[1].slice(2, -2) });
    } else if (match[2]) {
      parts.push({ type: 'number', content: match[2] });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return (
    <span>
      {parts.map((part, i) => {
        if (part.type === 'keyword') {
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                background: isActive ? primaryColor : 'rgba(255, 215, 0, 0.3)',
                color: isActive ? theme.bg : theme.white,
                padding: "2px 10px",
                borderRadius: 6,
                marginLeft: 4,
                marginRight: 4,
                fontWeight: 800,
                boxShadow: isActive ? `0 4px 16px ${primaryColor}50` : 'none',
              }}
            >
              {part.content}
            </span>
          );
        }
        if (part.type === 'number') {
          return (
            <span
              key={i}
              style={{
                fontSize: "1.2em",
                fontWeight: 900,
                color: isActive ? theme.gold : 'rgba(255, 215, 0, 0.6)',
                textShadow: isActive ? `0 0 20px ${theme.goldGlow}` : 'none',
              }}
            >
              {part.content}
            </span>
          );
        }
        return <span key={i}>{part.content}</span>;
      })}
    </span>
  );
};

// ============================================
// SCROLLING TEXT CONTAINER
// ============================================
const ScrollingText: React.FC<{
  subtitles: SubtitleSegment[];
  currentTime: number;
  frame: number;
  fps: number;
  primaryColor: string;
}> = ({ subtitles, currentTime, frame, fps, primaryColor }) => {
  // Find current active subtitle index
  const activeIndex = subtitles.findIndex(
    (s) => currentTime >= s.start && currentTime < s.end
  );

  // Calculate line height for positioning
  const lineHeight = 120; // px per line
  const centerY = layout.contentHeight / 2;

  // Calculate scroll position to center current line
  let scrollY = 0;
  if (activeIndex >= 0) {
    // Interpolate within the current subtitle for smooth scrolling
    const subtitle = subtitles[activeIndex];
    const progress = (currentTime - subtitle.start) / (subtitle.end - subtitle.start);
    scrollY = (activeIndex + progress * 0.5) * lineHeight;
  } else if (currentTime > 0) {
    // After all subtitles, keep at last position
    scrollY = subtitles.length * lineHeight;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: layout.safe.top + 100,
        bottom: layout.safe.bottom + 150,
        left: layout.safe.left,
        right: layout.safe.right,
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* Fade masks */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 200,
        background: "linear-gradient(180deg, rgba(10,10,15,1) 0%, transparent 100%)",
        zIndex: 10,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 250,
        background: "linear-gradient(0deg, rgba(10,10,15,1) 0%, transparent 100%)",
        zIndex: 10,
        pointerEvents: "none",
      }} />

      {/* Scrolling content */}
      <div
        style={{
          position: "relative",
          width: "100%",
          transform: `translateY(${centerY - scrollY}px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        {subtitles.map((subtitle, index) => {
          const isActive = currentTime >= subtitle.start && currentTime < subtitle.end;
          const isPast = currentTime >= subtitle.end;
          const isFuture = currentTime < subtitle.start;

          // Calculate opacity based on distance from active
          let opacity = 0.3;
          let scale = 0.85;
          let blur = 2;

          if (isActive) {
            opacity = 1;
            scale = 1;
            blur = 0;
          } else if (isPast) {
            const timeSinceEnd = currentTime - subtitle.end;
            opacity = interpolate(timeSinceEnd, [0, 2], [0.5, 0.15], { extrapolateRight: "clamp" });
            scale = 0.9;
            blur = 1;
          } else if (isFuture) {
            const timeUntilStart = subtitle.start - currentTime;
            opacity = interpolate(timeUntilStart, [0, 3], [0.6, 0.25], { extrapolateRight: "clamp" });
            scale = 0.9;
            blur = 1;
          }

          // Special styling for different segment types
          const isHook = subtitle.type === 'hook';
          const isCta = subtitle.type === 'cta';

          return (
            <div
              key={index}
              style={{
                padding: "16px 20px",
                marginBottom: 20,
                opacity,
                transform: `scale(${scale})`,
                filter: `blur(${blur}px)`,
                transition: "all 0.25s ease-out",
                textAlign: "center",
              }}
            >
              {/* Active indicator line */}
              {isActive && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  width: 4,
                  height: 60,
                  transform: "translateY(-50%)",
                  background: `linear-gradient(180deg, transparent, ${primaryColor}, transparent)`,
                  borderRadius: 2,
                  boxShadow: `0 0 20px ${primaryColor}80`,
                }} />
              )}

              {/* Text content */}
              <div
                style={{
                  fontSize: isActive ? 52 : 44,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? theme.white : theme.textSecondary,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  textShadow: isActive
                    ? `0 4px 20px rgba(0,0,0,0.8), 0 0 40px ${primaryColor}30`
                    : "0 2px 10px rgba(0,0,0,0.5)",
                  transition: "all 0.25s ease-out",
                }}
              >
                <ParsedText
                  text={subtitle.text}
                  primaryColor={primaryColor}
                  isActive={isActive}
                />
              </div>

              {/* Hook badge */}
              {isHook && isActive && (
                <div style={{
                  display: "inline-block",
                  marginTop: 12,
                  padding: "6px 20px",
                  background: primaryColor,
                  borderRadius: 100,
                  fontSize: 18,
                  fontWeight: 700,
                  color: theme.bg,
                  letterSpacing: 2,
                }}>
                  HOOK
                </div>
              )}

              {/* CTA pulse effect */}
              {isCta && isActive && (
                <div style={{
                  position: "absolute",
                  inset: -20,
                  background: `radial-gradient(ellipse at center, ${theme.coral}20 0%, transparent 70%)`,
                  borderRadius: 20,
                  animation: "ctaPulse 1s ease-in-out infinite",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// PROGRESS BAR
// ============================================
const ProgressBar: React.FC<{
  frame: number;
  durationInFrames: number;
}> = ({ frame, durationInFrames }) => {
  const progress = frame / durationInFrames;

  return (
    <div
      style={{
        position: "absolute",
        bottom: layout.safe.bottom + 30,
        left: layout.safe.left + 40,
        right: layout.safe.right + 40,
        height: 4,
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${theme.gold}, #FFA500)`,
          boxShadow: `0 0 10px ${theme.goldGlow}`,
          borderRadius: 2,
        }}
      />
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const TriviaShortScroll: React.FC<TriviaShortScrollProps> = ({
  audioSrc,
  backgroundType,
  backgroundSrc,
  topic,
  subtitles,
  primaryColor = theme.gold,
  accentColor = theme.coral,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  return (
    <AbsoluteFill style={{ fontFamily, background: theme.bg }}>
      {/* Background */}
      <CinematicBackground
        type={backgroundType}
        src={backgroundSrc}
        frame={frame}
        fps={fps}
      />

      {/* Audio */}
      <Audio src={audioSrc} />

      {/* Topic Badge */}
      <TopicBadge topic={topic} frame={frame} fps={fps} />

      {/* Scrolling Text */}
      <ScrollingText
        subtitles={subtitles}
        currentTime={currentTime}
        frame={frame}
        fps={fps}
        primaryColor={primaryColor}
      />

      {/* Progress Bar */}
      <ProgressBar frame={frame} durationInFrames={durationInFrames} />

      {/* CSS Animations */}
      <style>
        {`
          @keyframes ctaPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.05); }
          }
        `}
      </style>
    </AbsoluteFill>
  );
};

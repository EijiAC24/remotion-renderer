/**
 * TriviaShort - Japanese trivia shorts composition
 * Design: "Electric Editorial" - Magazine meets neon broadcasting
 *
 * Bold, attention-grabbing design optimized for scroll-stopping impact
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
import { TriviaShortProps, SubtitleSegment } from "./types";

const { fontFamily } = loadFont();

// ============================================
// SAFE ZONES & LAYOUT
// Based on TikTok/Shorts/Reels UI analysis
// ============================================
const layout = {
  canvas: { width: 1080, height: 1920 },
  safe: {
    top: 200,      // Platform UI area
    bottom: 400,   // Caption/comments area
    left: 60,
    right: 100,    // Buttons area
  },
  get contentWidth() { return this.canvas.width - this.safe.left - this.safe.right; },
  get contentHeight() { return this.canvas.height - this.safe.top - this.safe.bottom; },
  get centerX() { return (this.canvas.width - this.safe.right) / 2; },
};

// ============================================
// DESIGN TOKENS - Electric Editorial Theme
// ============================================
const theme = {
  // Core palette
  gold: '#FFD700',
  goldGlow: 'rgba(255, 215, 0, 0.6)',
  goldSubtle: 'rgba(255, 215, 0, 0.15)',
  coral: '#FF6B6B',
  coralGlow: 'rgba(255, 107, 107, 0.6)',

  // Background & glass
  bg: '#0a0a0f',
  glass: 'rgba(10, 10, 20, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.04)',

  // Text hierarchy
  white: '#ffffff',
  textPrimary: 'rgba(255, 255, 255, 0.95)',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textMuted: 'rgba(255, 255, 255, 0.35)',

  // Gradients
  goldGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  coralGradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
  darkGradient: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.9) 100%)',
};

// ============================================
// BACKGROUND - Ken Burns with Cinematic Overlay
// ============================================
const CinematicBackground: React.FC<{
  type: 'video' | 'image';
  src: string;
  frame: number;
  fps: number;
}> = ({ type, src, frame, fps }) => {
  const totalFrames = fps * 60;

  // Slow, subtle Ken Burns effect
  const scale = interpolate(frame, [0, totalFrames], [1.0, 1.15], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  const translateX = interpolate(frame, [0, totalFrames], [0, -3], { extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [0, totalFrames], [0, -2], { extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Background media with Ken Burns */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "120%",
          height: "120%",
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
          willChange: "transform",
        }}
      >
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
      </div>

      {/* Cinematic color grading overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: theme.darkGradient,
        }}
      />

      {/* Subtle warm tint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 30%, rgba(255, 200, 100, 0.08) 0%, transparent 60%)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Film grain texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
};

// ============================================
// TOPIC BADGE - Category Indicator
// ============================================
const TopicBadge: React.FC<{
  topic: string;
  frame: number;
  fps: number;
}> = ({ topic, frame, fps }) => {
  const enterAnim = spring({
    frame: frame - 5,
    fps,
    config: { damping: 20, stiffness: 120 }
  });

  // Subtle floating animation
  const floatY = Math.sin(frame / 30) * 3;

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
        transform: `translateY(${interpolate(enterAnim, [0, 1], [-20, 0]) + floatY}px)`,
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
          boxShadow: `0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 ${theme.glassHighlight}`,
        }}
      >
        {/* Animated dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: theme.goldGradient,
            boxShadow: `0 0 12px ${theme.goldGlow}, 0 0 24px ${theme.goldGlow}`,
            animation: "pulse 2s ease-in-out infinite",
          }}
        />

        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: theme.textSecondary,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {topic}
        </span>

        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: theme.goldGradient,
            boxShadow: `0 0 12px ${theme.goldGlow}, 0 0 24px ${theme.goldGlow}`,
          }}
        />
      </div>
    </div>
  );
};

// ============================================
// HOOK DISPLAY - Attention Grabbing (First 3 seconds)
// ============================================
const HookDisplay: React.FC<{
  hook: string;
  frame: number;
  fps: number;
  primaryColor: string;
}> = ({ hook, frame, fps, primaryColor }) => {
  const hookDuration = fps * 3.5; // Show for 3.5 seconds
  const isVisible = frame < hookDuration;

  if (!isVisible) return null;

  // Dramatic entrance
  const scaleIn = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150 }
  });

  // Slight rotation for energy
  const rotation = interpolate(
    spring({ frame, fps, config: { damping: 15, stiffness: 100 } }),
    [0, 1],
    [-2, 0]
  );

  // Glow pulse
  const glowIntensity = interpolate(
    Math.sin(frame / 8),
    [-1, 1],
    [0.6, 1]
  );

  // Exit animation
  const exitProgress = interpolate(frame, [hookDuration - fps * 0.5, hookDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.9]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: layout.safe.top + 150,
        left: layout.safe.left,
        right: layout.safe.right,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: scaleIn * exitOpacity,
        transform: `scale(${scaleIn * exitScale}) rotate(${rotation}deg)`,
      }}
    >
      {/* Glow backdrop */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at center, ${primaryColor}30 0%, transparent 70%)`,
          filter: `blur(40px)`,
          opacity: glowIntensity,
          transform: "scale(1.5)",
        }}
      />

      {/* Hook card */}
      <div
        style={{
          position: "relative",
          background: theme.goldGradient,
          padding: "28px 48px",
          borderRadius: 20,
          maxWidth: layout.contentWidth - 60,
          boxShadow: `
            0 0 0 2px rgba(255, 255, 255, 0.2),
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 60px ${primaryColor}${Math.round(glowIntensity * 80).toString(16).padStart(2, '0')}
          `,
          transform: `translateY(${Math.sin(frame / 15) * 4}px)`,
        }}
      >
        {/* Shine effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)",
            borderRadius: "20px 20px 0 0",
          }}
        />

        <div
          style={{
            position: "relative",
            fontSize: 56,
            fontWeight: 900,
            color: theme.bg,
            textAlign: "center",
            lineHeight: 1.25,
            textShadow: "0 2px 0 rgba(255, 255, 255, 0.2)",
            letterSpacing: -1,
          }}
        >
          {hook}
        </div>
      </div>
    </div>
  );
};

// ============================================
// TEXT PARSER - Keyword & Number Highlighting
// ============================================
const ParsedText: React.FC<{
  text: string;
  primaryColor: string;
  frame: number;
  fps: number;
}> = ({ text, primaryColor, frame, fps }) => {
  // Parse **keywords** and numbers
  const parts: Array<{ type: 'text' | 'keyword' | 'number'; content: string }> = [];
  let remaining = text;

  // Match **keywords** and standalone numbers
  const regex = /(\*\*[^*]+\*\*)|(\d+[%％倍個人年日秒分時万億円]?)/g;
  let lastIndex = 0;
  let match;

  const tempParts: Array<{ type: 'text' | 'keyword' | 'number'; content: string; index: number }> = [];

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tempParts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
        index: lastIndex
      });
    }

    if (match[1]) {
      // Keyword (remove **)
      tempParts.push({
        type: 'keyword',
        content: match[1].slice(2, -2),
        index: match.index
      });
    } else if (match[2]) {
      // Number
      tempParts.push({
        type: 'number',
        content: match[2],
        index: match.index
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tempParts.push({
      type: 'text',
      content: text.slice(lastIndex),
      index: lastIndex
    });
  }

  return (
    <span style={{ display: "inline" }}>
      {tempParts.map((part, i) => {
        if (part.type === 'keyword') {
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                background: primaryColor,
                color: theme.bg,
                padding: "4px 16px",
                borderRadius: 8,
                marginLeft: 6,
                marginRight: 6,
                fontWeight: 800,
                boxShadow: `0 4px 16px ${primaryColor}50`,
                transform: `scale(${1 + Math.sin(frame / 20) * 0.02})`,
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
                display: "inline-block",
                fontSize: "1.3em",
                fontWeight: 900,
                color: theme.gold,
                textShadow: `0 0 20px ${theme.goldGlow}`,
                marginLeft: 2,
                marginRight: 2,
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
// SUBTITLE DISPLAY - Glass Morphism Style
// ============================================
const SubtitleDisplay: React.FC<{
  subtitle: SubtitleSegment;
  currentTime: number;
  frame: number;
  fps: number;
  primaryColor: string;
  accentColor: string;
}> = ({ subtitle, currentTime, frame, fps, primaryColor, accentColor }) => {
  const isVisible = currentTime >= subtitle.start && currentTime < subtitle.end;
  if (!isVisible) return null;

  const localFrame = (currentTime - subtitle.start) * fps;

  // Smooth entrance
  const enterAnim = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 140 }
  });

  // Smooth exit
  const exitTime = subtitle.end - currentTime;
  const exitOpacity = interpolate(exitTime, [0, 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = Math.min(enterAnim, exitOpacity);
  const translateY = interpolate(enterAnim, [0, 1], [40, 0]);

  // Style variations based on segment type
  const isHook = subtitle.type === 'hook';
  const isCta = subtitle.type === 'cta';
  const isPoint = subtitle.type === 'point';

  // Accent line color
  const accentLineColor = isHook ? primaryColor : isCta ? accentColor : theme.gold;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "relative",
          background: theme.glass,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 20,
          padding: "24px 36px",
          maxWidth: layout.contentWidth,
          minWidth: 600,
          border: `1px solid ${theme.glassBorder}`,
          boxShadow: `
            0 8px 40px rgba(0, 0, 0, 0.5),
            0 0 0 1px ${theme.glassHighlight},
            inset 0 1px 0 ${theme.glassHighlight}
          `,
        }}
      >
        {/* Top accent line with glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 30,
            right: 30,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${accentLineColor}, transparent)`,
            borderRadius: 2,
            boxShadow: `0 0 20px ${accentLineColor}80`,
          }}
        />

        {/* Corner accents */}
        <div style={{
          position: "absolute",
          top: 12,
          left: 12,
          width: 24,
          height: 24,
          borderLeft: `2px solid ${accentLineColor}40`,
          borderTop: `2px solid ${accentLineColor}40`,
          borderRadius: "4px 0 0 0",
        }} />
        <div style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 24,
          height: 24,
          borderRight: `2px solid ${accentLineColor}40`,
          borderTop: `2px solid ${accentLineColor}40`,
          borderRadius: "0 4px 0 0",
        }} />

        {/* Text content */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: theme.white,
            textAlign: "center",
            lineHeight: 1.45,
            whiteSpace: "pre-wrap",
            wordBreak: "keep-all",
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            letterSpacing: 0.5,
          }}
        >
          <ParsedText
            text={subtitle.text}
            primaryColor={primaryColor}
            frame={frame}
            fps={fps}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================
// CTA DISPLAY - Pulsing Call to Action
// ============================================
const CTADisplay: React.FC<{
  cta: string;
  frame: number;
  fps: number;
  totalDuration: number;
  accentColor: string;
}> = ({ cta, frame, fps, totalDuration, accentColor }) => {
  const ctaStartTime = totalDuration - 4; // Last 4 seconds
  const currentTime = frame / fps;

  if (currentTime < ctaStartTime) return null;

  const localFrame = (currentTime - ctaStartTime) * fps;

  // Bounce entrance
  const enterAnim = spring({
    frame: localFrame,
    fps,
    config: { damping: 10, stiffness: 120 }
  });

  // Continuous pulse
  const pulse = 1 + Math.sin(frame / 6) * 0.04;

  // Glow intensity
  const glowPulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.4, 1]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: layout.safe.bottom + 80,
        left: layout.safe.left,
        right: layout.safe.right,
        display: "flex",
        justifyContent: "center",
        opacity: enterAnim,
        transform: `scale(${enterAnim * pulse}) translateY(${interpolate(enterAnim, [0, 1], [50, 0])}px)`,
      }}
    >
      {/* Glow backdrop */}
      <div
        style={{
          position: "absolute",
          width: "80%",
          height: "150%",
          background: `radial-gradient(ellipse at center, ${accentColor}40 0%, transparent 70%)`,
          filter: "blur(30px)",
          opacity: glowPulse,
        }}
      />

      <div
        style={{
          position: "relative",
          background: theme.coralGradient,
          padding: "22px 52px",
          borderRadius: 100,
          boxShadow: `
            0 0 0 3px rgba(255, 255, 255, 0.15),
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 50px ${accentColor}${Math.round(glowPulse * 100).toString(16).padStart(2, '0')}
          `,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Shine overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
            borderRadius: "100px 100px 0 0",
          }}
        />

        <span
          style={{
            position: "relative",
            fontSize: 38,
            fontWeight: 800,
            color: theme.bg,
            textShadow: "0 1px 0 rgba(255, 255, 255, 0.3)",
            letterSpacing: 0.5,
          }}
        >
          {cta}
        </span>

        {/* Animated finger icon */}
        <span
          style={{
            position: "relative",
            fontSize: 32,
            transform: `translateY(${Math.sin(frame / 8) * 6}px)`,
          }}
        >
          👆
        </span>
      </div>
    </div>
  );
};

// ============================================
// PROGRESS INDICATOR
// ============================================
const ProgressIndicator: React.FC<{
  frame: number;
  fps: number;
  durationInFrames: number;
}> = ({ frame, fps, durationInFrames }) => {
  const progress = frame / durationInFrames;

  return (
    <div
      style={{
        position: "absolute",
        bottom: layout.safe.bottom + 20,
        left: layout.safe.left + 20,
        right: layout.safe.right + 20,
        height: 3,
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: theme.goldGradient,
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
export const TriviaShort: React.FC<TriviaShortProps> = ({
  audioSrc,
  backgroundType,
  backgroundSrc,
  topic,
  hook,
  subtitles,
  primaryColor = theme.gold,
  accentColor = theme.coral,
  cta = "フォローして続きを見てね",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;
  const totalDuration = durationInFrames / fps;

  // Find active subtitle (excluding hook type - handled separately)
  const activeSubtitle = subtitles.find(
    (s) => currentTime >= s.start && currentTime < s.end && s.type !== 'cta'
  );

  // Check if we're in CTA time
  const isCtaTime = currentTime >= totalDuration - 4;

  return (
    <AbsoluteFill style={{ fontFamily, background: theme.bg }}>
      {/* Cinematic Background */}
      <CinematicBackground
        type={backgroundType}
        src={backgroundSrc}
        frame={frame}
        fps={fps}
      />

      {/* Audio */}
      <Audio src={audioSrc} />

      {/* Topic Badge - Always visible */}
      <TopicBadge
        topic={topic}
        frame={frame}
        fps={fps}
      />

      {/* Hook Display - First 3.5 seconds */}
      <HookDisplay
        hook={hook}
        frame={frame}
        fps={fps}
        primaryColor={primaryColor}
      />

      {/* Main Subtitle Area */}
      <div
        style={{
          position: "absolute",
          bottom: layout.safe.bottom + 60,
          left: layout.safe.left,
          right: layout.safe.right,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {activeSubtitle && !isCtaTime && (
          <SubtitleDisplay
            key={`${activeSubtitle.start}-${activeSubtitle.text}`}
            subtitle={activeSubtitle}
            currentTime={currentTime}
            frame={frame}
            fps={fps}
            primaryColor={primaryColor}
            accentColor={accentColor}
          />
        )}
      </div>

      {/* CTA - Last 4 seconds */}
      <CTADisplay
        cta={cta}
        frame={frame}
        fps={fps}
        totalDuration={totalDuration}
        accentColor={accentColor}
      />

      {/* Progress Indicator */}
      <ProgressIndicator
        frame={frame}
        fps={fps}
        durationInFrames={durationInFrames}
      />

      {/* CSS Keyframes for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.2); }
          }
        `}
      </style>
    </AbsoluteFill>
  );
};

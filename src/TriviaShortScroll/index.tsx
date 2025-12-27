/**
 * TriviaShortScroll - Enhanced scrolling trivia with hooks & effects
 * Based on short-video-guideline.md best practices
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
import { loadDefaultJapaneseParser } from "budoux";
import { TriviaShortScrollProps } from "./types";

const parser = loadDefaultJapaneseParser();

const { fontFamily } = loadFont();

// ============================================
// LAYOUT - Safe zones per guideline
// ============================================
const layout = {
  canvas: { width: 1080, height: 1920 },
  safe: {
    top: 150,      // Platform UI
    bottom: 400,   // Caption area
    left: 60,
    right: 100,    // Buttons
  },
};

// ============================================
// THEME - Eye-catching colors
// ============================================
const theme = {
  // Primary accent (gold for hooks & highlights)
  gold: '#FFD700',
  goldGlow: 'rgba(255, 215, 0, 0.8)',
  // Secondary accent (coral for CTA & warnings)
  coral: '#FF6B6B',
  coralGlow: 'rgba(255, 107, 107, 0.8)',
  // Text colors
  white: '#FFFFFF',
  textPrimary: 'rgba(255, 255, 255, 0.95)',
  // Background
  darkOverlay: 'rgba(0, 0, 0, 0.6)',
  glassBackground: 'rgba(0, 0, 0, 0.4)',
  // Gradients
  topGradient: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
  bottomGradient: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)',
};

// ============================================
// TIMING CONSTANTS
// ============================================
const HOOK_DURATION_FRAMES = 60; // 2 seconds at 30fps
const CTA_START_OFFSET = 90;     // Start CTA 3 seconds before end

// ============================================
// BACKGROUND with subtle Ken Burns effect
// ============================================
const Background: React.FC<{
  type: 'video' | 'image';
  src: string;
  frame: number;
  durationInFrames: number;
}> = ({ type, src, frame, durationInFrames }) => {
  // Gentle zoom only (no pan to avoid jitter)
  const scale = interpolate(
    frame,
    [0, durationInFrames],
    [1.0, 1.08],
    { extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) }
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "-5%",
          left: "-5%",
          width: "110%",
          height: "110%",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {type === 'video' ? (
          <Video src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted loop />
        ) : (
          <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>
      {/* Dark overlay for text readability */}
      <div style={{ position: "absolute", inset: 0, background: theme.darkOverlay }} />
      {/* Top gradient */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 300, background: theme.topGradient }} />
      {/* Bottom gradient */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 500, background: theme.bottomGradient }} />
    </div>
  );
};

// ============================================
// TOPIC BADGE - Category indicator
// ============================================
const TopicBadge: React.FC<{
  topic: string;
  frame: number;
  fps: number;
}> = ({ topic, frame, fps }) => {
  const enterProgress = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });

  return (
    <div
      style={{
        position: "absolute",
        top: layout.safe.top + 20,
        left: layout.safe.left,
        opacity: enterProgress,
        transform: `translateX(${interpolate(enterProgress, [0, 1], [-50, 0])}px)`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          background: `linear-gradient(135deg, ${theme.gold}20, ${theme.gold}40)`,
          border: `2px solid ${theme.gold}`,
          borderRadius: 30,
          backdropFilter: "blur(10px)",
        }}
      >
        <span style={{ fontSize: 24 }}>💡</span>
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: theme.gold,
            textShadow: `0 0 20px ${theme.goldGlow}`,
          }}
        >
          {topic}
        </span>
      </div>
    </div>
  );
};

// ============================================
// ANIMATED HOOK - First 3 seconds, attention grabber
// ============================================
const AnimatedHook: React.FC<{
  text: string;
  frame: number;
  fps: number;
  primaryColor: string;
}> = ({ text, frame, fps, primaryColor }) => {
  // Only show during first 3 seconds
  if (frame > HOOK_DURATION_FRAMES) return null;

  // Entrance animation
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  // Pulse animation
  const pulsePhase = Math.sin((frame / fps) * Math.PI * 4);
  const pulseScale = 1 + pulsePhase * 0.03;

  // Exit fade
  const exitOpacity = interpolate(
    frame,
    [HOOK_DURATION_FRAMES - 20, HOOK_DURATION_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Glow intensity animation
  const glowIntensity = interpolate(
    frame,
    [0, 15, 30, 45, 60],
    [0, 1, 0.7, 1, 0.8],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        opacity: exitOpacity,
      }}
    >
      {/* Background blur during hook */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at center, ${primaryColor}30 0%, transparent 70%)`,
          opacity: enterProgress,
        }}
      />

      {/* Hook text */}
      <div
        style={{
          transform: `scale(${enterProgress * pulseScale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: theme.white,
            textShadow: `
              0 0 ${40 * glowIntensity}px ${primaryColor},
              0 0 ${80 * glowIntensity}px ${primaryColor}80,
              0 4px 20px rgba(0,0,0,0.8)
            `,
            letterSpacing: 4,
          }}
        >
          {text}
        </div>

        {/* Underline decoration */}
        <div
          style={{
            margin: "20px auto 0",
            width: interpolate(enterProgress, [0, 1], [0, 200]),
            height: 6,
            background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
            borderRadius: 3,
            boxShadow: `0 0 30px ${primaryColor}`,
          }}
        />
      </div>
    </div>
  );
};

// ============================================
// BUDOUX TEXT - Japanese line breaking
// ============================================
const BudouXText: React.FC<{
  text: string;
  style?: React.CSSProperties;
}> = ({ text, style }) => {
  const segments = parser.parse(text);
  return (
    <span style={style}>
      {segments.map((segment, i) => (
        <span key={i} style={{ display: "inline-block" }}>
          {segment}
        </span>
      ))}
    </span>
  );
};

// ============================================
// ENHANCED PARSED TEXT - Keywords & Numbers with effects
// ============================================
const ParsedText: React.FC<{
  text: string;
  primaryColor: string;
  isVisible: boolean;
  entryProgress: number;
}> = ({ text, primaryColor, isVisible, entryProgress }) => {
  // Pattern: **keyword** or numbers with units
  const regex = /(\*\*[^*]+\*\*)|(\d+[%％倍個人年日秒分時万億円つ]?)/g;
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
        const delay = i * 0.05;
        const partProgress = Math.max(0, Math.min(1, (entryProgress - delay) * 2));

        if (part.type === 'keyword') {
          // Keywords: Yellow/Gold background box with pop animation
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                position: "relative",
                transform: `scale(${0.8 + partProgress * 0.2})`,
                opacity: 0.5 + partProgress * 0.5,
              }}
            >
              {/* Glow background */}
              <span
                style={{
                  position: "absolute",
                  inset: "-4px -8px",
                  background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}60)`,
                  borderRadius: 8,
                  border: `2px solid ${primaryColor}`,
                  boxShadow: `0 0 20px ${primaryColor}60`,
                }}
              />
              <BudouXText
                text={part.content}
                style={{
                  position: "relative",
                  color: theme.white,
                  fontWeight: 900,
                  textShadow: `0 0 10px ${primaryColor}`,
                }}
              />
            </span>
          );
        }

        if (part.type === 'number') {
          // Numbers: Larger size with coral/red accent
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontSize: "1.4em",
                fontWeight: 900,
                color: theme.coral,
                textShadow: `
                  0 0 20px ${theme.coralGlow},
                  0 2px 10px rgba(0,0,0,0.8)
                `,
                transform: `scale(${0.9 + partProgress * 0.1})`,
                margin: "0 4px",
              }}
            >
              {part.content}
            </span>
          );
        }

        // Regular text
        return <BudouXText key={i} text={part.content} />;
      })}
    </span>
  );
};

// ============================================
// SCROLLING SCRIPT with enhanced visibility
// ============================================
const ScrollingScript: React.FC<{
  script: string;
  frame: number;
  fps: number;
  durationInFrames: number;
  primaryColor: string;
}> = ({ script, frame, fps, durationInFrames, primaryColor }) => {
  // Skip hook period for scroll calculation
  const effectiveFrame = Math.max(0, frame - HOOK_DURATION_FRAMES);
  const effectiveDuration = durationInFrames - HOOK_DURATION_FRAMES - 60; // Leave 2s for CTA

  const lines = script.split('\n').filter(line => line.trim());

  // Calculate scroll
  const lineHeight = 130;
  const totalHeight = lines.length * lineHeight;
  const viewportHeight = layout.canvas.height - layout.safe.top - layout.safe.bottom - 100;
  const scrollDistance = totalHeight + viewportHeight * 0.3;

  const progress = effectiveFrame / effectiveDuration;
  const scrollY = progress * scrollDistance;

  // Don't show during hook
  const showContent = frame > HOOK_DURATION_FRAMES - 30;
  const fadeIn = interpolate(
    frame,
    [HOOK_DURATION_FRAMES - 30, HOOK_DURATION_FRAMES + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (!showContent) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: layout.safe.top + 100,
        bottom: layout.safe.bottom,
        left: layout.safe.left,
        right: layout.safe.right,
        overflow: "hidden",
        opacity: fadeIn,
      }}
    >
      {/* Scrolling content */}
      <div
        style={{
          position: "relative",
          transform: `translateY(${viewportHeight * 0.4 - scrollY}px)`,
        }}
      >
        {lines.map((line, index) => {
          // Calculate line position in viewport
          const lineY = index * lineHeight - scrollY + viewportHeight * 0.4;
          const centerY = viewportHeight * 0.35;
          const distanceFromCenter = Math.abs(lineY - centerY);
          const maxDistance = viewportHeight * 0.4;

          // Opacity & scale based on distance from center
          const visibility = interpolate(
            distanceFromCenter,
            [0, maxDistance * 0.3, maxDistance * 0.6, maxDistance],
            [1, 0.9, 0.5, 0.1],
            { extrapolateRight: "clamp" }
          );

          const scale = interpolate(
            distanceFromCenter,
            [0, maxDistance * 0.5, maxDistance],
            [1.05, 1, 0.95],
            { extrapolateRight: "clamp" }
          );

          // Entry progress for text animations (0 when entering from bottom, 1 at center)
          const entryProgress = interpolate(
            lineY,
            [centerY, viewportHeight],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Check if this is the last line (CTA)
          const isLastLine = index === lines.length - 1;

          return (
            <div
              key={index}
              style={{
                height: lineHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: visibility,
                transform: `scale(${scale})`,
              }}
            >
              <div
                style={{
                  fontSize: isLastLine ? 52 : 64,
                  fontWeight: isLastLine ? 600 : 700,
                  color: isLastLine ? theme.coral : theme.white,
                  textAlign: "center",
                  lineHeight: 1.5,
                  textShadow: isLastLine
                    ? `0 0 30px ${theme.coralGlow}, 0 4px 20px rgba(0,0,0,0.8)`
                    : "0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.5)",
                  padding: "0 20px",
                }}
              >
                <ParsedText
                  text={line}
                  primaryColor={primaryColor}
                  isVisible={visibility > 0.5}
                  entryProgress={entryProgress}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// CTA with pulse animation
// ============================================
const CTAOverlay: React.FC<{
  frame: number;
  fps: number;
  durationInFrames: number;
  text: string;
}> = ({ frame, fps, durationInFrames, text }) => {
  const ctaStartFrame = durationInFrames - CTA_START_OFFSET;

  if (frame < ctaStartFrame) return null;

  const ctaProgress = (frame - ctaStartFrame) / CTA_START_OFFSET;

  // Entrance
  const enterProgress = spring({
    frame: frame - ctaStartFrame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Pulse animation
  const pulsePhase = Math.sin((frame / fps) * Math.PI * 3);
  const pulseScale = 1 + pulsePhase * 0.05;
  const pulseGlow = 20 + pulsePhase * 15;

  return (
    <div
      style={{
        position: "absolute",
        bottom: layout.safe.bottom + 50,
        left: layout.safe.left,
        right: layout.safe.right,
        display: "flex",
        justifyContent: "center",
        opacity: enterProgress,
        transform: `translateY(${interpolate(enterProgress, [0, 1], [50, 0])}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "20px 40px",
          background: `linear-gradient(135deg, ${theme.coral}, ${theme.coral}dd)`,
          borderRadius: 50,
          transform: `scale(${pulseScale})`,
          boxShadow: `
            0 0 ${pulseGlow}px ${theme.coralGlow},
            0 10px 40px rgba(0,0,0,0.5)
          `,
        }}
      >
        <span style={{ fontSize: 32 }}>👆</span>
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: theme.white,
            letterSpacing: 2,
          }}
        >
          {text}
        </span>
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
  primaryColor: string;
}> = ({ frame, durationInFrames, primaryColor }) => {
  const progress = frame / durationInFrames;

  return (
    <div
      style={{
        position: "absolute",
        top: layout.safe.top - 10,
        left: layout.safe.left,
        right: layout.safe.right,
        height: 4,
        background: "rgba(255, 255, 255, 0.2)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}dd)`,
          boxShadow: `0 0 10px ${primaryColor}`,
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
  title,
  script,
  primaryColor = theme.gold,
  topic = "雑学",
  cta = "フォローで毎日お届け",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Extract hook (first line) and rest of script
  const lines = script.split('\n').filter(line => line.trim());
  const hookText = lines[0] || "知ってた？";
  const remainingScript = lines.slice(1).join('\n');

  return (
    <AbsoluteFill style={{ fontFamily, background: "#000" }}>
      {/* Background with Ken Burns */}
      <Background
        type={backgroundType}
        src={backgroundSrc}
        frame={frame}
        durationInFrames={durationInFrames}
      />

      {/* Audio */}
      <Audio src={audioSrc} />

      {/* Progress Bar */}
      <ProgressBar
        frame={frame}
        durationInFrames={durationInFrames}
        primaryColor={primaryColor}
      />

      {/* Topic Badge */}
      <TopicBadge topic={topic} frame={frame} fps={fps} />

      {/* Animated Hook (first 3 seconds) */}
      <AnimatedHook
        text={hookText}
        frame={frame}
        fps={fps}
        primaryColor={primaryColor}
      />

      {/* Title (appears after hook) */}
      {frame > HOOK_DURATION_FRAMES - 30 && (
        <div
          style={{
            position: "absolute",
            top: layout.safe.top + 80,
            left: layout.safe.left,
            right: layout.safe.right,
            opacity: interpolate(
              frame,
              [HOOK_DURATION_FRAMES - 30, HOOK_DURATION_FRAMES + 10],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: theme.white,
              textAlign: "center",
              textShadow: `0 4px 20px rgba(0,0,0,0.8), 0 0 40px ${primaryColor}30`,
            }}
          >
            {title}
          </div>
        </div>
      )}

      {/* Scrolling Script */}
      <ScrollingScript
        script={remainingScript}
        frame={frame}
        fps={fps}
        durationInFrames={durationInFrames}
        primaryColor={primaryColor}
      />

      {/* CTA Overlay */}
      <CTAOverlay
        frame={frame}
        fps={fps}
        durationInFrames={durationInFrames}
        text={cta}
      />
    </AbsoluteFill>
  );
};

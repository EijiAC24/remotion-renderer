import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { loadFont } from "@remotion/google-fonts/NotoSansJP";
import { PodcastShortProps, SubtitleData } from "./types";

// Load Noto Sans JP web font
const { fontFamily } = loadFont();

// ============================================
// LAYOUT SYSTEM - Safe Zone Aware
// ============================================
// Canvas: 1080 x 1920
// Safe zones based on TikTok/Shorts/Reels UI analysis
const layout = {
  canvas: { width: 1080, height: 1920 },
  safe: {
    top: 220,
    bottom: 440,
    left: 60,
    right: 140,
  },
  // Computed values
  get contentWidth() { return this.canvas.width - this.safe.left - this.safe.right; }, // 880
  get contentHeight() { return this.canvas.height - this.safe.top - this.safe.bottom; }, // 1260
  get centerX() { return this.safe.left + this.contentWidth / 2; }, // 500
};

// ============================================
// DESIGN TOKENS - Refined Color Palette
// ============================================
const colors = {
  // Core
  bg: "#0a0a0f",
  surface: "rgba(255, 255, 255, 0.03)",

  // Accent - Warm/Cool pair
  warm: "#ff7b54",      // Coral orange
  warmGlow: "rgba(255, 123, 84, 0.4)",
  cool: "#54d4c6",      // Mint teal
  coolGlow: "rgba(84, 212, 198, 0.4)",

  // Text
  white: "#ffffff",
  textPrimary: "rgba(255, 255, 255, 0.95)",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  textMuted: "rgba(255, 255, 255, 0.4)",

  // Glass
  glass: "rgba(0, 0, 0, 0.6)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
  glassHighlight: "rgba(255, 255, 255, 0.05)",
};

// ============================================
// IMMERSIVE BACKGROUND
// ============================================
const ImmersiveBackground: React.FC<{
  backgroundSrc?: string;
  frame: number;
  fps: number;
  glowScale: number;
  accentColor: string;
}> = ({ backgroundSrc, frame, fps, glowScale, accentColor }) => {
  const duration = fps * 50;
  const zoom = interpolate(frame, [0, duration], [1, 1.15], { extrapolateRight: "clamp" });
  const panX = interpolate(frame, [0, duration], [0, -3], { extrapolateRight: "clamp" });
  const panY = interpolate(frame, [0, duration], [0, -2], { extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Background Image with Ken Burns */}
      {backgroundSrc ? (
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "-15%",
            width: "130%",
            height: "130%",
            transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
          }}
        >
          <Img
            src={backgroundSrc}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 30% 20%, #1a1a2e 0%, ${colors.bg} 70%)`,
          }}
        />
      )}

      {/* Cinematic overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.75) 0%,
            rgba(0, 0, 0, 0.3) 30%,
            rgba(0, 0, 0, 0.25) 50%,
            rgba(0, 0, 0, 0.4) 70%,
            rgba(0, 0, 0, 0.85) 100%
          )`,
        }}
      />

      {/* Audio-reactive accent glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${accentColor} 0%, transparent 60%)`,
          opacity: interpolate(glowScale, [0, 1], [0, 0.35]),
          mixBlendMode: "screen",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)`,
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

// ============================================
// PODCAST BADGE (Top Right)
// ============================================
const PodcastBadge: React.FC<{
  frame: number;
  fps: number;
}> = ({ frame, fps }) => {
  const anim = spring({ frame, fps, config: { damping: 20, stiffness: 120 } });

  return (
    <div
      style={{
        position: "absolute",
        top: layout.safe.top,
        right: layout.safe.right,
        opacity: anim,
        transform: `translateY(${interpolate(anim, [0, 1], [-15, 0])}px)`,
      }}
    >
      <div
        style={{
          background: colors.glassHighlight,
          border: `1px solid ${colors.glassBorder}`,
          borderRadius: 100,
          padding: "8px 20px",
          fontSize: 16,
          fontWeight: 700,
          color: colors.textSecondary,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        PODCAST
      </div>
    </div>
  );
};

// ============================================
// TITLE HEADER (Top)
// ============================================
const TitleHeader: React.FC<{
  titleEn: string;
  titleJp: string;
  frame: number;
  fps: number;
}> = ({ titleEn, titleJp, frame, fps }) => {
  const anim = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 110 } });

  return (
    <div
      style={{
        position: "absolute",
        top: layout.safe.top,
        left: layout.safe.left,
        right: layout.safe.right + 120, // Space for PODCAST badge
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        opacity: anim,
        transform: `translateY(${interpolate(anim, [0, 1], [20, 0])}px)`,
      }}
    >
      {/* Japanese title */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: colors.white,
          lineHeight: 1.3,
          textShadow: "0 2px 20px rgba(0,0,0,0.6)",
        }}
      >
        {titleJp}
      </div>

      {/* English title */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 500,
          color: colors.textSecondary,
          textShadow: "0 2px 12px rgba(0,0,0,0.5)",
        }}
      >
        {titleEn}
      </div>
    </div>
  );
};

// ============================================
// HERO COVER (Center)
// ============================================
const HeroCover: React.FC<{
  coverSrc: string;
  frame: number;
  fps: number;
  glowScale: number;
  isJapanese: boolean;
}> = ({ coverSrc, frame, fps, glowScale, isJapanese }) => {
  const coverAnim = spring({ frame: frame - 5, fps, config: { damping: 18, stiffness: 100 } });

  const pulseScale = interpolate(glowScale, [0, 1], [1, 1.04]);
  const accentColor = isJapanese ? colors.cool : colors.warm;
  const glowColor = isJapanese ? colors.coolGlow : colors.warmGlow;

  // Cover positioning - centered vertically, accounting for title above
  const coverSize = 580;
  const coverTop = layout.safe.top + 120; // Below title

  return (
    <div
      style={{
        position: "absolute",
        top: coverTop,
        left: "50%",
        transform: `translateX(-50%) scale(${coverAnim * pulseScale})`,
        opacity: coverAnim,
        width: coverSize,
        height: coverSize,
      }}
    >
      {/* Glow ring */}
      <div
        style={{
          position: "absolute",
          inset: -20,
          borderRadius: 40,
          background: `conic-gradient(from ${frame * 0.5}deg, ${colors.warm}, ${colors.cool}, ${colors.warm})`,
          filter: `blur(${interpolate(glowScale, [0, 1], [15, 35])}px)`,
          opacity: interpolate(glowScale, [0, 1], [0.3, 0.7]),
        }}
      />

      {/* Shadow */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          borderRadius: 24,
          filter: "blur(30px)",
        }}
      />

      {/* Image container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 24,
          overflow: "hidden",
          border: `2px solid ${colors.glassBorder}`,
        }}
      >
        <Img
          src={coverSrc}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Speaker pill - attached to bottom */}
      <div
        style={{
          position: "absolute",
          bottom: -16,
          left: "50%",
          transform: "translateX(-50%)",
          background: accentColor,
          color: colors.bg,
          fontSize: 18,
          fontWeight: 800,
          padding: "8px 24px",
          borderRadius: 100,
          letterSpacing: 0.5,
          boxShadow: `0 4px 20px ${glowColor}`,
        }}
      >
        {isJapanese ? "Maya" : "Oliver"}
      </div>
    </div>
  );
};

// ============================================
// KEYWORD HIGHLIGHT
// ============================================
const HighlightedText: React.FC<{
  text: string;
  isJapanese: boolean;
}> = ({ text, isJapanese }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  const highlightColor = isJapanese ? colors.cool : colors.warm;

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const keyword = part.slice(2, -2);
          return (
            <span
              key={i}
              style={{
                color: colors.bg,
                background: highlightColor,
                padding: "2px 14px",
                borderRadius: 6,
                marginLeft: 4,
                marginRight: 4,
                fontWeight: 800,
                boxShadow: `0 2px 12px ${highlightColor}50`,
              }}
            >
              {keyword}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

// ============================================
// SUBTITLE DISPLAY - Clean Card Design
// ============================================
const SubtitleDisplay: React.FC<{
  subtitle: SubtitleData & { extendedEnd?: number };
  currentTime: number;
  frame: number;
  fps: number;
}> = ({ subtitle, currentTime, frame, fps }) => {
  const displayEnd = subtitle.extendedEnd ?? subtitle.end;
  const isVisible = currentTime >= subtitle.start && currentTime < displayEnd;
  if (!isVisible) return null;

  const localFrame = (currentTime - subtitle.start) * fps;
  const enterAnim = spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 140 } });

  const hasExtension = subtitle.extendedEnd !== undefined;
  const exitFrame = (displayEnd - currentTime) * fps;
  const exitOpacity = hasExtension ? 1 : interpolate(exitFrame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = Math.min(enterAnim, exitOpacity);
  const isJapanese = subtitle.isJapanese;
  const accentColor = isJapanese ? colors.cool : colors.warm;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${interpolate(enterAnim, [0, 1], [20, 0])}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        width: "100%",
      }}
    >
      {/* Translation - appears above main subtitle */}
      {subtitle.translation && !isJapanese && (
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.cool}20, ${colors.cool}10)`,
            backdropFilter: "blur(16px)",
            border: `1px solid ${colors.cool}40`,
            borderRadius: 12,
            padding: "14px 24px",
            maxWidth: layout.contentWidth - 20,
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: colors.white,
              textAlign: "center",
              lineHeight: 1.4,
              textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            }}
          >
            {subtitle.translation}
          </div>
        </div>
      )}

      {/* Main subtitle - always at fixed bottom position */}
      <div
        style={{
          background: colors.glass,
          backdropFilter: "blur(24px)",
          borderRadius: 16,
          padding: "18px 26px",
          width: "100%",
          maxWidth: layout.contentWidth,
          position: "relative",
          border: `1px solid ${colors.glassBorder}`,
          boxSizing: "border-box",
        }}
      >
        {/* Accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 20,
            right: 20,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            borderRadius: 1,
          }}
        />

        {/* Text */}
        <div
          style={{
            fontSize: isJapanese ? 44 : 46,
            fontWeight: isJapanese ? 500 : 700,
            color: colors.white,
            textAlign: "center",
            lineHeight: 1.45,
            whiteSpace: "pre-wrap",
            wordBreak: "keep-all",
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            marginTop: 6,
          }}
        >
          <HighlightedText text={subtitle.text} isJapanese={isJapanese} />
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const PodcastShort: React.FC<PodcastShortProps> = ({
  audioSrc,
  coverSrc,
  backgroundSrc,
  titleEn,
  titleJp,
  subtitles,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Audio visualization
  const audioData = useAudioData(audioSrc);
  let glowIntensity = 0;
  if (audioData) {
    const visualization = visualizeAudio({
      fps,
      frame,
      audioData,
      numberOfSamples: 16,
    });
    glowIntensity = visualization.reduce((a, b) => a + b, 0) / visualization.length;
  }
  const glowScale = interpolate(glowIntensity, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });

  // Get active subtitle with gap-filling (no flickering)
  const getActiveSubtitle = (): (SubtitleData & { extendedEnd?: number }) | null => {
    // Find subtitle that contains current time (inclusive of end)
    const current = subtitles.find((s) => currentTime >= s.start && currentTime <= s.end);

    if (current) {
      const currentIndex = subtitles.indexOf(current);
      const next = subtitles[currentIndex + 1];
      // Extend to next subtitle if gap is small
      if (next && (next.start - current.end) <= 0.5) {
        return { ...current, extendedEnd: next.start };
      }
      return current;
    }

    // In gap between subtitles - show previous if gap is small
    const past = subtitles.filter((s) => s.end < currentTime);
    const future = subtitles.filter((s) => s.start > currentTime);

    if (past.length > 0 && future.length > 0) {
      const last = past[past.length - 1];
      const next = future[0];
      const gapDuration = next.start - last.end;

      // If gap is small, extend previous subtitle
      if (gapDuration <= 1.0 && (currentTime - last.end) < gapDuration) {
        return { ...last, extendedEnd: next.start };
      }
    }

    return null;
  };

  const activeSubtitle = getActiveSubtitle();
  const isJapanese = activeSubtitle?.isJapanese ?? false;
  const accentColor = isJapanese ? colors.coolGlow : colors.warmGlow;

  return (
    <AbsoluteFill style={{ fontFamily, background: colors.bg }}>
      {/* Background */}
      <ImmersiveBackground
        backgroundSrc={backgroundSrc}
        frame={frame}
        fps={fps}
        glowScale={glowScale}
        accentColor={accentColor}
      />

      {/* Audio */}
      <Audio src={audioSrc} />

      {/* PODCAST Badge (Top Right) */}
      <PodcastBadge frame={frame} fps={fps} />

      {/* Title Header (Top Left) */}
      <TitleHeader
        titleEn={titleEn}
        titleJp={titleJp}
        frame={frame}
        fps={fps}
      />

      {/* Hero Cover (Center) */}
      <HeroCover
        coverSrc={coverSrc}
        frame={frame}
        fps={fps}
        glowScale={glowScale}
        isJapanese={isJapanese}
      />

      {/* Subtitles - below cover */}
      <div
        style={{
          position: "absolute",
          top: layout.safe.top + 120 + 580 + 50, // title + cover + gap
          left: layout.safe.left,
          right: layout.safe.right,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {activeSubtitle && (
          <SubtitleDisplay
            key={activeSubtitle.start}
            subtitle={activeSubtitle}
            currentTime={currentTime}
            frame={frame}
            fps={fps}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

import { Composition, staticFile } from "remotion";
import { PodcastShort } from "./PodcastShort";
import { SubtitleData } from "./PodcastShort/types";
import { TriviaShort } from "./TriviaShort";
import { SubtitleSegment } from "./TriviaShort/types";
import { TriviaShortScroll } from "./TriviaShortScroll";
import { Trivia2 } from "./Trivia2";
import { WordTimestamp } from "./Trivia2/types";

// Default props for preview
const defaultSubtitles: SubtitleData[] = [
  { start: 0, end: 3.2, text: "I thought so.\nIt's massive news.", translation: "やっぱりね\n大きなニュースだもんね", isJapanese: false },
  { start: 3.6, end: 9.39, text: "The comedy duo Takuro was officially\n**crowned champion** of the M1 Grand Prix 2025.", translation: "お笑いコンビのTakuroが\nM-1グランプリ2025の王者に輝いたんだ", isJapanese: false },
  { start: 10.3, end: 11.6, text: "It was quite a spectacle.", translation: "本当に素晴らしい光景だったよ", isJapanese: false },
  { start: 11.89, end: 13.2, text: "本当にすごかった", translation: null, isJapanese: true },
  { start: 13.89, end: 16.7, text: "優勝したっていう時\n単に won じゃなくて", translation: null, isJapanese: true },
  { start: 16.7, end: 19.6, text: "**crowned champion** って\n言うとかっこいいね", translation: null, isJapanese: true },
  { start: 20.1, end: 21.2, text: "どういうニュアンスなの", translation: null, isJapanese: true },
  { start: 20.8, end: 23.8, text: "It sounds much more prestigious,\ndoesn't it?", translation: "もっと格式高い感じがするよね", isJapanese: false },
  { start: 24.2, end: 29.8, text: "To be **crowned champion** means to be officially\nrecognised as the winner of a major competition.", translation: "crowned champion は大きな大会の勝者として\n公式に認められることを意味するんだ", isJapanese: false },
  { start: 30.19, end: 34.89, text: "Imagine a king getting a crown.\nIt emphasises the glory of the victory.", translation: "王様が冠を授かるのを想像してみて\n勝利の栄光を強調する言葉なんだよ", isJapanese: false },
  { start: 35.1, end: 35.5, text: "なるほど", translation: null, isJapanese: true },
  { start: 36.19, end: 39.6, text: "王冠を授かるような\n栄光ある優勝って感じだね", translation: null, isJapanese: true },
];

// Default props for Trivia2 preview (トリビアの泉スタイル)
// "カメレオンは...(2秒沈黙)...興奮すると色が変わる" (Algenib, 淡々と)
const defaultTrivia2Words: WordTimestamp[] = [
  // Part 1: カメレオンは (0.16 - 1.18)
  { word: "カ", start: 0.16, end: 0.4 },
  { word: "メ", start: 0.4, end: 0.56 },
  { word: "レ", start: 0.56, end: 0.72 },
  { word: "オ", start: 0.72, end: 0.84 },
  { word: "ン", start: 0.84, end: 1.0 },
  { word: "は", start: 1.0, end: 1.18 },
  // [2秒の沈黙: 1.18 - 3.61]
  // Part 2: 興奮すると色が変わる (3.61 - 6.03)
  { word: "興", start: 3.61, end: 3.95 },
  { word: "奮", start: 3.95, end: 4.41 },
  { word: "する", start: 4.41, end: 4.73 },
  { word: "と", start: 4.73, end: 4.95 },
  { word: "色", start: 4.95, end: 5.25 },
  { word: "が", start: 5.25, end: 5.47 },
  { word: "変", start: 5.47, end: 5.75 },
  { word: "わ", start: 5.75, end: 5.93 },
  { word: "る", start: 5.93, end: 6.03 },
];

// Default props for TriviaShort preview
const defaultTriviaSubtitles: SubtitleSegment[] = [
  { start: 0, end: 3, text: "これ知ってる？", type: "hook" },
  { start: 3.5, end: 8, text: "実は**99%**の人が知らない\n「OK」の本当の由来", type: "intro" },
  { start: 8, end: 14, text: "1839年のアメリカで\n**oll korrect**という\nスペルミスから生まれました", type: "point" },
  { start: 14, end: 20, text: "**all correct**を\nわざと間違えて書く遊びが\n当時流行っていたんです", type: "point" },
  { start: 20, end: 26, text: "これが**185年**以上\n世界中で使われる言葉に", type: "point" },
  { start: 26, end: 30, text: "フォローして続きを見てね", type: "cta" },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PodcastShort"
        component={PodcastShort}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => {
          // Calculate duration from subtitles (last subtitle end time + 1 second buffer)
          const lastSubtitle = props.subtitles[props.subtitles.length - 1];
          const duration = lastSubtitle ? Math.ceil(lastSubtitle.end) + 1 : 45;
          return {
            durationInFrames: duration * 30,
          };
        }}
        defaultProps={{
          audioSrc: "",
          coverSrc: "",
          backgroundSrc: null,
          titleEn: "M-1 Winner: Crowned Champion",
          titleJp: "M-1優勝！「栄冠に輝く」の英語表現",
          subtitles: defaultSubtitles,
          isWidescreen: false,
          audioOffset: 0,
        }}
      />

      <Composition
        id="TriviaShort"
        component={TriviaShort}
        durationInFrames={30 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          audioSrc: staticFile("audio.mp3"),
          backgroundType: "image" as const,
          backgroundSrc: staticFile("cover.jpg"),
          topic: "言葉の雑学",
          hook: "これ知ってる？",
          subtitles: defaultTriviaSubtitles,
          primaryColor: "#FFD700",
          accentColor: "#FF6B6B",
          cta: "フォローして続きを見てね",
        }}
      />

      <Composition
        id="TriviaShortScroll"
        component={TriviaShortScroll}
        durationInFrames={369}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          audioSrc: staticFile("trivia-audio.wav"),
          backgroundType: "video" as const,
          backgroundSrc: "https://videos.pexels.com/video-files/4453005/4453005-hd_1080_1920_30fps.mp4",
          title: "バナナは実はベリー",
          script: `これ知ってる？

**バナナ**は植物学的に
**ベリー**の仲間なんです

逆に**イチゴ**は
ベリーじゃないんだって

分類の基準は
**種の位置**らしい

ちょっと不思議だよね`,
          primaryColor: "#FFD700",
          topic: "雑学",
          cta: "フォローで毎日お届け",
        }}
      />

      <Composition
        id="Trivia2"
        component={Trivia2}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => {
          // 最後の単語の終了時間 + SFX遅延 + CTA表示(0.5s) + 余韻(2s)
          const lastWord = props.words[props.words.length - 1];
          const sfxDuration = props.sfxDuration ?? 0.5;
          const endTime = lastWord ? lastWord.end + sfxDuration : 0;
          const totalDuration = endTime + 0.5 + 2; // CTA + 余韻
          return {
            durationInFrames: Math.ceil(totalDuration * 30),
          };
        }}
        defaultProps={{
          audioSrc: staticFile("trivia2-test.wav"),
          sfxSrc: staticFile("sfx-bell.wav"),
          backgroundType: "video" as const,
          backgroundSrc: "https://videos.pexels.com/video-files/13980043/13980043-hd_1080_1920_30fps.mp4",
          words: defaultTrivia2Words,
          sfxDuration: 0.5,
          sfxVolume: 0.5,
          audioVolume: 1.0,
          cta: "フォローで毎日お届け",
        }}
      />
    </>
  );
};

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
// "スペースシャトルは...(2秒沈黙)...100％液体燃料である"
const defaultTrivia2Words: WordTimestamp[] = [
  // Part 1: スペースシャトルは
  { word: "ス", start: 0.89, end: 1.11 },
  { word: "ペ", start: 1.11, end: 1.29 },
  { word: "ー", start: 1.29, end: 1.37 },
  { word: "ス", start: 1.37, end: 1.51 },
  { word: "シ", start: 1.51, end: 1.59 },
  { word: "ャ", start: 1.59, end: 1.71 },
  { word: "ト", start: 1.71, end: 1.81 },
  { word: "ル", start: 1.81, end: 1.99 },
  { word: "は", start: 1.99, end: 2.09 },
  // [2秒の沈黙]
  // Part 2: 100％液体燃料である
  { word: "1", start: 4.84, end: 5.06 },
  { word: "0", start: 5.06, end: 5.80 },
  { word: "0", start: 5.98, end: 6.52 },
  { word: "％", start: 6.52, end: 6.76 },
  { word: "液", start: 6.76, end: 7.04 },
  { word: "体", start: 7.04, end: 7.28 },
  { word: "燃", start: 7.28, end: 7.44 },
  { word: "料", start: 7.44, end: 7.62 },
  { word: "で", start: 7.62, end: 7.72 },
  { word: "あ", start: 7.72, end: 7.82 },
  { word: "る", start: 7.82, end: 7.92 },
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
          // ナレーション終了1秒後にへぇー開始、そこから3秒で動画終了
          const lastWord = props.words[props.words.length - 1];
          const sfxDuration = props.sfxDuration ?? 0.5;
          const lastWordEnd = lastWord ? lastWord.end : 0;
          const totalDuration = sfxDuration + lastWordEnd + 1.0 + 3.0;
          return {
            durationInFrames: Math.ceil(totalDuration * 30),
          };
        }}
        defaultProps={{
          audioSrc: staticFile("trivia2-test.wav"),
          sfxSrc: staticFile("sfx-bell.wav"),
          heeSfxSrc: staticFile("sfx-hee-multi.mp3"),
          backgroundType: "video" as const,
          backgroundSrc: "https://videos.pexels.com/video-files/31425591/13404967_1080_1920_30fps.mp4",
          words: defaultTrivia2Words,
          sfxDuration: 0.5,
          sfxVolume: 0.5,
          heeSfxVolume: 0.8,
          audioVolume: 1.0,
          cta: "フォローで毎日お届け",
          description: "スペースシャトルは、固体燃料ロケットブースターと液体燃料メインエンジンの組み合わせで打ち上げられますが、実はメインエンジン自体も100%液体燃料で動いています。この液体燃料は極低温に冷却された液体水素と液体酸素で、非常に高い推進力を生み出します。",
        }}
      />
    </>
  );
};

import { Composition } from "remotion";
import { PodcastShort } from "./PodcastShort";
import { SubtitleData } from "./PodcastShort/types";

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
    </>
  );
};

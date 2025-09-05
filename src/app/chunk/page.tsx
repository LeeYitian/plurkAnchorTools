// import Image from next/image;
import VersionDetail from "@/app/chunk/components/VersionDetail";
import ChunkArea from "./features/ChunkArea";

export default function Chunk() {
  return (
    <div className="max-w-xl px-4 xl:px-0 mx-auto mt-[calc(115px+var(--spacing)*7)] md:mt-[calc(70px+var(--spacing)*7)]">
      <h3 className="text-main mb-4 font-bold">
        把長文斷成能夠發噗的長度 v1.4.0
      </h3>
      <section>
        <p>
          噗浪一則留言長度為 360 字，包含空格和空行；11 行斷行，不包含空行。
        </p>
        <p>
          此工具目的為把長文切成方便留言的長度。為了文意連貫，斷點不會在段落中間，而會斷在最接近
          360 字且不超過 11 行的最後一個段落。因此切好的每個段落不一定會是剛好
          360 字。
        </p>
        <p>但是如果單一段落超過 360 字，就無可避免會斷在段落中間。</p>
        <p>將需要分段s的文字貼進輸入框，按下「確認」即完成分段。</p>
      </section>
      <ChunkArea />
      <VersionDetail />
    </div>
  );
}

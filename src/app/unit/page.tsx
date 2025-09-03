// import Image from next/image;
import { PlurksDataProvider } from "../../providers/PlurksDataProvider";
import LinkInput from "./components/LinkInput";

export default function Link() {
  return (
    <PlurksDataProvider>
      <div className="max-w-xl px-4 md:px-0 mx-auto mt-[calc(115px+var(--spacing)*7)] md:mt-[calc(75px+var(--spacing)*7)]">
        <h3 className="text-main mb-4 font-bold">
          把完結安價整理成長文 v1.0.0
        </h3>
        <p>
          將想要整理的安價噗（普通噗也可以啦）網址貼進輸入框，按下「取噗」。
        </p>
        <p>
          取回來的噗文會呈現在頁面中，附上選取方框。可直接在方框中勾選需要的留言，或是使用篩選按鈕找到需要的留言後勾選。
        </p>
        <p>
          勾選完所有需要的留言後，可將完成的好讀版（組合文）複製下來。Markdown
          格式適合用在 Notion 等筆記式的網頁，html 則可以用在部分部落格中。
        </p>
        <LinkInput />
      </div>
    </PlurksDataProvider>
  );
}

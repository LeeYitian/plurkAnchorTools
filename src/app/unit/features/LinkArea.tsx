"use client";
import LinkInput from "@/app/unit/components/LinkInput";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import clsx from "clsx";
import { useContext } from "react";

export default function LinkArea() {
  const [{ hasData }] = useContext(PlurksDataContext);

  return (
    <div
      className={clsx("flex flex-col md:flex-row gap-2 md:gap-8", {
        "mt-8": !hasData,
      })}
    >
      {!hasData && (
        <section className="flex-[1_0_50%]">
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
        </section>
      )}
      <LinkInput />
    </div>
  );
}

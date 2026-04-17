"use client";
import LinkInput from "@/app/unit/components/LinkInput/LinkInput";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import clsx from "clsx";
import { useContext } from "react";
import VersionDetailUnit from "../components/VersionDetailUnit";

export default function LinkArea() {
  const [{ hasData }] = useContext(PlurksDataContext);

  return (
    <>
      <div
        className={clsx("flex flex-col md:flex-row gap-2 md:gap-8", {
          "mt-8": !hasData,
        })}
      >
        {!hasData && (
          <div className="order-2 md:order-1 flex-[1_0_50%]">
            <section>
              <p>
                將想要整理的安價噗（普通噗也可以啦）網址貼進輸入框，按下「取噗」。
              </p>
              <p>
                取回來的噗文會呈現在頁面中，附上選取方框。可直接在方框中勾選需要的留言，或是使用篩選按鈕找到需要的留言後勾選。
              </p>
              <p>
                勾選完所有需要的留言後，可將完成的好讀版（組合文）複製起來：
              </p>
              <ul>
                <li>複製文字：和手動選取內容並用 Ctrl + C 複製結果接近。</li>
                <li>
                  只複製 Markdown：將內容轉換成 Markdown 格式。
                  <br />
                  （可以看到 ** --等等語法的樣子。Notion 會讀 Markdown 格式）
                </li>
                <li>只複製 HTML：將內容以 HTML 的格式複製起來。</li>
              </ul>
              <p>
                可對已選擇的噗文連點兩下，或是在右鍵下拉選單中選擇「編輯」，進行簡易編輯。編輯紀錄會記錄在當前的瀏覽器中，下一次在
                <b>同一個裝置上的同一個瀏覽器</b>
                ，用同樣的安價噗網址進入會自動帶入之前的選擇紀錄和編輯紀錄。
              </p>
              <p>
                <a
                  className="text-main font-medium"
                  href="https://www.plurk.com/p/3hpbvu5rum"
                  target="_blank"
                >
                  → 詳細使用方式動態展示
                </a>
              </p>
            </section>
          </div>
        )}
        <LinkInput />
      </div>
      {!hasData && <VersionDetailUnit />}
    </>
  );
}

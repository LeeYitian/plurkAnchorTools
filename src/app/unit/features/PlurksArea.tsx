"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext } from "react";
import "./PlurksArea.scss";
import { OWNWER } from "@/types/constants";
import clsx from "clsx";

export default function PlurksArea() {
  const [{ hasData, plurks }] = useContext(PlurksDataContext);
  console.log("plurks", plurks);

  if (!hasData) {
    return null;
  }

  return (
    <div className="w-[49%] overflow-y-auto max-h-[500px] scrollbar relative">
      <div className="flex justify-between items-center px-3 pb-3 sticky top-0 z-1 bg-white">
        <div className="flex items-center text-[0.8rem] text-gray-800 gap-1">
          <input type="checkbox" id="select-all" />
          <label htmlFor="select-all">全選</label>
        </div>
        <div className="flex items-center justify-around gap-2">
          <div className="filterBtn">只看骰點</div>
          <div className="filterBtn">只看噗主</div>
        </div>
      </div>
      {plurks.map((plurk, index) => (
        <div
          key={plurk.id}
          className={clsx("article", {
            "bg-plain/40":
              plurk.handle === OWNWER &&
              plurk.content.includes('class="emoticon"'),
          })}
        >
          <input type="checkbox" />
          <div>
            <div
              className="plurkContent"
              key={plurk.id}
              dangerouslySetInnerHTML={{ __html: plurk.content }}
            />
            {(plurk.handle === OWNWER || index === 0) && (
              <span className="absolute bottom-1 right-1 text-gray-400 text-xs font-extralight scale-[0.9]">
                {OWNWER}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

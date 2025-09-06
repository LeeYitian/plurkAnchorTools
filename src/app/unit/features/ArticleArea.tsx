"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useMemo } from "react";
import "./ArticleArea.scss";
import { DICE_EMOTICON, EMPTY_LINE, OWNER } from "@/types/constants";
import clsx from "clsx";

export default function ArticleArea() {
  const [{ hasData, plurks, selectedPlurksIds }] =
    useContext(PlurksDataContext);

  const selectedPlurks = useMemo(() => {
    return plurks.filter((plurk) => selectedPlurksIds.includes(plurk.id));
  }, [plurks, selectedPlurksIds]);

  return (
    <>
      {hasData && (
        <div className="w-[50%] p-2 border-l-main border-l-3 overflow-y-auto max-h-[calc(100dvh-200px)] scrollbar">
          {selectedPlurks.map((plurk, index, array) => {
            const formattedContent =
              index === array.length - 1
                ? plurk.content
                : plurk.content + EMPTY_LINE;
            return (
              <div
                key={plurk.id}
                className={clsx(
                  "article",
                  plurk.handle === OWNER &&
                    plurk.content.includes(DICE_EMOTICON) && [
                      "text-main",
                      "font-medium",
                    ]
                )}
                dangerouslySetInnerHTML={{ __html: formattedContent }}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

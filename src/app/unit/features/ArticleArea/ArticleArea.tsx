"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useMemo, useRef } from "react";
import "./ArticleArea.scss";
import {
  DICE_EMOTICON,
  EMPTY_LINE,
  EMPTY_LINE_RAW,
  OWNER,
} from "@/types/constants";
import clsx from "clsx";
import CopyBar from "../../components/CopyBar/CopyBar";

export default function ArticleArea() {
  const articleRef = useRef<HTMLDivElement>(null);
  const [{ hasData, plurks, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);

  const selectedPlurks = useMemo(() => {
    return plurks
      .filter((plurk) => selectedPlurksIds.includes(plurk.id))
      .map((plurk, index, array) => {
        const { content, content_raw } = plurk;
        if (index === array.length - 1) {
          return { ...plurk, content: content };
        } else {
          return {
            ...plurk,
            content: content + EMPTY_LINE,
            content_raw: content_raw + EMPTY_LINE_RAW,
          };
        }
      });
  }, [plurks, selectedPlurksIds]);

  return (
    <>
      {hasData && (
        <>
          <div
            ref={articleRef}
            className="w-[50%] p-2 border-l-main border-l-3 overflow-y-auto max-h-[calc(100vh-200px)] max-h-[calc(100dvh-200px)] scrollbar"
          >
            {selectedPlurks.map((plurk) => (
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
                onClick={() => {
                  dispatch({ type: "SCROLL_TO_ID", payload: plurk.id });
                }}
                dangerouslySetInnerHTML={{ __html: plurk.content }}
              />
            ))}
          </div>
          <CopyBar
            selectedPlurks={selectedPlurks}
            articleRef={articleRef.current}
          />
        </>
      )}
    </>
  );
}

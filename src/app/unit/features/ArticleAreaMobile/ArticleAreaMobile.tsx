"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useMemo, useRef } from "react";
import "./ArticleAreaMobile.scss";
import {
  DICE_EMOTICON,
  EMPTY_LINE,
  EMPTY_LINE_RAW,
  OWNER,
} from "@/types/constants";
import clsx from "clsx";
import CopyBarMobile from "@/app/unit/components/CopyBar/CopyBarMobile";

export default function ArticleAreaMobile() {
  const articleRef = useRef<HTMLDivElement>(null);
  const [{ hasData, plurks, selectedPlurksIds }] =
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
          <div ref={articleRef} className="p-2 overflow-y-auto scrollbar">
            {selectedPlurks.map((plurk) => (
              <div
                key={plurk.id}
                className={clsx(
                  "articleMobile",
                  plurk.handle === OWNER &&
                    plurk.content.includes(DICE_EMOTICON) && [
                      "text-main",
                      "font-medium",
                    ]
                )}
                dangerouslySetInnerHTML={{ __html: plurk.content }}
              />
            ))}
          </div>
          <CopyBarMobile
            selectedPlurks={selectedPlurks}
            articleRef={articleRef.current}
          />
        </>
      )}
    </>
  );
}

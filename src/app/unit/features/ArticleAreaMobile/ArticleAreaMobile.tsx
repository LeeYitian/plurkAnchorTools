"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useMemo, useRef, useState } from "react";
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
  const [{ hasData, plurks, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);
  const [showOptions, setShowOptions] = useState<number | null>(null);

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
          <div ref={articleRef} className="pb-[70px] overflow-y-auto scrollbar">
            {selectedPlurks.map((plurk) => (
              <>
                <div
                  key={plurk.id}
                  className={clsx(
                    "articleMobile",
                    plurk.handle === OWNER &&
                      plurk.content.includes(DICE_EMOTICON) && [
                        "text-main",
                        "font-medium",
                      ],
                    { "bg-cute/10": showOptions === plurk.id }
                  )}
                  dangerouslySetInnerHTML={{ __html: plurk.content }}
                  onClick={() => {
                    if (showOptions === plurk.id) {
                      setShowOptions(null);
                    } else {
                      setShowOptions(plurk.id);
                    }
                  }}
                />
                <div
                  className={clsx(
                    "flex justify-end opacity-0 transition-all duration-300",
                    {
                      "opacity-100": showOptions === plurk.id,
                    }
                  )}
                >
                  <button
                    className="px-2 py-1 text-cute text-[0.6rem] border-1 border-cute bg-cute/10 hover:bg-cute/20 active:bg-cute/30"
                    onClick={() => {
                      dispatch({
                        type: "SELECT_PLURKS_IDS",
                        payload: [plurk.id],
                      });
                    }}
                  >
                    取消選取
                  </button>
                </div>
              </>
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

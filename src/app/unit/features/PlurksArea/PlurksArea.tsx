"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { MouseEvent, useContext, useEffect, useRef, useState } from "react";
import "./PlurksArea.scss";
import { DICE_EMOTICON, FILTER_OPTIONS, OWNER } from "@/types/constants";
import clsx from "clsx";
import useFilterPlurks from "@/app/unit/utils/useFilterPlurks";
import useCustomContextMenu, {
  IconContextMenuItem,
} from "@/app/unit/utils/useCustomContextMenu";
import {
  getEmoticonName,
  getLargeSmallEmoticon,
  getSameEmoticon,
  getWinLoseEmoticon,
} from "@/app/unit/utils/getEmoticonName";

const emoticonTypeMap = {
  "(dice)": ["same", "largeSmall"],
  "(dice2)": ["same", "largeSmall"],
  "(dice4)": ["same", "largeSmall"],
  "(dice8)": ["same", "largeSmall"],
  "(dice10)": ["same", "largeSmall"],
  "(dice12)": ["same", "largeSmall"],
  "(dice20)": ["same", "largeSmall"],
  "(digit)": ["same", "largeSmall"],
  "(lots)": ["same"],
  "(bobei)": ["same"],
  "(panties)": ["same"],
  "(slot)": ["same"],
  "(coin)": ["same"],
  "(rock-paper-scissors)": ["same", "winLose"],
  "(bzzz)": ["same"],
};

const noNullArray = (arr: (string | null)[]): arr is string[] => {
  return arr.every((item) => item !== null);
};

export default function PlurksArea() {
  const [{ hasData, plurks, selectedPlurksIds, scrollToId }, dispatch] =
    useContext(PlurksDataContext);
  const { filter, filteredPlurks, setFilter } = useFilterPlurks(
    plurks,
    selectedPlurksIds
  );
  const refs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const { CustomContextMenu, clickOnEmoticon } = useCustomContextMenu();
  const [customContextItemsType, setCustomContextItemsType] = useState([
    "same",
  ]);

  const customContextItems: IconContextMenuItem[] = [
    {
      target: "emoticon",
      label: "取同骰",
      action: ({ iconName, rndnum, plurkId, raw }) => {
        // iconName 用來判斷是否是 slot 或 digit，rndnum 是骰子真實的值， plurkId 判斷從哪個噗文開始往後找， raw 主要是給 digit 用因為 digit 真實的值是 (diceX-XXX)
        if (!plurkId || !noNullArray(rndnum)) return;

        const targetPlurk = getSameEmoticon({
          plurks,
          plurkId,
          iconName,
          rndnum,
          raw,
        });

        if (targetPlurk) {
          handleSelect(targetPlurk.id);
        }
      },
      type: "same",
    },
    {
      target: "emoticon",
      label: "取大",
      action: ({ iconName, rndnum, plurkId, raw }) => {
        if (!plurkId || !noNullArray(rndnum)) return;

        const targetPlurk = getLargeSmallEmoticon({
          plurks,
          plurkId,
          iconName,
          rndnum,
          mode: "large",
          raw,
        });
        if (targetPlurk) {
          handleSelect(targetPlurk.id);
        }
      },
      type: "largeSmall",
    },
    {
      target: "emoticon",
      label: "取小",
      action: ({ iconName, rndnum, plurkId, raw }) => {
        if (!plurkId || !noNullArray(rndnum)) return;

        const targetPlurk = getLargeSmallEmoticon({
          plurks,
          plurkId,
          iconName,
          rndnum,
          mode: "small",
          raw,
        });
        if (targetPlurk) {
          handleSelect(targetPlurk.id);
        }
      },
      type: "largeSmall",
    },
    {
      target: "emoticon",
      label: "取贏",
      action: ({ iconName, rndnum, plurkId }) => {
        if (!plurkId || !noNullArray(rndnum)) return;
        const targetPlurk = getWinLoseEmoticon({
          plurks,
          plurkId,
          iconName,
          rndnum,
          mode: "win",
        });
        if (targetPlurk) {
          handleSelect(targetPlurk.id);
        }
      },
      type: "winLose",
    },
    {
      target: "emoticon",
      label: "取輸",
      action: ({ iconName, rndnum, plurkId }) => {
        if (!plurkId || !noNullArray(rndnum)) return;
        const targetPlurk = getWinLoseEmoticon({
          plurks,
          plurkId,
          iconName,
          rndnum,
          mode: "lose",
        });
        if (targetPlurk) {
          handleSelect(targetPlurk.id);
        }
      },
      type: "winLose",
    },
  ];

  const handleFilterChange = (filterType: string) => {
    setFilter((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const handleSelect = (id: number) => {
    dispatch({ type: "SELECT_PLURKS_IDS", payload: [id] });
  };

  const handleSelectAll = (patch: boolean) => {
    if (patch) {
      dispatch({
        type: "SELECT_PLURKS_IDS",
        payload: filteredPlurks
          .filter((plurk) => !selectedPlurksIds.includes(plurk.id))
          .map((plurk) => plurk.id),
      });
      return;
    }
    const allIds = filteredPlurks.map((plurk) => plurk.id);
    dispatch({ type: "SELECT_PLURKS_IDS", payload: allIds });
  };

  const handleContextMenu = (e: MouseEvent, id: number) => {
    const target = e.target as HTMLElement;
    const emoticon = target.closest("img.emoticon");
    if (!emoticon) return;

    const { iconName, raw } = getEmoticonName(emoticon);
    setCustomContextItemsType(
      emoticonTypeMap[iconName as keyof typeof emoticonTypeMap] || ["same"]
    );

    clickOnEmoticon(e, id, raw);
  };

  useEffect(() => {
    if (scrollToId) {
      const target = refs.current[scrollToId];

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      setTimeout(() => {
        dispatch({ type: "SCROLL_TO_ID", payload: 0 });
      }, 500);
    }
  }, [scrollToId, dispatch]);

  if (!hasData) {
    return null;
  }

  return (
    <>
      <div className="w-[41%] overflow-y-auto max-h-[calc(100vh-200px)] max-h-[calc(100dvh-200px)] scrollbar relative">
        <div className="flex justify-between items-center px-3 pb-3 sticky top-0 z-1 bg-white">
          <div className="flex items-center text-[0.8rem] text-gray-800 gap-1">
            <input
              type="checkbox"
              id="select-all"
              checked={
                filteredPlurks.length > 0 &&
                filteredPlurks.every((plurk) =>
                  selectedPlurksIds.includes(plurk.id)
                )
              }
              onChange={() => {
                const patch = !filteredPlurks.every((plurk) =>
                  selectedPlurksIds.includes(plurk.id)
                );
                handleSelectAll(patch);
              }}
            />
            <label htmlFor="select-all">全選</label>
          </div>
          <div className="flex items-center justify-around gap-2">
            {Object.keys(FILTER_OPTIONS).map((key) => (
              <div
                key={key}
                className={clsx("filterBtn", {
                  active: filter[key],
                })}
                onClick={() => handleFilterChange(key)}
              >
                {FILTER_OPTIONS[key]}
              </div>
            ))}
          </div>
        </div>
        {filteredPlurks.map((plurk, index) => (
          <div
            key={plurk.id}
            ref={(el) => {
              if (el) refs.current[plurk.id] = el;
              else delete refs.current[plurk.id];
            }}
            data-id={plurk.id}
            onContextMenu={(e) => handleContextMenu(e, plurk.id)}
            className={clsx("plurk", {
              "bg-plain/40":
                plurk.handle === OWNER && plurk.content.includes(DICE_EMOTICON),
            })}
          >
            <input
              type="checkbox"
              checked={selectedPlurksIds.includes(plurk.id)}
              onChange={() => {
                handleSelect(plurk.id);
              }}
            />
            <div
              className="plurkContent"
              key={plurk.id}
              dangerouslySetInnerHTML={{ __html: plurk.content }}
            />
            {(plurk.handle === OWNER || index === 0) && (
              <span className="absolute bottom-1 right-1 text-gray-400 text-xs font-extralight scale-[0.9]">
                {OWNER}
              </span>
            )}
          </div>
        ))}
      </div>
      <CustomContextMenu
        menuItems={customContextItems.filter((item) =>
          customContextItemsType.includes(item.type)
        )}
      />
    </>
  );
}

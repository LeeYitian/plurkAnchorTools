"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useEffect, useRef } from "react";
import "./PlurksArea.scss";
import { DICE_EMOTICON, OWNER } from "@/types/constants";
import clsx from "clsx";
import useFilterPlurks from "@/app/unit/utils/useFilterPlurks";

const FILTER_OPTIONS: { [key: string]: string } = {
  onlySelected: "只看已選",
  onlyDice: "只看骰點",
  onlyOwner: "只看噗主",
};

export default function PlurksArea() {
  const [{ hasData, plurks, selectedPlurksIds, scrollToId }, dispatch] =
    useContext(PlurksDataContext);
  const { filter, filteredPlurks, setFilter } = useFilterPlurks(
    plurks,
    selectedPlurksIds
  );

  const refs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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
  );
}

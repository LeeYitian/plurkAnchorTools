"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useState } from "react";
import "./PlurksAreaMobile.scss";
import { DICE_EMOTICON, OWNER } from "@/types/constants";
import clsx from "clsx";
import useFilterPlurks from "@/app/unit/utils/useFilterPlurks";

const FILTER_OPTIONS: { [key: string]: string } = {
  onlySelected: "已選",
  onlyDice: "骰點",
  onlyOwner: "噗主",
};

export default function PlurksAreaMobile() {
  const [{ hasData, plurks, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);
  const [showFullPlurk, setShowFullPlurk] = useState<number | null>(null);
  const { filter, filteredPlurks, setFilter } = useFilterPlurks(
    plurks,
    selectedPlurksIds
  );

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

  if (!hasData) {
    return null;
  }

  return (
    <div className="overflow-y-auto scrollbar max-h-[80vh] max-h-[80dvh] flex-[1_0_auto] p-1 min-h-[300px]">
      <div className="flex justify-between items-center px-3 py-3 sticky -top-1 z-1 bg-white">
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
          className={clsx("plurkMobile", {
            "bg-plain/40":
              plurk.handle === OWNER && plurk.content.includes(DICE_EMOTICON),
          })}
          onClick={() => {
            if (showFullPlurk === plurk.id) {
              setShowFullPlurk(null);
            } else {
              setShowFullPlurk(plurk.id);
            }
          }}
        >
          <input
            type="checkbox"
            checked={selectedPlurksIds.includes(plurk.id)}
            onChange={() => {
              handleSelect(plurk.id);
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className={clsx(
              "plurkContent",
              showFullPlurk === plurk.id && [
                "max-h-none",
                "whitespace-normal",
                "width-initial",
                "text-overflow-visible",
              ]
            )}
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

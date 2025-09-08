"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useMemo, useState } from "react";
import "./PlurksAreaMobile.scss";
import { DICE_EMOTICON, OWNER } from "@/types/constants";
import clsx from "clsx";
import { TPlurkResponse } from "@/types/plurks";

const FILTER_OPTIONS: { [key: string]: string } = {
  onlySelected: "已選",
  onlyDice: "骰點",
  onlyOwner: "噗主",
};

export default function PlurksAreaMobile() {
  const [{ hasData, plurks, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);
  const [filter, setFilter] = useState<{ [key: string]: boolean }>({
    onlyOwner: false,
    onlyDice: false,
    onlySelected: false,
  });
  const [showFullPlurk, setShowFullPlurk] = useState<number | null>(null);

  const handleFilterChange = (filterType: string) => {
    setFilter((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const filterConfig = [
    {
      active: filter.onlySelected,
      rule: (plurk: TPlurkResponse) => selectedPlurksIds.includes(plurk.id),
    },
    {
      active: filter.onlyDice,
      rule: (plurk: TPlurkResponse) =>
        plurk.content.includes(DICE_EMOTICON) && plurk.handle === OWNER,
    },
    {
      active: filter.onlyOwner,
      rule: (plurk: TPlurkResponse, index: number) =>
        plurk.handle === OWNER || index === 0,
    },
  ];

  const filteredPlurks = useMemo(() => {
    // 只取啟用的規則
    const activeRules = filterConfig
      .filter((config) => config.active)
      .map((config) => config.rule);

    return plurks.filter((plurk, index) =>
      activeRules.every((rule) => rule(plurk, index))
    );
  }, [plurks, filter, selectedPlurksIds]);

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
    <div className="overflow-y-auto scrollbar max-h-[80vh] max-h-[80dvh] flex-[1_0_auto] p-1">
      <div className="flex justify-between items-center px-3 py-3 sticky -top-1 z-1 bg-white rounded-t-xl">
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

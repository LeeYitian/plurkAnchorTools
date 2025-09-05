"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useMemo, useState } from "react";
import "./PlurksArea.scss";
import { OWNWER } from "@/types/constants";
import clsx from "clsx";

const FILTER_OPTIONS: { [key: string]: string } = {
  onlyDice: "只看骰點",
  onlyOwner: "只看噗主",
};

export default function PlurksArea() {
  const [{ hasData, plurks, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);
  const [filter, setFilter] = useState<{ [key: string]: boolean }>({
    onlyOwner: false,
    onlyDice: false,
  });

  const handleFilterChange = (filterType: string) => {
    setFilter((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const filteredPlurks = useMemo(() => {
    return plurks.filter((plurk, index) => {
      if (filter.onlyOwner) {
        return plurk.handle === OWNWER || index === 0;
      }
      if (filter.onlyDice) {
        return (
          plurk.content.includes('class="emoticon"') && plurk.handle === OWNWER
        );
      }
      return true;
    });
  }, [plurks, filter]);

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
    <div className="w-[49%] overflow-y-auto max-h-[500px] scrollbar relative">
      <div className="flex justify-between items-center px-3 pb-3 sticky top-0 z-1 bg-white">
        <div className="flex items-center text-[0.8rem] text-gray-800 gap-1">
          <input
            type="checkbox"
            id="select-all"
            checked={filteredPlurks.every((plurk) =>
              selectedPlurksIds.includes(plurk.id)
            )}
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
          className={clsx("article", {
            "bg-plain/40":
              plurk.handle === OWNWER &&
              plurk.content.includes('class="emoticon"'),
          })}
        >
          <input
            type="checkbox"
            checked={selectedPlurksIds.includes(plurk.id)}
            onChange={() => {
              handleSelect(plurk.id);
            }}
          />
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

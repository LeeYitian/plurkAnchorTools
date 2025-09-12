import { DICE_EMOTICON, OWNER } from "@/types/constants";
import { TPlurkResponse } from "@/types/plurks";
import { useMemo, useState } from "react";

export default function useFilterPlurks(
  plurks: TPlurkResponse[],
  selectedPlurksIds: number[]
) {
  const [filter, setFilter] = useState<{ [key: string]: boolean }>({
    onlyOwner: false,
    onlyDice: false,
    onlySelected: false,
  });

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

  return {
    filter,
    setFilter,
    filteredPlurks,
  };
}

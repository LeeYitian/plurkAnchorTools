"use client";

import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useEffect } from "react";
import { indexedDBService } from "@/app/unit/lib/indexDB";

export default function SyncSelectedIds() {
  const [{ hasData, plurk_id, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);
  const { getStoredIds, storeSelectedIds } = indexedDBService();

  useEffect(() => {
    if (!selectedPlurksIds.length) return;
    const updateSelectedIds = async () => {
      await storeSelectedIds({
        storeIds: {
          plurk_id,
          ids: selectedPlurksIds,
        },
      });
    };
    updateSelectedIds();
  }, [selectedPlurksIds, plurk_id]);

  useEffect(() => {
    if (!hasData) return;
    const getSelectedIds = async () => {
      const ids = await getStoredIds(plurk_id);
      if (ids.length) {
        dispatch({ type: "SELECT_PLURKS_IDS", payload: ids });
      }
    };
    getSelectedIds();
  }, [hasData, plurk_id]);
  return null;
}

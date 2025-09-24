"use client";

import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useEffect } from "react";
import useIndexedDB from "../utils/useIndexedDB";

export default function SyncSelectedIds() {
  const [{ hasData, plurk_id, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);
  const { isDBInitialized, getStoredIds, storeSelectedIds } = useIndexedDB();

  useEffect(() => {
    if (!selectedPlurksIds.length || !isDBInitialized) return;
    const updateSelectedIds = async () => {
      await storeSelectedIds({
        storeIds: {
          plurk_id,
          ids: selectedPlurksIds,
        },
      });
    };
    updateSelectedIds();
  }, [selectedPlurksIds, isDBInitialized, plurk_id]);

  useEffect(() => {
    if (!isDBInitialized || !hasData) return;
    const getSelectedIds = async () => {
      const ids = await getStoredIds(plurk_id);
      if (ids.length) {
        dispatch({ type: "SELECT_PLURKS_IDS", payload: ids });
      }
    };
    getSelectedIds();
  }, [isDBInitialized, hasData, plurk_id]);
  return null;
}

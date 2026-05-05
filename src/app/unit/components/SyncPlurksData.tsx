"use client";

import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useEffect } from "react";
import { indexedDBService } from "@/app/unit/lib/indexDB";

//TODO：改善使用 useEffect 的方法（不應該依靠 useEffect？）。確認是否有重複讀寫的問題。
export default function SyncPlurksData() {
  const [{ hasData, plurk_id, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);
  const { getStoredIds, storeSelectedIds, getSavedEditedPlurks } =
    indexedDBService();

  useEffect(() => {
    //第一次進入某則噗文的時候，包含切換噗文
    if (!hasData) return;
    const getSelectedIds = async () => {
      const ids = await getStoredIds(plurk_id);
      if (ids.length) {
        dispatch({ type: "SELECT_PLURKS_IDS", payload: ids });
      }
    };
    const getSavedPlurks = async () => {
      const plurks = await getSavedEditedPlurks(plurk_id);
      dispatch({ type: "SET_EDITED_PLURKS", payload: plurks });
    };
    getSavedPlurks();
    getSelectedIds();
  }, [hasData, plurk_id]);

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

  // useEffect(() => {
  //   if (Object.keys(editedPlurks).length === 0) return;

  //   const updateEditedPlurks = async () => {
  //     const parsedData = Object.entries(editedPlurks).map(([key, value]) => {
  //       const temp = {
  //         plurk_id,
  //         id: parseInt(key),
  //         content: value as string,
  //       };
  //       return temp;
  //     });
  //     await saveEditedPlurks(parsedData);
  //   };
  //   updateEditedPlurks();
  // }, [editedPlurks, plurk_id]);

  return null;
}

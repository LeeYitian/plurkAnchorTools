import { IDBPDatabase } from "idb";
import { useEffect, useRef, useState } from "react";
import { getDB, deleteIndexedDB as deleteDBFunc } from "../lib/indexedDB";

type TSavedEditedPlurks = {
  editedPlurk: { id: number; content: string; plurk_id: number };
};

export default function useIndexedDB() {
  const db = useRef<IDBPDatabase | null>(null);
  const [isDBInitialized, setIsDBInitialized] = useState(false);

  useEffect(() => {
    getDB().then((dbInstance) => {
      db.current = dbInstance;
      setIsDBInitialized(true);
    });
  }, []);

  // const saveOriginalPlurk = async ({
  //   originalPlurk,
  // }: {
  //   originalPlurk: { id: string; content: string };
  // }) => {
  //   if (!db.current) return;
  //   const existed = await db.current.getFromIndex(
  //     "original-plurks",
  //     "id",
  //     originalPlurk.id
  //   );
  //   if (existed) return;
  //   await db.current.put("original-plurks", originalPlurk);
  // };

  const storeSelectedIds = async ({
    storeIds,
  }: {
    storeIds: { plurk_id: number; ids: number[] };
  }) => {
    if (!db.current) return;
    db.current.put("selected-ids", storeIds);
  };

  const getStoredIds = async (plurk_id: number) => {
    if (!db.current) return [];
    const allIds = await db.current.get("selected-ids", plurk_id);
    return allIds?.ids || [];
  };
  const saveEditedPlurk = async ({ editedPlurk }: TSavedEditedPlurks) => {
    if (!db.current) return;
    await db.current.put("edited-plurks", editedPlurk);
  };

  const getSavedEditedPlurks = async () => {
    if (!db.current) return {};
    const result = await db.current.getAllFromIndex("edited-plurks", "id");
    return result.reduce((acc, curr) => {
      acc[curr.id] = curr.content;
      return acc;
    }, {});
  };

  const deleteEditedPlurk = async (id: number) => {
    if (!db.current) return;
    await db.current.delete("edited-plurks", id);
  };
  const getAllPlurkIds = async () => {
    if (!db.current) return [];
    const result = await db.current.getAllKeys("selected-ids");
    return result;
  };

  const deleteIndexedDB = async () => {
    await deleteDBFunc();
    setIsDBInitialized(false);
    db.current = null;
  };

  const deleteSinglePlurkData = async (plurk_id: number) => {
    if (!db.current) return;
    await db.current.delete("selected-ids", plurk_id);

    const tx = db.current.transaction("edited-plurks", "readwrite");
    const allEditedRecords = await tx.store.getAll();
    const editedToDelete: TSavedEditedPlurks["editedPlurk"][] =
      allEditedRecords.filter((record) => record.plurk_id === plurk_id);
    for (const data of editedToDelete) {
      await tx.store.delete(data.id);
    }
    await tx.done;
  };

  return {
    isDBInitialized,
    // saveOriginalPlurk,
    saveEditedPlurk,
    getSavedEditedPlurks,
    deleteEditedPlurk,
    storeSelectedIds,
    getStoredIds,
    getAllPlurkIds,
    deleteIndexedDB,
    deleteSinglePlurkData,
  };
}

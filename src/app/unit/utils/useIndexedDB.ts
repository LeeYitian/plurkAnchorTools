import { DBContext } from "@/providers/IndexedDBProvider";
import { useContext } from "react";

type TSavedEditedPlurks = {
  editedPlurk: { id: number; content: string; plurk_id: number };
};

export default function useIndexedDB() {
  const {
    db,
    isDBInitialized,
    deleteIndexedDB: deleteDBFunc,
  } = useContext(DBContext);

  // const saveOriginalPlurk = async ({
  //   originalPlurk,
  // }: {
  //   originalPlurk: { id: string; content: string };
  // }) => {
  //   if (!db) return;
  //   const existed = await db.getFromIndex(
  //     "original-plurks",
  //     "id",
  //     originalPlurk.id
  //   );
  //   if (existed) return;
  //   await db.put("original-plurks", originalPlurk);
  // };

  const storeSelectedIds = async ({
    storeIds,
  }: {
    storeIds: { plurk_id: number; ids: number[] };
  }) => {
    if (!db) return;
    db.put("selected-ids", storeIds);
  };

  const getStoredIds = async (plurk_id: number) => {
    if (!db) return [];
    const allIds = await db.get("selected-ids", plurk_id);
    return allIds?.ids || [];
  };
  const saveEditedPlurk = async ({ editedPlurk }: TSavedEditedPlurks) => {
    if (!db) return;
    await db.put("edited-plurks", editedPlurk);
  };

  const getSavedEditedPlurks = async () => {
    if (!db) return {};
    const result = await db.getAllFromIndex("edited-plurks", "id");
    return result.reduce((acc, curr) => {
      acc[curr.id] = curr.content;
      return acc;
    }, {});
  };

  const deleteEditedPlurk = async (id: number) => {
    if (!db) return;
    await db.delete("edited-plurks", id);
  };
  const getAllPlurkIds = async () => {
    if (!db) return [];
    const result = await db.getAllKeys("selected-ids");
    return result;
  };

  const deleteIndexedDB = async () => {
    await deleteDBFunc();
  };

  const deleteSinglePlurkData = async (plurk_id: number) => {
    if (!db) return;
    await db.delete("selected-ids", plurk_id);

    const tx = db.transaction("edited-plurks", "readwrite");
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

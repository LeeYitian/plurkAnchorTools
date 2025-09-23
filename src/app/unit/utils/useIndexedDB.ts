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

  /** 儲存每則噗文（plurk_id）被選擇的留言的 id*/
  const storeSelectedIds = async ({
    storeIds,
  }: {
    storeIds: { plurk_id: number; ids: number[] };
  }) => {
    if (!db) return;
    db.put("selected-ids", storeIds);
  };

  /** 取得每則噗文（plurk_id） 被選擇的留言的 id */
  const getStoredIds = async (plurk_id: number) => {
    if (!db) return [];
    const allIds = await db.get("selected-ids", plurk_id);
    return allIds?.ids || [];
  };

  /** 儲存被編輯過的噗文內容，及原本所屬的噗文（plurk_id） */
  const saveEditedPlurk = async ({ editedPlurk }: TSavedEditedPlurks) => {
    if (!db) return;
    await db.put("edited-plurks", editedPlurk);
  };

  /** 取得某則所有被編輯過的噗文內容 */
  const getSavedEditedPlurks = async (plurk_id: number) => {
    if (!db) return {};
    const result = await db.getAllFromIndex(
      "edited-plurks",
      "plurk_id",
      plurk_id
    );
    return result.reduce((acc, curr) => {
      acc[curr.id] = curr.content;
      return acc;
    }, {});
  };

  /** 刪除某一條被編輯過的噗文留言 */
  const deleteEditedPlurk = async (id: number) => {
    if (!db) return;
    await db.delete("edited-plurks", id);
  };

  /** 取得所有曾經使用過的噗文（plurk_id） */
  const getAllPlurkIds = async () => {
    if (!db) return [];
    const result = await db.getAllKeys("selected-ids");
    return result;
  };

  /** 刪除整個 IndexedDB */
  const deleteIndexedDB = async () => {
    await deleteDBFunc();
  };

  /** 刪除某一則噗文（plurk_id）及其所有編輯紀錄 */
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

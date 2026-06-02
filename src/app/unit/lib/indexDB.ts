import { deleteDB, IDBPDatabase, openDB } from "idb";

// Singleton 設計：整個應用共用同一個連線物件，terminated() 在瀏覽器強制斷線時重設。
let dbPromise: Promise<IDBPDatabase> | null = null;

type TSavedEditedPlurk = {
  editedPlurk: { id: number; content: string; plurk_id: number };
};

//TODO: 優化 indexedDB 的使用方法。 edited-plurks 的資料格式？ upgrade version？
const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB("edit-plurks", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("edited-plurks")) {
          const editedStore = db.createObjectStore("edited-plurks", {
            keyPath: "id",
          });
          // editedStore.createIndex("id", "id");
          editedStore.createIndex("plurk_id", "plurk_id");
        }
        // if (!db.objectStoreNames.contains("original-plurks")) {
        //   const originalStore = db.createObjectStore("original-plurks", {
        //     keyPath: "id",
        //   });
        //   originalStore.createIndex("id", "id");
        // }
        if (!db.objectStoreNames.contains("selected-ids")) {
          db.createObjectStore("selected-ids", {
            keyPath: "plurk_id",
          });
        }
      },
      terminated() {
        // 瀏覽器強制中斷連線（例如記憶體不足，或是有人人為刪除 IndexedDB），重設讓下次呼叫重新開啟
        console.log("Database terminated!");
        dbPromise = null;
      },
      // blocking() {
      //   console.log(
      //     "A new version of this page is ready. Please reload or close this tab!"
      //   );
      // },
    });
  }
  return dbPromise;
};

export const indexedDBService = () => ({
  /** 刪除整個 IndexedDB */
  deleteIndexedDB: async () => {
    const db = await getDB();
    if (db) {
      db.close();
      dbPromise = null;
      await deleteDB("edit-plurks");
    }
  },
  /** 儲存每則噗文（plurk_id）被選擇的留言的 id*/
  storeSelectedIds: async ({
    storeIds,
  }: {
    storeIds: { plurk_id: number; ids: number[] };
  }) => {
    const db = await getDB();
    db.put("selected-ids", storeIds);
  },

  /** 取得每則噗文（plurk_id） 被選擇的留言的 id */
  getStoredIds: async (plurk_id: number) => {
    const db = await getDB();
    const allIds = await db.get("selected-ids", plurk_id);
    return allIds?.ids || [];
  },

  /** 儲存被編輯過的噗文內容，及原本所屬的噗文（plurk_id） */
  saveEditedPlurk: async ({ editedPlurk }: TSavedEditedPlurk) => {
    const db = await getDB();
    await db.put("edited-plurks", editedPlurk);
  },

  /** 一次儲存所有從 redis 取得的編輯紀錄按照原本的結構存入*/
  saveEditedPlurks: async (
    editedPlurks: TSavedEditedPlurk["editedPlurk"][],
  ) => {
    const db = await getDB();
    const tx = db.transaction("edited-plurks", "readwrite");
    for (const editedPlurk of editedPlurks) {
      await tx.store.put(editedPlurk);
    }
    await tx.done;
  },

  /** 取得某則噗文下所有被編輯過的內容
   * @returns {Record<string, string>} { id: content }
   */
  getSavedEditedPlurks: async (plurk_id: number) => {
    const db = await getDB();
    const result = await db.getAllFromIndex(
      "edited-plurks",
      "plurk_id",
      plurk_id,
    );
    return result.reduce((acc, curr) => {
      acc[curr.id] = curr.content;
      return acc;
    }, {});
  },

  /** 刪除某一條被編輯過的噗文留言 */
  deleteEditedPlurk: async (id: number) => {
    const db = await getDB();
    await db.delete("edited-plurks", id);
  },

  /** 取得所有曾經使用過的噗文（plurk_id） */
  getAllPlurkIds: async () => {
    const db = await getDB();
    const result = await db.getAllKeys("selected-ids");
    return result;
  },

  /** 刪除某一則噗文（plurk_id）及其所有編輯紀錄 */
  deleteSinglePlurkData: async (plurk_id: number) => {
    const db = await getDB();
    await db.delete("selected-ids", plurk_id);

    const tx = db.transaction("edited-plurks", "readwrite");
    const allEditedRecords = await tx.store.getAll();
    const editedToDelete: TSavedEditedPlurk["editedPlurk"][] =
      allEditedRecords.filter((record) => record.plurk_id === plurk_id);
    for (const data of editedToDelete) {
      await tx.store.delete(data.id);
    }
    await tx.done;
  },
  replaceSinglePlurkData: async ({
    plurk_id,
    selectedPlurksIds,
    editedPlurks,
  }: {
    plurk_id: number;
    selectedPlurksIds: number[];
    editedPlurks: TSavedEditedPlurk["editedPlurk"][];
  }) => {
    const db = await getDB();
    await db.delete("selected-ids", plurk_id);
    const storeIds = { plurk_id, ids: selectedPlurksIds };
    await db.put("selected-ids", storeIds);

    const tx = db.transaction("edited-plurks", "readwrite");
    const allEditedRecords = await tx.store.getAll();
    const editedToDelete: TSavedEditedPlurk["editedPlurk"][] =
      allEditedRecords.filter((record) => record.plurk_id === plurk_id);
    for (const data of editedToDelete) {
      await tx.store.delete(data.id);
    }
    for (const editedPlurk of editedPlurks) {
      await tx.store.put(editedPlurk);
    }
    await tx.done;
  },
});

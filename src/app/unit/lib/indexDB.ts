import { deleteDB, IDBPDatabase, openDB } from "idb";

let dbPromise: Promise<IDBPDatabase> | null = null;

type TSavedEditedPlurks = {
  editedPlurk: { id: number; content: string; plurk_id: number };
};

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
  saveEditedPlurk: async ({ editedPlurk }: TSavedEditedPlurks) => {
    const db = await getDB();
    await db.put("edited-plurks", editedPlurk);
  },

  /** 取得某則所有被編輯過的噗文內容 */
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
    const editedToDelete: TSavedEditedPlurks["editedPlurk"][] =
      allEditedRecords.filter((record) => record.plurk_id === plurk_id);
    for (const data of editedToDelete) {
      await tx.store.delete(data.id);
    }
    await tx.done;
  },
});

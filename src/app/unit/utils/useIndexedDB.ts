import { get } from "http";
import { IDBPDatabase, openDB } from "idb";
import { useEffect, useRef, useState } from "react";

export default function useIndexedDB() {
  const db = useRef<IDBPDatabase | null>(null);
  const [isDBInitialized, setIsDBInitialized] = useState(false);

  useEffect(() => {
    const initializeDB = async () => {
      const database = await openDB("edit-plurks", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("edited-plurks")) {
            const editedStore = db.createObjectStore("edited-plurks", {
              keyPath: "id",
            });
            editedStore.createIndex("id", "id");
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
      });
      db.current = database;
      setIsDBInitialized(true);
    };

    initializeDB();
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
    return allIds.ids || [];
  };
  const saveEditedPlurk = async ({
    editedPlurk,
  }: {
    editedPlurk: { id: number; content: string; plurk_id: number };
  }) => {
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

  return {
    isDBInitialized,
    // saveOriginalPlurk,
    saveEditedPlurk,
    getSavedEditedPlurks,
    deleteEditedPlurk,
    storeSelectedIds,
    getStoredIds,
  };
}

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
          if (!db.objectStoreNames.contains("original-plurks")) {
            const originalStore = db.createObjectStore("original-plurks", {
              keyPath: "id",
            });
            originalStore.createIndex("id", "id");
          }
        },
      });
      db.current = database;
      setIsDBInitialized(true);
    };

    initializeDB();
  }, []);

  const saveOriginalPlurk = async ({
    originalPlurk,
  }: {
    originalPlurk: { id: string; content: string };
  }) => {
    if (!db.current) return;
    const existed = await db.current.getFromIndex(
      "original-plurks",
      "id",
      originalPlurk.id
    );
    if (existed) return;
    await db.current.put("original-plurks", originalPlurk);
  };

  const saveEditedPlurk = async ({
    editedPlurk,
  }: {
    editedPlurk: { id: string; content: string };
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

  return {
    isDBInitialized,
    saveOriginalPlurk,
    saveEditedPlurk,
    getSavedEditedPlurks,
  };
}

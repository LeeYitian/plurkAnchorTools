"use client";

import { deleteDB, IDBPDatabase, openDB } from "idb";
import { createContext, useEffect, useRef, useState } from "react";

export const DBContext = createContext<{
  db: IDBPDatabase | null;
  isDBInitialized: boolean;
  deleteIndexedDB: () => Promise<void>;
}>({ db: null, isDBInitialized: false, deleteIndexedDB: async () => {} });

export const DBProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDBInitialized, setIsDBInitialized] = useState(false);
  const db = useRef<IDBPDatabase | null>(null);

  const initialize = async () => {
    db.current = await openDB("edit-plurks", 1, {
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
      // blocking() {
      //   console.log(
      //     "A new version of this page is ready. Please reload or close this tab!"
      //   );
      // },
    });

    setIsDBInitialized(true);
  };

  const deleteIndexedDB = async () => {
    if (db.current) {
      db.current.close();
      db.current = null;
      await deleteDB("edit-plurks");
      setIsDBInitialized(false);
    }
  };

  useEffect(() => {
    if (isDBInitialized) return;
    initialize();
  }, [isDBInitialized]);

  return (
    <DBContext value={{ db: db.current, isDBInitialized, deleteIndexedDB }}>
      {children}
    </DBContext>
  );
};

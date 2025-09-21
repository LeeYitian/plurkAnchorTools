import { deleteDB, IDBPDatabase, openDB } from "idb";

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("edit-plurks", 1, {
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
      // blocking() {
      //   console.log(
      //     "A new version of this page is ready. Please reload or close this tab!"
      //   );
      // },
    });
  }
  return dbPromise;
}

export async function deleteIndexedDB() {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
    await deleteDB("edit-plurks");
  }
}

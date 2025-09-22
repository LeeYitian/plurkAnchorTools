import { use, useCallback, useContext, useEffect, useState } from "react";
import useIndexedDB from "./useIndexedDB";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { LoadingContext } from "@/providers/LoadingProvider";

export default function useEditPlurks() {
  const [editing, setEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState<Record<string, string>>({});
  const {
    isDBInitialized,
    saveEditedPlurk,
    deleteEditedPlurk,
    getSavedEditedPlurks,
  } = useIndexedDB();
  const [{ plurks }] = useContext(PlurksDataContext);
  const [, setLoading] = useContext(LoadingContext);

  const handleEditClick = useCallback(
    ({ target }: { target: HTMLElement }) => {
      setEditing(true);
      const id = target.id;
      const plurk_id = plurks[0].plurk_id;
      const originalContent = target.innerHTML;

      target.setAttribute("contentEditable", "true");
      target.focus();

      target.addEventListener(
        "blur",
        () => {
          target.removeAttribute("contentEditable");
          const newContent = target.innerHTML;
          setEditing(false);
          if (newContent === originalContent) return;

          saveEditedPlurk({
            editedPlurk: { id: Number(id), content: newContent, plurk_id },
          });

          setEditedRecord((prev) => ({ ...prev, [id]: newContent }));
        },
        { once: true }
      );
    },
    [plurks]
  );

  const handleRestoreClick = useCallback(
    async ({ target }: { target: HTMLElement }) => {
      const id = target.id;
      const originalContent = plurks.find(
        (plurk) => plurk.id.toString() === id
      )?.content;
      if (originalContent) {
        target.innerHTML = originalContent;
        setEditedRecord((prev) => {
          const newRecord = { ...prev };
          delete newRecord[id];
          return newRecord;
        });
        await deleteEditedPlurk(Number(id));
      }
    },
    [plurks]
  );

  useEffect(() => {
    if (!isDBInitialized) return;
    const getDBRecord = async () => {
      setLoading(true);
      const record = await getSavedEditedPlurks();
      setEditedRecord(record);
      setLoading(false);
    };
    getDBRecord();
  }, [isDBInitialized]);

  return { editedRecord, editing, handleEditClick, handleRestoreClick };
}

import { useCallback, useContext, useState } from "react";
import useIndexedDB from "./useIndexedDB";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";

export default function useEditPlurks() {
  const [editing, setEditing] = useState(false);
  const { saveEditedPlurk, deleteEditedPlurk } = useIndexedDB();
  const [{ plurk_id, plurks }, dispatch] = useContext(PlurksDataContext);

  const handleEditClick = useCallback(
    ({ target }: { target: HTMLElement }) => {
      setEditing(true);
      const id = target.id;
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

          dispatch({
            type: "SET_EDITED_PLURKS",
            payload: { [id]: newContent },
          });
        },
        { once: true },
      );
    },
    [plurk_id],
  );

  const handleRestoreClick = useCallback(
    async ({ target }: { target: HTMLElement }) => {
      const id = target.id;
      const originalContent = plurks.find(
        (plurk) => plurk.id.toString() === id,
      )?.content;
      if (originalContent) {
        target.innerHTML = originalContent;
        await deleteEditedPlurk(Number(id));
        dispatch({ type: "RESTORE_EDITED_PLURKS", payload: id });
      }
    },
    [plurks],
  );

  return { editing, handleEditClick, handleRestoreClick };
}

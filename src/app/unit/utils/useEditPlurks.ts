import { useCallback, useContext, useState } from "react";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { indexedDBService } from "@/app/unit/lib/indexDB";

export default function useEditPlurks() {
  const [editing, setEditing] = useState(false);
  const { saveEditedPlurk, deleteEditedPlurk } = indexedDBService();
  const [{ plurk_id, plurks }, dispatch] = useContext(PlurksDataContext);

  const handleEditClick = useCallback(
    ({ target }: { target: HTMLElement }) => {
      setEditing(true);
      const id = target.id;
      const originalContent = target.innerHTML;

      target.setAttribute("contentEditable", "true");
      target.focus();

      const beforeInput = (e: InputEvent) => {
        if (e.inputType === "insertParagraph") {
          e.preventDefault();
          const br = document.createElement("br");
          const dblBr = document.createElement("br");
          dblBr.classList.add("double-br");
          const selection = window.getSelection();
          const range = selection?.getRangeAt(0);
          if (range) {
            range.insertNode(dblBr);
            range.insertNode(br);

            // 移動游標到 <br> 後面
            range.setStartAfter(dblBr);
            range.setEndAfter(dblBr);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }
      };

      target.addEventListener("beforeinput", beforeInput);

      target.addEventListener(
        "blur",
        () => {
          target.removeEventListener("beforeinput", beforeInput);

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

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

      // 攔截 Enter 鍵的預設行為（insertParagraph）
      // Plurk 的段落格式是雙 <br>（第一個是換行，第二個 class="double-br" 是段落標記），故仿照之。

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
          // blur 時才儲存，而不是每次 input 都存：減少 IndexedDB 寫入頻率
          target.removeEventListener("beforeinput", beforeInput);
          target.removeAttribute("contentEditable");
          const newContent = target.innerHTML;
          setEditing(false);

          // 內容沒有變化時不寫入，避免污染編輯紀錄
          if (newContent === originalContent) return;

          saveEditedPlurk({
            editedPlurk: { id: Number(id), content: newContent, plurk_id },
          });

          dispatch({
            type: "SET_EDITED_PLURKS",
            payload: { [id]: newContent },
          });
        },
        // once: true 確保 blur listener 只執行一次，防止重複觸發（例如 focus 在元素間快速切換）
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

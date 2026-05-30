import { useCallback, useEffect, useState } from "react";
import { splitTextUtils } from "@/app/chunk/utils/splitText";
import { checkAuthed, getOrCreateDeviceId } from "@/app/chunk/utils/plurkAuth";
import { CHUNKS_SESSION_KEY } from "@/types/constants";
import PostDialog from "./PostDialog";

type SplitResultProps = {
  splitTexts: string[];
};

const sendBtnStyle =
  "px-2 py-3/10 h-7 bg-main text-white cursor-pointer border-none rounded-md hover:saturate-150";

const copyBtnStyle = {
  default:
    "px-2 py-3/10 h-7 bg-cute text-white cursor-pointer border-none rounded-md hover:saturate-150",
  copied:
    "px-2 py-3/10 h-7 bg-gray-200 text-gray-300 cursor-default border-none rounded-md hover:transform-none",
};

export default function SplitResult({ splitTexts }: SplitResultProps) {
  const { copyParagraph, suggestDeleteCount } = splitTextUtils;
  const [copyIndex, setCopyIndex] = useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chunksToSend, setChunksToSend] = useState<string[]>([]);

  // 從 OAuth 跳轉回來後（server 在網址帶上 from_oauth=1），還原暫存的分段並開啟對話框
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (checkAuthed() && params.get("from_oauth") === "1") {
      // 清除網址上的 param，避免重整時重複觸發
      window.history.replaceState(null, "", window.location.pathname);
      const stored = sessionStorage.getItem(CHUNKS_SESSION_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as string[];
          setChunksToSend(parsed);
          setDialogOpen(true);
        } catch {
          // 格式有誤忽略不執行
        } finally {
          sessionStorage.removeItem(CHUNKS_SESSION_KEY);
        }
      }
    }
  }, []);

  const handleSend = useCallback(() => {
    if (!checkAuthed()) {
      sessionStorage.setItem(CHUNKS_SESSION_KEY, JSON.stringify(splitTexts)); //授權完需要重新取得分段紀錄
      const deviceId = getOrCreateDeviceId();
      window.location.href = `/api/auth/requestToken?deviceid=${deviceId}`; // OAuth 必須讓瀏覽器直接導航
    } else {
      setChunksToSend(splitTexts);
      setDialogOpen(true);
    }
  }, [splitTexts]);

  const handleCopy = async (text: string, index: number) => {
    await copyParagraph(text);
    setCopyIndex([...copyIndex, index]);
  };

  useEffect(() => {
    setCopyIndex([]);
  }, [splitTexts]);

  return (
    <>
      <PostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        chunks={chunksToSend}
      />
      {(splitTexts || chunksToSend).map((text, index, array) => {
        const deleteSuggestion =
          index + 1 < array.length
            ? suggestDeleteCount(text, array[index + 1])
            : null;

        return (
          <div
            key={text}
            className="mt-4 relative bg-cute/20 text-justify flex flex-col justify-between p-4 rounded-xl mx-1/10"
          >
            <p className="mb-2.5 text-[1rem] md:text-[0.9rem] text-gray-900 dark:text-black flex-1 whitespace-pre-line break-all">
              {text}
            </p>
            {deleteSuggestion && (
              <span className="absolute bottom-5 text-[0.9rem] md:text-[0.8rem] font-light text-gray-400">
                {deleteSuggestion > 0
                  ? `想把下一段分配至此，需刪除 ${deleteSuggestion} 字`
                  : "想把下一段分配至此，需刪除 1 行"}
              </span>
            )}
            <div className="flex gap-2 self-end mt-3/10">
              <button className={sendBtnStyle} onClick={handleSend}>
                發送
              </button>
              <button
                className={
                  copyIndex.includes(index)
                    ? copyBtnStyle.copied
                    : copyBtnStyle.default
                }
                onClick={() => handleCopy(text, index)}
              >
                {copyIndex.includes(index) ? "已複製" : "複製"}
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

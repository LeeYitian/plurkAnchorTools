import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { splitTextUtils } from "@/app/chunk/utils/splitText";
import { checkAuthed } from "@/app/chunk/utils/plurkAuth";
import "./SplitResult.scss";

type SplitResultProps = {
  splitTexts: string[];
  onOpenPostDialog: () => void;
  onConfirmOAuth: () => void;
};

const sendBtnStyle =
  "px-2 py-3/10 h-7 bg-plain text-main dark:text-black cursor-pointer rounded-md";

const copyBtnStyle = {
  default:
    "px-2 py-3/10 h-7 bg-cute text-white cursor-pointer border-none rounded-md hover:saturate-150",
  copied:
    "px-2 py-3/10 h-7 bg-gray-200 text-gray-300 cursor-default border-none rounded-md hover:transform-none",
};

export default function SplitResult({
  splitTexts,
  onOpenPostDialog,
  onConfirmOAuth,
}: SplitResultProps) {
  const { copyParagraph, suggestDeleteCount } = splitTextUtils;
  const [copyIndex, setCopyIndex] = useState<number[]>([]);
  const [consentOpen, setConsentOpen] = useState(false);

  const handleSend = useCallback(() => {
    if (!checkAuthed()) {
      setConsentOpen(true);
    } else {
      onOpenPostDialog();
    }
  }, [onOpenPostDialog]);

  const handleConsentConfirm = useCallback(() => {
    setConsentOpen(false);
    onConfirmOAuth();
  }, [onConfirmOAuth]);

  const handleCopy = async (text: string, index: number) => {
    await copyParagraph(text);
    setCopyIndex([...copyIndex, index]);
  };

  useEffect(() => {
    setCopyIndex([]);
  }, [splitTexts]);

  return (
    <>
      <div
        className={clsx(
          "consentDialog",
          consentOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <p className="mb-3 text-base font-bold text-main">噗浪授權</p>
        <p className="mb-6 text-sm leading-relaxed text-gray-600">
          點擊確認後將跳轉至噗浪進行授權。
          <br />
          此行為不會讓本網站取得你的帳號密碼，授權僅用於在選定的噗文中留言。
          <br />
          你可隨時前往噗浪設定取消授權。
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="rounded-md bg-gray-300 text-gray-500 px-4 py-1.5 text-sm"
            onClick={() => setConsentOpen(false)}
          >
            取消
          </button>
          <button
            className="rounded-md bg-cute px-4 py-1.5 text-sm text-white"
            onClick={handleConsentConfirm}
          >
            確認授權
          </button>
        </div>
      </div>

      {splitTexts.map((text, index, array) => {
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
                  ? `刪除 ${deleteSuggestion} 字以調整分段`
                  : "刪除 1 行以調整分段"}
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

import { useState } from "react";
import { splitTextUtils } from "../utils/splitText";

type SplitResultProps = {
  splitTexts: string[];
};

const copyBtnStyle = {
  default:
    "inline mt-3/10 px-2 py-3/10 h-7 self-end bg-cute text-white cursor-pointer border-none rounded-md hover:saturate-150",
  copied:
    "inline mt-3/10 px-2 py-3/10 h-7 self-end bg-gray-200 text-gray-300 cursor-default border-none rounded-md hover:transform-none",
};

export default function SplitResult({ splitTexts }: SplitResultProps) {
  const { copyParagraph, suggestDeleteCount } = splitTextUtils;
  const [copyIndex, setCopyIndex] = useState<number[]>([]);

  const handleCopy = async (text: string, index: number) => {
    await copyParagraph(text);
    setCopyIndex([...copyIndex, index]);
  };

  return (
    <>
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
            <p className="mb-2.5 color-gray-900 flex-1 whitespace-pre-line">
              {text}
            </p>
            {deleteSuggestion && (
              <span className="absolute bottom-5 text-[0.8rem] font-light text-gray-400">
                {deleteSuggestion > 0
                  ? `想把下一段分配至此，需刪除 ${deleteSuggestion} 字`
                  : "想把下一段分配至此，需刪除 1 行"}
              </span>
            )}
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
        );
      })}
    </>
  );
}

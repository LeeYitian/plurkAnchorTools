import { copyUtils } from "../../utils/copy";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { CopyBarProps } from "./CopyBar";
import { EMPTY_LINE_RAW } from "@/types/constants";

const btnStyle =
  "filterBtn bg-light hover:scale-110 justify-center items-center text-center max-h-[35px]";

const COPY_STATUS: { [key: string]: string } = {
  idle: "idle",
  coping: "coping",
  copied: "copied",
};
const copyStatusText = {
  [COPY_STATUS.idle]: "複製文字",
  [COPY_STATUS.coping]: "複製中...",
  [COPY_STATUS.copied]: "已複製",
};

export default function CopyBarActions({
  selectedPlurks,
  editedRecord,
}: CopyBarProps) {
  const [copyStatus, setCopyStatus] = useState(COPY_STATUS.idle);
  const { copyWhatYouSee, copyHTML, copyMarkdown } = copyUtils;

  const nothingToCopy = useMemo(() => {
    return selectedPlurks.length === 0;
  }, [selectedPlurks]);

  const articleToCopy = useMemo(() => {
    const editedIds = Object.keys(editedRecord).map((id) => Number(id));
    const article = selectedPlurks
      .map((plurk) => {
        if (editedIds.includes(plurk.id)) {
          return editedRecord[plurk.id];
        } else {
          return plurk.content;
        }
      })
      .join(EMPTY_LINE_RAW);
    return article;
  }, [selectedPlurks, editedRecord]);

  const btnClassName = clsx(
    btnStyle,
    (nothingToCopy || copyStatus === COPY_STATUS.coping) && [
      "bg-main! text-gray-300 cursor-not-allowed",
    ]
  );

  const handleCopyWhatYouSee = async () => {
    try {
      const htmlString = articleToCopy;

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlString;
      const textString = tempDiv.innerText;
      tempDiv.remove();
      setCopyStatus(COPY_STATUS.coping);
      await copyWhatYouSee({ text: textString, html: htmlString });
      setCopyStatus(COPY_STATUS.copied);

      toast.success(`${copyStatusText[COPY_STATUS.copied]} 文字`);
    } catch (error) {
      console.error("Error copying text:", error);
    } finally {
      setTimeout(() => {
        setCopyStatus(COPY_STATUS.idle);
      }, 500);
    }
  };

  const handleCopyHTML = async () => {
    try {
      const htmlString = articleToCopy;

      setCopyStatus(COPY_STATUS.coping);
      await copyHTML(htmlString);
      setCopyStatus(COPY_STATUS.copied);

      toast.success(`${copyStatusText[COPY_STATUS.copied]} HTML`);
    } catch (error) {
      console.error("Error copying HTML:", error);
    } finally {
      setTimeout(() => {
        setCopyStatus(COPY_STATUS.idle);
      }, 500);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      // const markdownString = selectedPlurks
      //   .map((plurk) => plurk.content_raw)
      //   .join("");
      const markdownString = articleToCopy;

      setCopyStatus(COPY_STATUS.coping);
      await copyMarkdown(markdownString);
      setCopyStatus(COPY_STATUS.copied);

      toast.success(`${copyStatusText[COPY_STATUS.copied]} Markdown`);
    } catch (error) {
      console.error("Error copying Markdown:", error);
    } finally {
      setTimeout(() => {
        setCopyStatus(COPY_STATUS.idle);
      }, 500);
    }
  };

  return (
    <>
      <div className={btnClassName} onClick={() => handleCopyWhatYouSee()}>
        複製文字
      </div>
      <div className={btnClassName} onClick={() => handleCopyMarkdown()}>
        複製 Markdown
      </div>
      <div className={btnClassName} onClick={() => handleCopyHTML()}>
        複製 HTML
      </div>
    </>
  );
}

import { copyUtils } from "../../utils/copy";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EMPTY_LINE_RAW } from "@/types/constants";
import clsx from "clsx";
import { CopyBarProps } from "./CopyBar";

const btnStyle =
  "filterBtn bg-light hover:scale-110 justify-center items-center text-center";

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
  articleRef,
}: CopyBarProps) {
  const [copyStatus, setCopyStatus] = useState(COPY_STATUS.idle);
  const { copyWhatYouSee, copyHTML, copyMarkdown } = copyUtils;
  const nothingToCopy = useMemo(() => {
    return selectedPlurks.length === 0;
  }, [selectedPlurks]);

  const btnClassName = clsx(
    btnStyle,
    (nothingToCopy || copyStatus === COPY_STATUS.coping) && [
      "bg-main! text-gray-300 cursor-not-allowed",
    ]
  );

  const handleCopyWhatYouSee = async () => {
    if (!articleRef?.children) return;
    try {
      const elements = Array.from(articleRef.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement
      );

      const textString = elements
        .map((element) => element.innerText)
        .join(EMPTY_LINE_RAW);
      const htmlString = elements.map((element) => element.innerHTML).join("");

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
      const htmlString = selectedPlurks.map((plurk) => plurk.content).join("");

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
      const markdownString = selectedPlurks
        .map((plurk) => plurk.content)
        .join("");
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

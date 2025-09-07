import { turndownService } from "../lib/turndownService";

/**
 * 跟直接選取文字並使用 ctrl+c 複製的效果一樣。實際上是複製了兩種格式，貼到 word 或其他應用程式時會自動選擇他們想處理的格式
 */
const copyWhatYouSee = ({ text, html }: { text: string; html: string }) => {
  if (navigator.clipboard && window.isSecureContext) {
    const clipboardItem = new ClipboardItem({
      "text/plain": new Blob([text], { type: "text/plain" }),
      "text/html": new Blob([html], { type: "text/html" }),
    });
    return navigator.clipboard.write([clipboardItem]);
  }
};

/**
 * 會用p 標籤把整段文字包起來
 */
const copyHTML = (html: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    const newHtmlString = `<p>${html}</p>`;
    const clipboardItem = new ClipboardItem({
      "text/plain": new Blob([newHtmlString], { type: "text/plain" }),
    });
    return navigator.clipboard.write([clipboardItem]);
  }
};

const copyMarkdown = (markdown: string) => {
  const styledMarkdown = turndownService.turndown(`<p>${markdown}</p>`);

  if (navigator.clipboard && window.isSecureContext) {
    const clipboardItem = new ClipboardItem({
      "text/plain": new Blob([styledMarkdown], { type: "text/plain" }),
    });
    return navigator.clipboard.write([clipboardItem]);
  }
};

export const copyUtils = {
  copyWhatYouSee,
  copyHTML,
  copyMarkdown,
};

/**
 * Plurk 每則留言的限制：
 * - MAX_TEXT_NUM (360)：最多 360 個字元（Plurk 官方限制）
 * - MAX_LINE_NUM (11)：最多 11 個非空行（Plurk 官方限制）
 *
 * 超過任一限制都會被 Plurk 拒絕，因此兩個條件都要同時滿足。
 */
import { MAX_LINE_NUM, MAX_TEXT_NUM } from "@/types/constants";

/**
 * 決定這一段最多可以切到哪裡（字元上限優先，再套用行數上限）。
 *
 * 因為直接截斷會切在段落中間，視覺上很突兀。
 * 找到最接近 360 字的「段落邊界」（\n），讓每一段都是完整的段落。
 * 但如果剩餘文字本來就不超過 360 字，就不需要找邊界，直接拿。
 */
const countText = (needSliceString: string) => {
  const tempString = needSliceString.slice(0, MAX_TEXT_NUM);
  let string = tempString;

  if (
    tempString.length === MAX_TEXT_NUM &&
    needSliceString.length > MAX_TEXT_NUM
  ) {
    string = tempString.slice(0, tempString.lastIndexOf("\n"));
  }

  string = countLineBreak(string);

  return string;
};

/**
 * 套用行數上限：若非空行超過 MAX_LINE_NUM，從尾巴移除多餘的行。
 *
 * Plurk 的行數限制是針對有內容的行，空行（段落之間的換行）不計入。
 * 移除時也要一併移除緊接在內容行後面的空行，保持段落結構正確。
 */
const countLineBreak = (needSliceString: string) => {
  const tempArr = needSliceString.split("\n");
  // 移除尾端空行，避免最後一段多一個空白行影響計算
  if (tempArr[tempArr.length - 1] === "") tempArr.pop();

  const lineCount = tempArr.filter((line) => line !== "").length;
  if (lineCount > MAX_LINE_NUM) {
    for (let i = 0; i < lineCount - MAX_LINE_NUM; i++) {
      if (tempArr[tempArr.length - 1] === "") {
        tempArr.pop();
      }
      tempArr.pop();
    }
  }
  return tempArr.join("\n");
};

/**
 * 主要切段函式：將長文切成多段，每段都符合字元與行數限制。
 *
 * do-while 設計原因：確保至少執行一次，處理文字剛好等於 MAX_TEXT_NUM 的邊界情況。
 * 每次迴圈後跳過段落間的空行（`\n`），讓下一段從非空內容開始。
 */
const countAndSplit = (texts: string) => {
  if (texts.trim().length === 0) return [];

  const paragraphs: string[] = [];
  let needSliceString = texts;

  do {
    // 每次迴圈前移除頭部空行，保持計算基準一致
    const arr = needSliceString.split("\n");
    if (arr[arr.length - 1] === "") arr.pop();
    needSliceString = arr.join("\n");

    const string = countText(needSliceString);
    paragraphs.push(string);

    needSliceString = needSliceString.slice(string.length);
    // 跳過段落間的空行（切完一段後，剩餘文字可能以 \n 開頭）
    if (needSliceString.indexOf("\n") === 0) {
      needSliceString = needSliceString.slice(needSliceString.search(/[^\n]/));
    }
  } while (needSliceString.length > MAX_TEXT_NUM);

  // 最後一段（長度 ≤ MAX_TEXT_NUM，不需再切，直接推入）
  if (needSliceString) {
    paragraphs.push(needSliceString);
  }

  return paragraphs;
};

const copyParagraph = async (paragraph: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(paragraph);
    return true;
  } catch (err) {
    console.log("copy failed", err);
    return false;
  }
};

const suggestDeleteCount = (pre: string, next: string) => {
  const remain = MAX_TEXT_NUM - pre.length;
  const firstOfNext = next.slice(0, next.indexOf("\n")).length;
  return firstOfNext - remain + 3;
};

export const splitTextUtils = {
  countAndSplit,
  copyParagraph,
  suggestDeleteCount,
};

import { MAX_LINE_NUM, MAX_TEXT_NUM } from "@/types/constants";

// const paragraphs: string[] = [];
const countText = (needSliceString: string) => {
  const tempString = needSliceString.slice(0, MAX_TEXT_NUM);
  let string = tempString;

  //360字斷一次
  //如果後方還有文字就改找最接近360字的最後一個斷行的位置
  //如果後方沒有文字了(也就是不會斷在段落中間)就不用重新找斷點
  if (
    tempString.length === MAX_TEXT_NUM &&
    needSliceString.length > MAX_TEXT_NUM
  ) {
    string = tempString.slice(0, tempString.lastIndexOf("\n"));
  }

  string = countLineBreak(string);

  // paragraphs.push(string);

  return string;
};

const countLineBreak = (needSliceString: string) => {
  //去掉最後面的空行
  const tempArr = needSliceString.split("\n");
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

const countAndSplit = (texts: string) => {
  if (texts.trim().length === 0) return [];

  const paragraphs: string[] = [];
  let needSliceString = texts;

  do {
    //去掉最後面的空行
    const arr = needSliceString.split("\n");
    if (arr[arr.length - 1] === "") arr.pop();
    needSliceString = arr.join("\n");

    const string = countText(needSliceString);
    paragraphs.push(string);

    needSliceString = needSliceString.slice(string.length);
    if (needSliceString.indexOf("\n") === 0) {
      needSliceString = needSliceString.slice(needSliceString.search(/[^\n]/));
    }
  } while (needSliceString.length > MAX_TEXT_NUM);

  if (needSliceString) {
    paragraphs.push(needSliceString);
  }

  return paragraphs;
};

const copyParagraph = async (paragraph: string) => {
  try {
    return navigator.clipboard.writeText(paragraph);
  } catch (err) {
    console.log("copy failed", err);
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

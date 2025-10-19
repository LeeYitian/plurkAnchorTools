import {
  Emoticon,
  GetLargeSmallEmoticonType,
  GetSameEmoticonType,
  GetSearchPlurksType,
  GetWinLoseEmoticonType,
} from "@/types/emoticon";

/**
 * 取得表情符號的名稱，因為某些表情符號（如數字骰、拉霸）會沒有 alt 屬性，因此需要從左邊的兄弟節點繼續往外找，直到遇到下一個表情符號為止。且（digit）的 alt 屬性會是（diceX-XXX），所以需要額外紀錄 raw（原始值）。否則大部分的骰子 iconName 和 raw 是相同的。
 */
export const getEmoticonName = (emoticon: Element) => {
  let icon = emoticon;
  const siblings = Array.from(icon.parentElement?.children || []);
  const index = siblings.indexOf(icon);
  const siblingsIcon = siblings
    .slice(0, index)
    .reverse()
    .find((el) => el.getAttribute?.("alt") !== "" && el.nodeName === "IMG");

  if (!icon.getAttribute("alt") && siblingsIcon) {
    icon = siblingsIcon;
  }

  const iconName = icon.getAttribute("alt")?.match(/^\(dice\d+-\d+\)$/)
    ? "(digit)"
    : icon.getAttribute("alt");
  return {
    iconName: iconName as Emoticon,
    raw: icon.getAttribute("alt") || "",
  };
};

/**
 * 取得表情符號的 rndnum 陣列，因為某些表情符號（如數字骰、拉霸）會有多個 rndnum。使用者有可能點到中間的骰子，因此需要從左邊或右邊繼續往外找，直到遇到下一個表情符號為止。
 */
export const getEmoticonRndnum = (emoticon: Element) => {
  const iconName = emoticon.getAttribute("alt")?.match(/^\(dice\d+-\d+\)$/)
    ? "(digit)"
    : emoticon.getAttribute("alt");
  const rndnum = [
    emoticon.getAttribute("rndnum") || emoticon.getAttribute("rnd"),
  ];
  const siblings = Array.from(emoticon.parentElement?.children || []);
  const index = siblings.indexOf(emoticon);

  if (!iconName) {
    let temp = siblings.slice(0, index).reverse();
    let stopIndex =
      temp.findIndex(
        (el) => el.getAttribute?.("alt") !== "" && el.nodeName === "IMG"
      ) + 1;
    for (let i = 0; i < stopIndex; i++) {
      const el = temp[i];
      rndnum.unshift(el.getAttribute("rndnum") || el.getAttribute("rnd"));
    }

    temp = siblings.slice(index + 1);
    stopIndex =
      temp.findIndex(
        (el) => el.getAttribute?.("alt") !== "" && el.nodeName === "IMG"
      ) >= 0
        ? temp.findIndex((el) => el.getAttribute?.("alt") !== "")
        : temp.length;

    for (let i = 0; i < stopIndex; i++) {
      const el = temp[i];
      rndnum.push(el.getAttribute("rndnum") || el.getAttribute("rnd"));
    }
  }

  if (iconName === "(digit)" || iconName === "(slot)") {
    const temp = siblings.slice(index + 1);
    const stopIndex =
      temp.findIndex(
        (el) => el.getAttribute?.("alt") !== "" && el.nodeName === "IMG"
      ) > 0
        ? temp.findIndex((el) => el.getAttribute?.("alt") !== "")
        : temp.length;
    for (let i = 0; i < stopIndex; i++) {
      const el = temp[i];
      rndnum.push(el.getAttribute("rndnum") || el.getAttribute("rnd"));
    }
  }

  return rndnum;
};

const getSearchPlurks = ({
  plurks,
  plurkId,
  iconName,
  raw,
}: GetSearchPlurksType) => {
  return plurks
    .slice(plurks.findIndex((plurk) => plurk.id === parseInt(plurkId)) + 1)
    .filter((plurk) =>
      plurk.content.includes(`alt="${iconName === "(digit)" ? raw : iconName}"`)
    );
};

export const getSameEmoticon = ({
  plurks,
  plurkId,
  iconName,
  rndnum,
  raw,
}: GetSameEmoticonType) => {
  const searchPlurks = getSearchPlurks({ plurks, plurkId, iconName, raw });
  let targetPlurk;

  if (iconName === "(slot)" || iconName === "(digit)") {
    targetPlurk = searchPlurks.find((plurk) => {
      const dom = new DOMParser().parseFromString(plurk.content, "text/html");
      const emoticons = Array.from(dom.querySelectorAll("img.emoticon"));

      return rndnum.every((num, index) => {
        if (index === 0) {
          return emoticons.find(
            (el) =>
              el.getAttribute("alt") === raw &&
              (el.getAttribute("rndnum") === num ||
                el.getAttribute("rnd") === num)
          );
        } else {
          return emoticons.find(
            (el) =>
              el.getAttribute("alt") === "" &&
              (el.getAttribute("rndnum") === num ||
                el.getAttribute("rnd") === num)
          );
        }
      });
    });
  } else {
    targetPlurk = searchPlurks.find((plurk) => {
      return rndnum.every((num) => {
        const dom = new DOMParser().parseFromString(plurk.content, "text/html");
        const emoticons = Array.from(dom.querySelectorAll("img.emoticon"));
        return emoticons.find(
          (el) =>
            el.getAttribute("alt") === iconName &&
            (el.getAttribute("rndnum") === num ||
              el.getAttribute("rnd") === num)
        );
      });
    });
  }
  return targetPlurk;
};

export const getLargeSmallEmoticon = ({
  plurks,
  plurkId,
  iconName,
  rndnum,
  raw,
  mode,
}: GetLargeSmallEmoticonType) => {
  const condition =
    mode === "large"
      ? (a: number, b: number) => a < b
      : (a: number, b: number) => a > b;

  const searchPlurks = getSearchPlurks({ plurks, plurkId, iconName, raw });

  let targetPlurk;
  if ((iconName === "(slot)" || iconName === "(digit)") && rndnum.length > 1) {
    const compareNum = parseInt(rndnum.join(""));

    targetPlurk = searchPlurks.find((plurk) => {
      const dom = new DOMParser().parseFromString(plurk.content, "text/html");

      let emoticons = Array.from(dom.querySelectorAll("img.emoticon"));
      emoticons = emoticons.splice(
        emoticons.findIndex((el) => el.getAttribute("alt") === raw),
        rndnum.length
      );
      const elNum = parseInt(
        emoticons
          .map((el) => el.getAttribute("rndnum") || el.getAttribute("rnd"))
          .join("")
      );
      return elNum && condition(compareNum, elNum);
    });
  } else {
    targetPlurk = searchPlurks.find((plurk) => {
      const dom = new DOMParser().parseFromString(plurk.content, "text/html");
      const sameDices = Array.from(
        dom.querySelectorAll(`img.emoticon[alt="${iconName}"]`)
      );

      return sameDices.some((dice) => {
        const diceRndnum =
          dice.getAttribute("rndnum") || dice.getAttribute("rnd");
        return (
          diceRndnum &&
          rndnum.every(
            (num) => num && condition(parseInt(num), parseInt(diceRndnum))
          )
        );
      });
    });
  }
  return targetPlurk;
};

const rockPaperScissorsRules: {
  win: { [key: string]: string };
  lose: { [key: string]: string };
} = {
  win: {
    rock: "scissors",
    scissors: "paper",
    paper: "rock",
  },
  lose: {
    rock: "paper",
    scissors: "rock",
    paper: "scissors",
  },
};

export const getWinLoseEmoticon = ({
  plurks,
  plurkId,
  iconName,
  rndnum,
  mode,
}: GetWinLoseEmoticonType) => {
  const searchPlurks = getSearchPlurks({ plurks, plurkId, iconName });
  const targetPlurks = searchPlurks.find((plurk) => {
    const dom = new DOMParser().parseFromString(plurk.content, "text/html");
    const sameDices = Array.from(
      dom.querySelectorAll(`img.emoticon[alt="${iconName}"]`)
    );
    return sameDices.some((dice) => {
      const diceRndnum =
        dice.getAttribute("rndnum") || dice.getAttribute("rnd");
      return (
        diceRndnum && diceRndnum === rockPaperScissorsRules[mode][rndnum[0]] // 猜拳骰的 rndnum 一定只有一個
      );
    });
  });

  return targetPlurks;
};

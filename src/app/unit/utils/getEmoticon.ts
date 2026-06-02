/**
 * ## Plurk 骰子和安價的背景知識
 *
 * Plurk 的骰子類表情符號在 HTML 中是 `<img class="emoticon">` 元素，
 * 有幾個關鍵屬性：
 * - `alt`：表情符號名稱，如 `(dice6)`、`(coin)`、`(rock)`。
 *   - 數字骰（digit）的 alt 格式是 `(diceX-NNN)`，X 是骰子面數，NNN 是結果，
 *     本工具統一正規化為 `"(digit)"` 方便型別比對，原始值另存為 `raw`。
 * - `rndnum` / `rnd`：Plurk 伺服器產生的隨機種子，**相同 rndnum = 相同結果**。
 *
 * ## 複合骰子（digit / slot）的特殊結構
 * 數字骰（digit）和拉霸（slot）在 HTML 中會拆成**多個連續的 `<img>`**，
 * 第一個有 alt（標示類型），後面幾個 alt 為空字串（代表額外的位數或轉輪）。
 * 例如三位數骰：`<img alt="(dice3-123)"> <img alt=""> <img alt="">`
 * 因此取得完整結果時，必須向右掃描相鄰的空 alt 兄弟節點。
 *
 * ## 搜尋方向
 * 安價格式是「主持人出題 → 玩家回應含骰子結果」，
 * 因此 getSearchPlurks 只搜尋**當前留言之後**的留言，避免誤判較早的回應。
 */

import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import {
  Emoticon,
  GetLargeSmallEmoticonType,
  GetSameEmoticonType,
  GetSearchPlurksType,
  GetWinLoseEmoticonType,
} from "@/types/emoticon";
import { useContext } from "react";
import { IconContextMenuItem } from "./useCustomContextMenu";

/** 型別收窄輔助：確保陣列中沒有 null，才能安全地傳給需要 string[] 的函式 */
const noNullArray = (arr: (string | null)[]): arr is string[] => {
  return arr.every((item) => item !== null);
};

/**
 * 取得使用者點擊的表情符號名稱（iconName）與原始值（raw）。
 *
 * 數字骰和拉霸的後續 `<img>` alt 為空，無法直接得知類型。
 * 必須向左掃描兄弟節點，找到第一個有 alt 的 `<img>` 才能確定這組骰子的類型。
 *
 * digit 的 alt 是 `(diceX-NNN)`（如 `(dice6-4)`），但型別系統統一用 `"(digit)"` 識別。
 * 在 getSameEmoticon 比對時需要用原始 alt 值（raw）去 DOM 中找到正確的元素。
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
 * 收集一組骰子的所有 rndnum，組成有序陣列。 取得表情符號的 rndnum 陣列，因為某些表情符號（如數字骰、拉霸）會有多個 rndnum。使用者有可能點到中間的骰子，因此需要從左邊或右邊繼續往外找，直到遇到下一個表情符號為止。
 *
 * rndnum vs rnd：Plurk 在不同版本的 HTML 中兩種屬性名稱都出現過，
 * 這裡兩個都取，以防止因版本差異導致取不到值。
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
        (el) => el.getAttribute?.("alt") !== "" && el.nodeName === "IMG",
      ) + 1;
    for (let i = 0; i < stopIndex; i++) {
      const el = temp[i];
      rndnum.unshift(el.getAttribute("rndnum") || el.getAttribute("rnd"));
    }

    temp = siblings.slice(index + 1);
    stopIndex =
      temp.findIndex(
        (el) => el.getAttribute?.("alt") !== "" && el.nodeName === "IMG",
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
        (el) => el.getAttribute?.("alt") !== "" && el.nodeName === "IMG",
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

/**
 * 找出「在當前留言之後」且含有相同類型骰子的留言候選清單。
 */
const getSearchPlurks = ({
  plurks,
  plurkId,
  iconName,
  raw,
}: GetSearchPlurksType) => {
  return plurks
    .slice(plurks.findIndex((plurk) => plurk.id === parseInt(plurkId)) + 1)
    .filter((plurk) =>
      plurk.content.includes(
        `alt="${iconName === "(digit)" ? raw : iconName}"`,
      ),
    );
};

const getSameEmoticon = ({
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
                el.getAttribute("rnd") === num),
          );
        } else {
          return emoticons.find(
            (el) =>
              el.getAttribute("alt") === "" &&
              (el.getAttribute("rndnum") === num ||
                el.getAttribute("rnd") === num),
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
              el.getAttribute("rnd") === num),
        );
      });
    });
  }
  return targetPlurk;
};

/**
 * 找出比當前骰子結果「更大」或「更小」的第一則留言。
 *
 * digit / slot 的大小比較：將多個 rndnum 串接成整數後再比較（例如 [4,2,7] → 427）。
 * 其他骰子（coin、dice6 等）：直接比較單一 rndnum 的數值。
 */
const getLargeSmallEmoticon = ({
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
        rndnum.length,
      );
      const elNum = parseInt(
        emoticons
          .map((el) => el.getAttribute("rndnum") || el.getAttribute("rnd"))
          .join(""),
      );
      return elNum && condition(compareNum, elNum);
    });
  } else {
    targetPlurk = searchPlurks.find((plurk) => {
      const dom = new DOMParser().parseFromString(plurk.content, "text/html");
      const sameDices = Array.from(
        dom.querySelectorAll(`img.emoticon[alt="${iconName}"]`),
      );

      return sameDices.some((dice) => {
        const diceRndnum =
          dice.getAttribute("rndnum") || dice.getAttribute("rnd");
        return (
          diceRndnum &&
          rndnum.every(
            (num) => num && condition(parseInt(num), parseInt(diceRndnum)),
          )
        );
      });
    });
  }
  return targetPlurk;
};

/**
 * 猜拳規則表
 * win[A] = 「能打敗 A 的出拳」，lose[A] = 「會輸給 A 的出拳」。
 * 例：我出 rock → win["rock"] = "paper"（找出能打敗我的那則留言）
 */
const rockPaperScissorsRules: {
  win: { [key: string]: string };
  lose: { [key: string]: string };
} = {
  lose: {
    rock: "scissors",
    scissors: "paper",
    paper: "rock",
  },
  win: {
    rock: "paper",
    scissors: "rock",
    paper: "scissors",
  },
};

const getWinLoseEmoticon = ({
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
      dom.querySelectorAll(`img.emoticon[alt="${iconName}"]`),
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

export default function useGetEmoticon() {
  const [{ plurks }, dispatch] = useContext(PlurksDataContext);

  const handleSelect = (id: number) => {
    dispatch({ type: "SELECT_PLURKS_IDS", payload: [id] });
  };
  const customContextItemsForEmoticon: IconContextMenuItem[] = [
    {
      target: "emoticon",
      label: "取同骰",
      action: ({ iconName, rndnum, plurkId, raw }) => {
        // iconName 用來判斷是否是 slot 或 digit，rndnum 是骰子真實的值， plurkId 判斷從哪個噗文開始往後找， raw 主要是給 digit 用因為 digit 真實的值是 (diceX-XXX)
        if (!plurkId || !noNullArray(rndnum)) return;

        const targetPlurk = getSameEmoticon({
          plurks,
          plurkId,
          iconName,
          rndnum,
          raw,
        });

        if (targetPlurk) {
          handleSelect(targetPlurk.id);
        }
      },
      type: "same",
    },
    {
      target: "emoticon",
      label: "取大",
      action: ({ iconName, rndnum, plurkId, raw }) => {
        if (!plurkId || !noNullArray(rndnum)) return;

        const targetPlurk = getLargeSmallEmoticon({
          plurks,
          plurkId,
          iconName,
          rndnum,
          mode: "large",
          raw,
        });
        if (targetPlurk) {
          handleSelect(targetPlurk.id);
        }
      },
      type: "largeSmall",
    },
    {
      target: "emoticon",
      label: "取小",
      action: ({ iconName, rndnum, plurkId, raw }) => {
        if (!plurkId || !noNullArray(rndnum)) return;

        const targetPlurk = getLargeSmallEmoticon({
          plurks,
          plurkId,
          iconName,
          rndnum,
          mode: "small",
          raw,
        });
        if (targetPlurk) {
          handleSelect(targetPlurk.id);
        }
      },
      type: "largeSmall",
    },
    {
      target: "emoticon",
      label: "取贏",
      action: ({ iconName, rndnum, plurkId }) => {
        if (!plurkId || !noNullArray(rndnum)) return;
        const targetPlurk = getWinLoseEmoticon({
          plurks,
          plurkId,
          iconName,
          rndnum,
          mode: "win",
        });
        if (targetPlurk) {
          handleSelect(targetPlurk.id);
        }
      },
      type: "winLose",
    },
    {
      target: "emoticon",
      label: "取輸",
      action: ({ iconName, rndnum, plurkId }) => {
        if (!plurkId || !noNullArray(rndnum)) return;
        const targetPlurk = getWinLoseEmoticon({
          plurks,
          plurkId,
          iconName,
          rndnum,
          mode: "lose",
        });
        if (targetPlurk) {
          handleSelect(targetPlurk.id);
        }
      },
      type: "winLose",
    },
  ];

  return { customContextItemsForEmoticon };
}

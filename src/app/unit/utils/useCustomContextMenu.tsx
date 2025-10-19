import {
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useEffect,
  useState,
  useMemo,
  MouseEvent,
} from "react";
import {
  ContextMenu,
  ContextMenuItem,
} from "../components/ContextMenu/ContextMenu";
import { DEFAULT_EMOTICONS } from "@/types/constants";
import { Emoticon } from "@/types/emoticon";
import { getEmoticonName, getEmoticonRndnum } from "./getEmoticonName";

export type IconContextMenuItem = {
  target: "emoticon";
  label: string;
  action: (args: {
    iconName: string;
    rndnum: (string | null)[];
    plurkId: string;
    raw: string;
  }) => void;
  type: string;
};

export type TextContextMenuItem = {
  target: "text";
  label: string;
  action: (args: { target: HTMLElement }) => void;
};

type ContextMenuItems = IconContextMenuItem | TextContextMenuItem;

/**
 * 自訂右鍵選單
 * @returns CustomContextMenu 元件：固定為編輯及全部還原兩個選項
 * @returns isOpen 右鍵選單是否開啟
 * @returns openCustomContextMenu 開啟右鍵選單的事件處理函式
 */
export default function useCustomContextMenu() {
  const [state, setState] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    target: HTMLElement | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    target: null,
  });
  const [emoticonData, setEmoticonData] = useState<{
    plurkId: number;
    raw: string;
  }>({ plurkId: 0, raw: "" });

  const openCustomContextMenu: MouseEventHandler = (e) => {
    e.preventDefault();
    setState({
      isOpen: true,
      x: e.pageX,
      y: e.pageY,
      target: e.currentTarget as HTMLElement,
    });
  };

  const openCustomContextMenuTouch: TouchEventHandler = (e) => {
    const target = e.target as HTMLElement;
    setState({
      isOpen: true,
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      target: target.closest(".articleMobile") as HTMLElement,
    });
  };

  const clickOnEmoticon = (e: MouseEvent, plurkId: number, raw: string) => {
    e.preventDefault();

    const target = e.target as HTMLElement;
    const emoticon = target.closest("img.emoticon") as HTMLElement;
    if (!emoticon) return;

    setEmoticonData({ plurkId, raw });
    setState({
      isOpen: true,
      x: e.pageX,
      y: e.pageY,
      target: emoticon,
    });
  };

  const hideContextMenu = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const iconName: Emoticon | null = useMemo(() => {
    if (!state.target || state.target.nodeName !== "IMG") return null;
    return getEmoticonName(state.target).iconName;
  }, [state.target]);

  const rndnum = useMemo(() => {
    if (!state.target || state.target.nodeName !== "IMG") return [];
    return getEmoticonRndnum(state.target);
  }, [state.target]);

  const CustomContextMenu = ({
    menuItems,
  }: {
    menuItems: ContextMenuItems[];
  }) => (
    <ContextMenu position={{ x: state.x, y: state.y }} isOpen={state.isOpen}>
      {iconName && (
        <div className="p-1 flex items-center text-gray-300">
          以
          <img
            className="h-[1.1rem] inline mx-1"
            src={DEFAULT_EMOTICONS[iconName]}
            alt={iconName}
          />
          選擇
        </div>
      )}
      {menuItems.map((item) => (
        <ContextMenuItem
          key={item.label}
          label={item.label}
          action={(e) => {
            e.stopPropagation();
            if (!state.target) return;
            if (item.target === "emoticon" && iconName) {
              item.action({
                iconName,
                rndnum,
                plurkId: emoticonData.plurkId.toString(),
                raw: emoticonData.raw,
              });
            } else if (item.target === "text") {
              item.action({ target: state.target });
            }
          }}
        />
      ))}
    </ContextMenu>
  );

  useEffect(() => {
    if (!state.isOpen) return;
    document.addEventListener("click", hideContextMenu);
    return () => {
      document.removeEventListener("click", hideContextMenu);
    };
  }, [hideContextMenu, state.isOpen]);

  return {
    isOpen: state.isOpen,
    // position: { x: state.x, y: state.y },
    openCustomContextMenu,
    openCustomContextMenuTouch,
    CustomContextMenu,
    clickOnEmoticon,
  };
}

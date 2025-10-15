import clsx from "clsx";
import {
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";

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

  const hideContextMenu = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const CustomContextMenu = ({
    onEdit,
    onRestore,
  }: {
    onEdit: ({ target }: { target: HTMLElement }) => void;
    onRestore: ({ target }: { target: HTMLElement }) => void;
  }) => (
    <div
      className={clsx("contextMenu", { hidden: !state.isOpen })}
      style={{ top: `${state.y}px`, left: `${state.x}px` }}
    >
      <div
        className="contextMenuItem mb-1"
        onClick={(e) => {
          e.stopPropagation();
          if (!state.target) return;
          onEdit({ target: state.target });
          // if (!contextMenuTarget) return;
          // handleEditClick(contextMenuTarget);
        }}
      >
        編輯
      </div>
      <div
        className="contextMenuItem"
        onClick={(e) => {
          e.stopPropagation();
          if (!state.target) return;
          onRestore({ target: state.target });
          // if (!contextMenuTarget) return;
          // handleRestoreClick(contextMenuTarget);
        }}
      >
        全部還原
      </div>
    </div>
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
  };
}

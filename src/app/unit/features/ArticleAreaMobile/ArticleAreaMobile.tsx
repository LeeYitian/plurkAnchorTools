"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import {
  Fragment,
  TouchEventHandler,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./ArticleAreaMobile.scss";
import { EMPTY_LINE, EMPTY_LINE_RAW } from "@/types/constants";
import clsx from "clsx";
import CopyBarMobile from "@/app/unit/components/CopyBar/CopyBarMobile";
import useEditPlurks from "@/app/unit/utils/useEditPlurks";
import useCustomContextMenu, {
  TextContextMenuItem,
} from "@/app/unit/utils/useCustomContextMenu";
import { getCaretPosition } from "@/app/unit/utils/caret";

export default function ArticleAreaMobile() {
  const [{ hasData, plurks, selectedPlurksIds, editedPlurks }, dispatch] =
    useContext(PlurksDataContext);
  const [showOptions, setShowOptions] = useState<number | null>(null);
  const { editing, handleEditClick, handleRestoreClick } = useEditPlurks();
  const {
    isOpen,
    // position: contextMenuPos,
    openCustomContextMenuTouch,
    CustomContextMenu,
  } = useCustomContextMenu();
  const touchTimeout = useRef<NodeJS.Timeout | null>(null);
  const caretPosition = useRef<{ nodeIndex: number; offset: number }>(null);

  const customContextItems: TextContextMenuItem[] = [
    {
      target: "text",
      label: "編輯",
      action: handleEditClick,
    },
    {
      target: "text",
      label: "全部還原",
      action: handleRestoreClick,
    },
  ];

  const selectedPlurks = useMemo(() => {
    return plurks
      .filter((plurk) => selectedPlurksIds.includes(plurk.id))
      .map((plurk, index, array) => {
        const { content, content_raw } = plurk;
        if (index === array.length - 1) {
          return { ...plurk, content: content };
        } else {
          return {
            ...plurk,
            content: content + EMPTY_LINE,
            content_raw: content_raw + EMPTY_LINE_RAW,
          };
        }
      });
  }, [plurks, selectedPlurksIds]);

  const handleTouchStart: TouchEventHandler = (e) => {
    touchTimeout.current = setTimeout(() => {
      if (editing || isOpen) return;
      openCustomContextMenuTouch(e);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current);
      touchTimeout.current = null;
    }
  };

  // 進入 contenteditable 時讓滑鼠游標可以出現在使用者點兩下的位置
  useEffect(() => {
    if (editing && caretPosition.current) {
      const selection = document.getSelection();
      const node = document.querySelector('div[contenteditable="true"]');
      if (selection && node) {
        const range = document.createRange();
        const startNode =
          caretPosition.current.nodeIndex >= 0
            ? node.childNodes[caretPosition.current.nodeIndex]
            : node;

        range.setStart(startNode, caretPosition.current.offset);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [editing]);

  return (
    <>
      {hasData && (
        <>
          <div
            id="articleAreaMobile"
            className="px-1 pt-1 pb-[70px] overflow-y-auto scrollbar"
          >
            {selectedPlurks.length === 0 && (
              <div className=" text-gray-400 mt-10 font-light text-sm text-center">
                點選下方「瀏覽噗文」以新增噗文
              </div>
            )}
            {selectedPlurks.map((plurk) => (
              <Fragment key={plurk.id}>
                <div
                  key={plurk.id}
                  id={plurk.id.toString()}
                  className={clsx(
                    "articleMobile p-1",
                    editedPlurks[plurk.id] && ["border-l-cute border-l-3 "],
                    { "bg-cute/10": showOptions === plurk.id },
                  )}
                  dangerouslySetInnerHTML={{
                    __html: editedPlurks[plurk.id] || plurk.content,
                  }}
                  onClick={() => {
                    if (editing || isOpen) return;

                    if (showOptions === plurk.id) {
                      setShowOptions(null);
                    } else {
                      setShowOptions(plurk.id);
                    }
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onContextMenu={(e) => e.preventDefault()}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    if (editing) return;

                    // 獲取使用者點兩下的位置，之後用來調整游標
                    const range = getCaretPosition(e.clientX, e.clientY);
                    if (!range) return;
                    const nodeIndex = Array.from(
                      e.currentTarget.childNodes,
                    ).indexOf(range!.offsetNode as ChildNode);

                    caretPosition.current = {
                      nodeIndex,
                      offset: range!.offset,
                    };

                    handleEditClick({ target: e.currentTarget });
                  }}
                />
                <div
                  key={`cancel-${plurk.id}`}
                  className={clsx(
                    "flex justify-end opacity-0 transition-all duration-300",
                    {
                      "opacity-100": showOptions === plurk.id,
                    },
                  )}
                >
                  <button
                    className="px-2 py-1 text-cute text-[0.6rem] border-1 border-cute bg-cute/10 hover:bg-cute/20 active:bg-cute/30"
                    onClick={() => {
                      dispatch({
                        type: "SELECT_PLURKS_IDS",
                        payload: [plurk.id],
                      });
                    }}
                  >
                    取消選取
                  </button>
                </div>
              </Fragment>
            ))}
          </div>
          <CopyBarMobile
            selectedPlurks={selectedPlurks}
            editedRecord={editedPlurks}
          />
          <CustomContextMenu menuItems={customContextItems} />
        </>
      )}
    </>
  );
}

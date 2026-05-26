"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import "./ArticleArea.scss";
import {
  EMOTICON_TYPE_MAP,
  EMPTY_LINE,
  EMPTY_LINE_RAW,
} from "@/types/constants";
import clsx from "clsx";
import CopyBar from "@/app/unit/components/CopyBar/CopyBar";
import useCustomContextMenu, {
  TextContextMenuItem,
} from "@/app/unit/utils/useCustomContextMenu";
import useEditPlurks from "@/app/unit/utils/useEditPlurks";
import useGetEmoticon, { getEmoticonName } from "@/app/unit/utils/getEmoticon";
import { getCaretPosition } from "@/app/unit/utils/caret";

export default function ArticleArea() {
  const [{ hasData, plurks, selectedPlurksIds, editedPlurks }, dispatch] =
    useContext(PlurksDataContext);
  const { editing, handleEditClick, handleRestoreClick } = useEditPlurks();
  const {
    isOpen,
    // position: contextMenuPos,
    openCustomContextMenu,
    CustomContextMenu,
    clickOnEmoticon,
  } = useCustomContextMenu();
  const { customContextItemsForEmoticon } = useGetEmoticon();
  const [emoticonCustomContextItemsType, setEmoticonCustomContextItemsType] =
    useState<string[] | null>(null);
  const caretPosition = useRef<{ nodeIndex: number; offset: number }>(null);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const handleDeselectClick = ({ target }: { target: HTMLElement }) => {
    const id = parseInt(target.id);
    dispatch({ type: "SELECT_PLURKS_IDS", payload: [id] });
  };

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
    {
      target: "text",
      label: "取消選取",
      action: handleDeselectClick,
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
            id="articleArea"
            className="w-[58%] p-2 overflow-y-auto max-h-[calc(100vh-200px)] max-h-[calc(100dvh-200px)] scrollbar"
          >
            {selectedPlurks.map((plurk) => (
              <div
                key={plurk.id}
                id={plurk.id.toString()}
                className={clsx(
                  "article",
                  editedPlurks[plurk.id] && ["border-l-cute border-l-3 "],
                )}
                onClick={() => {
                  if (editing || isOpen) return;
                  if (timeout.current) clearTimeout(timeout.current); // 用 timeout 防止 double click 和 click 互相干擾
                  timeout.current = setTimeout(() => {
                    dispatch({ type: "SCROLL_TO_ID", payload: plurk.id });
                  }, 500);
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  if (timeout.current) {
                    clearTimeout(timeout.current);
                  }

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

                  handleEditClick({
                    target: e.currentTarget,
                  });
                }}
                onContextMenu={(e) => {
                  setEmoticonCustomContextItemsType(null);

                  const target = e.target as HTMLElement;
                  const emoticon = target.closest("img.emoticon");

                  if (emoticon) {
                    const { iconName, raw } = getEmoticonName(emoticon);
                    setEmoticonCustomContextItemsType(
                      EMOTICON_TYPE_MAP[
                        iconName as keyof typeof EMOTICON_TYPE_MAP
                      ],
                    );
                    clickOnEmoticon(e, plurk.id, raw);
                  } else {
                    openCustomContextMenu(e);
                  }
                }}
                dangerouslySetInnerHTML={{
                  __html: editedPlurks[plurk.id] || plurk.content,
                }}
              />
            ))}
          </div>
          <CopyBar
            selectedPlurks={selectedPlurks}
            editedRecord={editedPlurks}
          />
          <CustomContextMenu
            menuItems={
              emoticonCustomContextItemsType
                ? customContextItemsForEmoticon.filter((item) =>
                    emoticonCustomContextItemsType.includes(item.type),
                  )
                : customContextItems
            }
          />
        </>
      )}
    </>
  );
}

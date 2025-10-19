"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useMemo, useState } from "react";
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

export default function ArticleArea() {
  const [{ hasData, plurks, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);
  const { editedRecord, editing, handleEditClick, handleRestoreClick } =
    useEditPlurks();
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
                  editedRecord[plurk.id] && ["border-l-cute border-l-3 "]
                )}
                onClick={() => {
                  if (editing || isOpen) return;
                  dispatch({ type: "SCROLL_TO_ID", payload: plurk.id });
                }}
                onDoubleClick={(e) =>
                  handleEditClick({ target: e.currentTarget })
                }
                onContextMenu={(e) => {
                  setEmoticonCustomContextItemsType(null);

                  const target = e.target as HTMLElement;
                  const emoticon = target.closest("img.emoticon");

                  if (emoticon) {
                    const { iconName, raw } = getEmoticonName(emoticon);
                    setEmoticonCustomContextItemsType(
                      EMOTICON_TYPE_MAP[
                        iconName as keyof typeof EMOTICON_TYPE_MAP
                      ]
                    );
                    clickOnEmoticon(e, plurk.id, raw);
                  } else {
                    openCustomContextMenu(e);
                  }
                }}
                dangerouslySetInnerHTML={{
                  __html: editedRecord[plurk.id] || plurk.content,
                }}
              />
            ))}
          </div>
          <CopyBar
            selectedPlurks={selectedPlurks}
            editedRecord={editedRecord}
          />
          <CustomContextMenu
            menuItems={
              emoticonCustomContextItemsType
                ? customContextItemsForEmoticon.filter((item) =>
                    emoticonCustomContextItemsType.includes(item.type)
                  )
                : customContextItems
            }
          />
        </>
      )}
    </>
  );
}
